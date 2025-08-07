/**
 * Rate limiting monitoring and analytics system
 */

import { Redis } from "@upstash/redis";

export interface RateLimitEvent {
  timestamp: number;
  identifier: string; // user:123 or ip:1.2.3.4
  action: string;
  success: boolean;
  remaining: number;
  limit: number;
  isAbuse?: boolean;
  userAgent?: string;
  ip?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface AbusePattern {
  id: string;
  type: 'rapid_requests' | 'distributed_attack' | 'credential_stuffing' | 'scraping';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  identifiers: string[]; // IPs or user IDs involved
  startTime: number;
  endTime?: number;
  requestCount: number;
  actions: string[];
}

let redis: Redis | undefined;

function getRedis(): Redis | null {
  if (!redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis || null;
}

/**
 * Log rate limit event for monitoring
 */
export async function logRateLimitEvent(event: RateLimitEvent): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    const eventKey = `rl:events:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const eventData = {
      ...event,
      timestamp: Date.now(),
    };

    // Store event with TTL of 7 days
    await redis.setex(eventKey, 7 * 24 * 60 * 60, JSON.stringify(eventData));

    // Update metrics counters
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const hour = new Date().getHours();
    
    // Daily metrics
    await redis.hincrby(`rl:metrics:daily:${date}`, 'total_requests', 1);
    if (!event.success) {
      await redis.hincrby(`rl:metrics:daily:${date}`, 'blocked_requests', 1);
    }
    if (event.isAbuse) {
      await redis.hincrby(`rl:metrics:daily:${date}`, 'abuse_attempts', 1);
    }
    
    // Hourly metrics
    await redis.hincrby(`rl:metrics:hourly:${date}:${hour}`, 'total_requests', 1);
    if (!event.success) {
      await redis.hincrby(`rl:metrics:hourly:${date}:${hour}`, 'blocked_requests', 1);
    }
    
    // Action-specific metrics
    await redis.hincrby(`rl:metrics:actions:${event.action}:${date}`, 'requests', 1);
    
    // Set TTL for metric keys (30 days)
    await redis.expire(`rl:metrics:daily:${date}`, 30 * 24 * 60 * 60);
    await redis.expire(`rl:metrics:hourly:${date}:${hour}`, 30 * 24 * 60 * 60);
    await redis.expire(`rl:metrics:actions:${event.action}:${date}`, 30 * 24 * 60 * 60);
    
  } catch (error) {
    console.error("Failed to log rate limit event:", error);
  }
}

/**
 * Detect abuse patterns from recent events
 */
export async function detectAbusePatterns(): Promise<AbusePattern[]> {
  const redis = getRedis();
  if (!redis) return [];

  try {
    const patterns: AbusePattern[] = [];
    const now = Date.now();
    const last10Minutes = now - (10 * 60 * 1000);
    
    // Get recent events
    const keys = await redis.keys('rl:events:*');
    const recentKeys = keys.filter(key => {
      const timestamp = parseInt(key.split(':')[2], 10);
      return timestamp > last10Minutes;
    });

    if (recentKeys.length === 0) return patterns;

    // Get events data
    const events: RateLimitEvent[] = [];
    const eventData = await redis.mget(...recentKeys);
    
    for (const data of eventData) {
      if (data && typeof data === 'string') {
        try {
          events.push(JSON.parse(data));
        } catch {
          // Skip invalid events
        }
      }
    }

    // Pattern 1: Rapid fire requests from same source
    const rapidFireThreshold = 50; // requests per minute
    const identifierCounts = new Map<string, number>();
    
    events.forEach(event => {
      const count = identifierCounts.get(event.identifier) || 0;
      identifierCounts.set(event.identifier, count + 1);
    });

    identifierCounts.forEach((count, identifier) => {
      if (count > rapidFireThreshold) {
        patterns.push({
          id: `rapid_${identifier}_${now}`,
          type: 'rapid_requests',
          severity: count > 100 ? 'critical' : count > 75 ? 'high' : 'medium',
          description: `${count} requests in 10 minutes from ${identifier}`,
          identifiers: [identifier],
          startTime: last10Minutes,
          requestCount: count,
          actions: [...new Set(events.filter(e => e.identifier === identifier).map(e => e.action))],
        });
      }
    });

    // Pattern 2: Distributed attack (many IPs, same action)
    const actionCounts = new Map<string, Set<string>>();
    
    events.forEach(event => {
      if (!event.success && event.ip) {
        const ips = actionCounts.get(event.action) || new Set();
        ips.add(event.ip);
        actionCounts.set(event.action, ips);
      }
    });

    actionCounts.forEach((ips, action) => {
      if (ips.size > 10) { // 10+ different IPs
        patterns.push({
          id: `distributed_${action}_${now}`,
          type: 'distributed_attack',
          severity: ips.size > 50 ? 'critical' : ips.size > 25 ? 'high' : 'medium',
          description: `${ips.size} different IPs attacking ${action} endpoint`,
          identifiers: Array.from(ips).map(ip => `ip:${ip}`),
          startTime: last10Minutes,
          requestCount: events.filter(e => e.action === action && !e.success).length,
          actions: [action],
        });
      }
    });

    // Pattern 3: Scraping behavior (high success rate, regular intervals)
    const successfulRequests = events.filter(e => e.success);
    const scrapingActions = ['PUBLIC_PASTES', 'RAW_ACCESS'];
    
    scrapingActions.forEach(action => {
      const actionEvents = successfulRequests.filter(e => e.action === action);
      const identifierCount = new Map<string, number>();
      
      actionEvents.forEach(event => {
        const count = identifierCount.get(event.identifier) || 0;
        identifierCount.set(event.identifier, count + 1);
      });
      
      identifierCount.forEach((count, identifier) => {
        if (count > 30) { // 30+ successful requests in 10 minutes
          patterns.push({
            id: `scraping_${action}_${identifier}_${now}`,
            type: 'scraping',
            severity: count > 60 ? 'high' : 'medium',
            description: `Potential scraping: ${count} successful ${action} requests from ${identifier}`,
            identifiers: [identifier],
            startTime: last10Minutes,
            requestCount: count,
            actions: [action],
          });
        }
      });
    });

    return patterns;
  } catch (error) {
    console.error("Failed to detect abuse patterns:", error);
    return [];
  }
}

/**
 * Get rate limiting metrics for dashboard
 */
export async function getRateLimitMetrics(days: number = 7): Promise<{
  daily: Record<string, { total: number; blocked: number; abuse: number }>;
  byAction: Record<string, { requests: number; blocked: number }>;
  topAbusers: { identifier: string; requests: number; blocked: number }[];
  recentPatterns: AbusePattern[];
}> {
  const redis = getRedis();
  if (!redis) {
    return {
      daily: {},
      byAction: {},
      topAbusers: [],
      recentPatterns: [],
    };
  }

  try {
    const metrics = {
      daily: {} as Record<string, { total: number; blocked: number; abuse: number }>,
      byAction: {} as Record<string, { requests: number; blocked: number }>,
      topAbusers: [] as { identifier: string; requests: number; blocked: number }[],
      recentPatterns: [] as AbusePattern[],
    };

    // Get daily metrics for the last N days
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      
      const dailyData = await redis.hgetall(`rl:metrics:daily:${date}`) || {};
      metrics.daily[date] = {
        total: parseInt((dailyData.total_requests as string) || '0', 10),
        blocked: parseInt((dailyData.blocked_requests as string) || '0', 10),
        abuse: parseInt((dailyData.abuse_attempts as string) || '0', 10),
      };
    }

    // Get recent abuse patterns
    metrics.recentPatterns = await detectAbusePatterns();

    return metrics;
  } catch (error) {
    console.error("Failed to get rate limit metrics:", error);
    return {
      daily: {},
      byAction: {},
      topAbusers: [],
      recentPatterns: [],
    };
  }
}

/**
 * Clean up old rate limiting data
 */
export async function cleanupRateLimitData(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    const now = Date.now();
    const cutoff = now - (7 * 24 * 60 * 60 * 1000); // 7 days ago

    // Clean up old events
    const eventKeys = await redis.keys('rl:events:*');
    const oldEventKeys = eventKeys.filter(key => {
      const timestamp = parseInt(key.split(':')[2], 10);
      return timestamp < cutoff;
    });

    if (oldEventKeys.length > 0) {
      await redis.del(...oldEventKeys);
      console.log(`Cleaned up ${oldEventKeys.length} old rate limit events`);
    }

    // Clean up old metric keys (older than 30 days)
    const oldMetricCutoff = now - (30 * 24 * 60 * 60 * 1000);
    const metricKeys = await redis.keys('rl:metrics:*');
    
    const oldMetricKeys = metricKeys.filter(key => {
      const parts = key.split(':');
      if (parts.length >= 3) {
        const dateStr = parts[3];
        if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          const date = new Date(dateStr).getTime();
          return date < oldMetricCutoff;
        }
      }
      return false;
    });

    if (oldMetricKeys.length > 0) {
      await redis.del(...oldMetricKeys);
      console.log(`Cleaned up ${oldMetricKeys.length} old metric keys`);
    }
  } catch (error) {
    console.error("Failed to cleanup rate limit data:", error);
  }
}