/**
 * Advanced rate limiting system with tiered limits, abuse detection, and monitoring
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

// Rate limit configurations for different endpoint types
export const RATE_LIMIT_CONFIGS = {
  // Paste creation and modifications
  PASTE_CREATE: {
    ANONYMOUS: { requests: 3, window: "1m" },
    AUTHENTICATED: { requests: 15, window: "1m" },
  },
  PASTE_UPDATE: {
    ANONYMOUS: { requests: 0, window: "1m" }, // Not allowed
    AUTHENTICATED: { requests: 10, window: "1m" },
  },
  PASTE_DELETE: {
    ANONYMOUS: { requests: 0, window: "1m" }, // Not allowed
    AUTHENTICATED: { requests: 20, window: "1m" },
  },
  
  // API endpoints
  URL_CHECK: {
    ANONYMOUS: { requests: 10, window: "1m" },
    AUTHENTICATED: { requests: 30, window: "1m" },
  },
  PUBLIC_PASTES: {
    ANONYMOUS: { requests: 30, window: "1m" },
    AUTHENTICATED: { requests: 60, window: "1m" },
  },
  RAW_ACCESS: {
    ANONYMOUS: { requests: 20, window: "1m" },
    AUTHENTICATED: { requests: 50, window: "1m" },
  },
  
  // Authentication endpoints
  AUTH_ATTEMPT: {
    ANONYMOUS: { requests: 5, window: "5m" }, // 5 attempts per 5 minutes
    AUTHENTICATED: { requests: 10, window: "5m" },
  },
  
  // General API access
  GENERAL_API: {
    ANONYMOUS: { requests: 60, window: "1m" },
    AUTHENTICATED: { requests: 120, window: "1m" },
  },
  
  // Burst allowances (for legitimate high-frequency usage)
  BURST: {
    ANONYMOUS: { requests: 10, window: "10s" },
    AUTHENTICATED: { requests: 30, window: "10s" },
  },
} as const;

// Abuse detection thresholds
export const ABUSE_DETECTION = {
  EXCESSIVE_REQUESTS: {
    threshold: 100, // requests per minute
    banDuration: "10m",
  },
  RAPID_FIRE: {
    threshold: 20, // requests per 10 seconds
    banDuration: "5m",
  },
  SUSPICIOUS_PATTERNS: {
    threshold: 5, // failed attempts
    banDuration: "30m",
  },
} as const;

let redis: Redis | undefined;
const rateLimiters = new Map<string, Ratelimit>();

function initializeRedis() {
  if (!redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
}

function getRateLimiter(config: { requests: number; window: string }, key: string): Ratelimit | null {
  if (!redis) return null;
  
  if (!rateLimiters.has(key)) {
    const limiter = new Ratelimit({
      redis,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      limiter: Ratelimit.slidingWindow(config.requests, config.window as any),
      analytics: true,
      prefix: `rl:${key}`,
    });
    rateLimiters.set(key, limiter);
  }
  
  return rateLimiters.get(key)!;
}

export interface RateLimitResult {
  success: boolean;
  limit?: number;
  remaining?: number;
  reset?: number;
  retryAfter?: number;
  isAbuse?: boolean;
  banExpiry?: number;
}

export interface RateLimitOptions {
  userId?: string | null;
  action: keyof typeof RATE_LIMIT_CONFIGS;
  skipIfRedisUnavailable?: boolean;
  checkAbuse?: boolean;
}

/**
 * Get client IP address from request headers with validation
 */
async function getClientIP(): Promise<string> {
  const headersList = await headers();
  
  // Validate IP address format
  const isValidIP = (ip: string): boolean => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };
  
  // Check if we're behind a trusted proxy (Cloudflare, Vercel, etc.)
  const isTrustedProxy = process.env.NODE_ENV === 'production' && 
                        (process.env.VERCEL_URL || process.env.CF_PAGES);
  
  if (isTrustedProxy) {
    // In production behind trusted proxies, prioritize CF headers then x-forwarded-for
    const cfIP = headersList.get("cf-connecting-ip");
    if (cfIP && isValidIP(cfIP)) {
      return cfIP;
    }
    
    const forwarded = headersList.get("x-forwarded-for");
    if (forwarded) {
      const firstIP = forwarded.split(",")[0]?.trim();
      if (firstIP && isValidIP(firstIP)) {
        return firstIP;
      }
    }
    
    const realIP = headersList.get("x-real-ip");
    if (realIP && isValidIP(realIP)) {
      return realIP;
    }
  }
  
  // Fallback for development or untrusted environments
  return "127.0.0.1";
}

/**
 * Sanitize identifier to prevent Redis key injection
 */
function sanitizeIdentifier(identifier: string): string {
  // Allow only alphanumeric chars, hyphens, underscores, and colons
  return identifier.replace(/[^a-zA-Z0-9\-_:]/g, '_');
}

/**
 * Check if IP/user is currently banned for abuse
 */
async function checkAbuseBan(identifier: string): Promise<{ isBanned: boolean; banExpiry?: number }> {
  if (!redis) return { isBanned: false };
  
  try {
    const sanitizedIdentifier = sanitizeIdentifier(identifier);
    const banKey = `abuse:ban:${sanitizedIdentifier}`;
    const banData = await redis.get(banKey);
    
    if (banData) {
      const expiry = typeof banData === 'object' && banData !== null ? 
        (banData as { expiry: number }).expiry : 
        Date.now() + 5 * 60 * 1000; // Default 5 min
        
      if (Date.now() < expiry) {
        return { isBanned: true, banExpiry: expiry };
      } else {
        // Ban expired, clean up
        await redis.del(banKey);
      }
    }
    
    return { isBanned: false };
  } catch (error) {
    console.error("Error checking abuse ban:", error);
    return { isBanned: false };
  }
}

/**
 * Record potential abuse and implement progressive penalties
 */
async function recordAbuseAttempt(
  identifier: string, 
  type: keyof typeof ABUSE_DETECTION,
  metadata?: Record<string, unknown>
): Promise<void> {
  if (!redis) return;
  
  try {
    const sanitizedIdentifier = sanitizeIdentifier(identifier);
    const abuseKey = `abuse:${type}:${sanitizedIdentifier}`;
    const currentCount = await redis.incr(abuseKey);
    
    // Set TTL on first attempt
    if (currentCount === 1) {
      await redis.expire(abuseKey, 300); // 5 minutes
    }
    
    const threshold = ABUSE_DETECTION[type].threshold;
    const banDuration = ABUSE_DETECTION[type].banDuration;
    
    if (currentCount >= threshold) {
      // Implement ban
      const banKey = `abuse:ban:${sanitizedIdentifier}`;
      const banExpiry = Date.now() + parseDuration(banDuration);
      
      await redis.setex(banKey, Math.ceil(parseDuration(banDuration) / 1000), {
        type,
        count: currentCount,
        expiry: banExpiry,
        metadata,
        timestamp: Date.now(),
      });
      
      // Log abuse for monitoring
      console.warn(`Abuse detected: ${type} for ${identifier}`, {
        count: currentCount,
        threshold,
        banDuration,
        metadata,
      });
    }
  } catch (error) {
    console.error("Error recording abuse attempt:", error);
  }
}

/**
 * Parse duration string to milliseconds
 */
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 60000; // Default 1 minute
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 60000;
  }
}

/**
 * Advanced rate limiting with abuse detection and monitoring
 */
export async function checkAdvancedRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { userId, action, skipIfRedisUnavailable = true, checkAbuse = true } = options;
  
  // If Redis is not configured, allow all requests (fail open)
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    if (!skipIfRedisUnavailable) {
      return { success: false, retryAfter: 60 };
    }
    console.warn("Redis not configured, skipping advanced rate limiting");
    return { success: true };
  }

  initializeRedis();
  const ip = await getClientIP();
  const isAuthenticated = !!userId;
  
  // Create identifiers
  const primaryIdentifier = userId ? `user:${userId}` : `ip:${ip}`;
  const ipIdentifier = `ip:${ip}`; // Always track IP for abuse detection
  
  // Check for abuse bans
  if (checkAbuse) {
    const userBan = await checkAbuseBan(primaryIdentifier);
    const ipBan = await checkAbuseBan(ipIdentifier);
    
    if (userBan.isBanned || ipBan.isBanned) {
      const banExpiry = Math.max(userBan.banExpiry || 0, ipBan.banExpiry || 0);
      return {
        success: false,
        isAbuse: true,
        banExpiry,
        retryAfter: Math.ceil((banExpiry - Date.now()) / 1000),
      };
    }
  }
  
  // Get rate limit configuration
  const config = RATE_LIMIT_CONFIGS[action];
  if (!config) {
    console.warn(`No rate limit config found for action: ${action}`);
    return { success: true };
  }
  
  const limit = isAuthenticated ? config.AUTHENTICATED : config.ANONYMOUS;
  
  try {
    // Get rate limiter
    const limiterKey = `${action}:${isAuthenticated ? 'auth' : 'anon'}`;
    const rateLimiter = getRateLimiter(limit, limiterKey);
    
    if (!rateLimiter) {
      console.error("Rate limiter not initialized");
      return skipIfRedisUnavailable ? { success: true } : { success: false, retryAfter: 60 };
    }

    // Check primary rate limit
    const sanitizedPrimaryIdentifier = sanitizeIdentifier(primaryIdentifier);
    const identifier = `${sanitizedPrimaryIdentifier}:${action}`;
    const result = await rateLimiter.limit(identifier);
    
    // If rate limit exceeded, record potential abuse
    if (!result.success && checkAbuse) {
      await recordAbuseAttempt(primaryIdentifier, "EXCESSIVE_REQUESTS", {
        action,
        isAuthenticated,
        ip,
        timestamp: Date.now(),
      });
      
      // Also track IP-based abuse for anonymous users
      if (!userId) {
        await recordAbuseAttempt(ipIdentifier, "EXCESSIVE_REQUESTS", {
          action,
          isAuthenticated: false,
          timestamp: Date.now(),
        });
      }
    }
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
    };
  } catch (error) {
    console.error("Advanced rate limit check failed:", error);
    
    // Record system errors for monitoring
    if (checkAbuse) {
      await recordAbuseAttempt(primaryIdentifier, "SUSPICIOUS_PATTERNS", {
        error: error instanceof Error ? error.message : 'Unknown error',
        action,
        timestamp: Date.now(),
      });
    }
    
    return skipIfRedisUnavailable ? { success: true } : { success: false, retryAfter: 60 };
  }
}

/**
 * Get rate limit headers for API responses
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {};
  
  if (result.limit !== undefined) {
    headers['X-RateLimit-Limit'] = result.limit.toString();
  }
  if (result.remaining !== undefined) {
    headers['X-RateLimit-Remaining'] = result.remaining.toString();
  }
  if (result.reset !== undefined) {
    headers['X-RateLimit-Reset'] = Math.ceil(result.reset / 1000).toString();
  }
  if (result.retryAfter !== undefined) {
    headers['Retry-After'] = result.retryAfter.toString();
  }
  
  return headers;
}

/**
 * Create a standardized rate limit error response
 */
export function createRateLimitResponse(result: RateLimitResult) {
  const message = result.isAbuse ? 
    "Too many requests - temporarily banned due to suspicious activity" :
    "Too many requests - please try again later";
    
  return {
    error: message,
    code: result.isAbuse ? "ABUSE_DETECTED" : "RATE_LIMITED",
    retryAfter: result.retryAfter,
    banExpiry: result.banExpiry,
  };
}

/**
 * Middleware helper for Next.js API routes
 */
export async function withRateLimit<T>(
  action: keyof typeof RATE_LIMIT_CONFIGS,
  handler: () => Promise<T>,
  options?: {
    userId?: string | null;
    onRateLimited?: (result: RateLimitResult) => Response;
  }
): Promise<T | Response> {
  const result = await checkAdvancedRateLimit({
    userId: options?.userId,
    action,
  });
  
  if (!result.success) {
    if (options?.onRateLimited) {
      return options.onRateLimited(result);
    }
    
    // Default rate limit response
    const headers = getRateLimitHeaders(result);
    const errorData = createRateLimitResponse(result);
    
    return new Response(JSON.stringify(errorData), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
  }
  
  return handler();
}