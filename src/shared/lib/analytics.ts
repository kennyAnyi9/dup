/**
 * Analytics utilities for tracking paste views and user behavior
 */

import { headers } from "next/headers";
import { db } from "@/db";
import { paste, pasteView } from "@/db/schema";
import { eq, sql, and, desc, count, gte } from "drizzle-orm";
import crypto from "crypto";
import { getGeoInfo } from "./geoip";
import { parseUserAgent } from "./user-agent-parser";

// Remove old interface and function - now imported from user-agent-parser.ts

/**
 * Sanitize IP address by removing non-IP tokens and validating format
 */
function sanitizeIP(ip: string): string | null {
  if (!ip) return null;
  
  // Remove quotes, brackets, and other non-IP characters
  const cleaned = ip.trim().replace(/^["']|["']$/g, '').replace(/^\[|\]$/g, '');
  
  // Basic IPv4/IPv6 validation
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$|^(?:[0-9a-fA-F]{1,4}:)*::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$|^::ffff:[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/;
  
  if (ipv4Regex.test(cleaned) || ipv6Regex.test(cleaned)) {
    return cleaned;
  }
  
  return null;
}

/**
 * Parse RFC 7239 Forwarded header
 */
function parseForwardedHeader(forwarded: string): string | null {
  // Parse "for=" directive from Forwarded header
  const forMatch = forwarded.match(/for=([^;,]+)/i);
  if (forMatch) {
    let ip = forMatch[1].trim();
    // Remove quotes and extract IP from quoted string
    ip = ip.replace(/^["']|["']$/g, '');
    // Handle IPv6 in brackets or port notation
    if (ip.includes(':') && !ip.startsWith('[')) {
      // Could be IPv6 with port, try to extract IP part
      const parts = ip.split(':');
      if (parts.length > 2) {
        // Likely IPv6, reconstruct
        ip = parts.slice(0, -1).join(':');
      }
    }
    return sanitizeIP(ip);
  }
  return null;
}

/**
 * Get client IP address from headers with comprehensive parsing
 */
async function getClientIP(): Promise<string> {
  const headersList = await headers();
  
  // Check headers in order of reliability
  const headerSources = [
    // RFC 7239 Forwarded header (most standard)
    () => {
      const forwarded = headersList.get("forwarded");
      return forwarded ? parseForwardedHeader(forwarded) : null;
    },
    
    // CloudFlare connecting IP
    () => sanitizeIP(headersList.get("cf-connecting-ip") || ""),
    
    // X-Real-IP (common in nginx)
    () => sanitizeIP(headersList.get("x-real-ip") || ""),
    
    // X-Forwarded-For (get first IP, which should be client)
    () => {
      const xForwardedFor = headersList.get("x-forwarded-for");
      if (xForwardedFor) {
        const firstIP = xForwardedFor.split(",")[0];
        return sanitizeIP(firstIP);
      }
      return null;
    },
    
    // Additional common headers
    () => sanitizeIP(headersList.get("x-client-ip") || ""),
    () => sanitizeIP(headersList.get("x-forwarded") || ""),
    () => sanitizeIP(headersList.get("x-cluster-client-ip") || ""),
    () => sanitizeIP(headersList.get("forwarded-for") || ""),
  ];
  
  // Try each header source until we find a valid IP
  for (const getIP of headerSources) {
    const ip = getIP();
    if (ip) {
      return ip;
    }
  }
  
  // Fallback to localhost
  return "127.0.0.1";
}

// Lazy-loaded to avoid import-time crashes
let HASH_SALT: string | undefined;
function getHashSalt(): string {
  HASH_SALT = HASH_SALT ?? process.env.HASH_SALT;
  if (!HASH_SALT) throw new Error('HASH_SALT environment variable is required for secure IP hashing');
  return HASH_SALT;
}

/**
 * Hash IP address for privacy using HMAC
 */
function hashIP(ip: string): string {
  const h = crypto.createHmac('sha256', getHashSalt()).update(ip).digest('hex');
  return h.substring(0, 32);
}

/**
 * Sanitize referrer URL to extract only origin part (reduces PII exposure)
 */
function sanitizeReferrer(referrer: string | null): string | null {
  if (!referrer) return null;
  
  try {
    const url = new URL(referrer);
    // Return only the origin (protocol + hostname + port)
    return url.origin;
  } catch {
    // If URL parsing fails, return null to avoid storing invalid data
    return null;
  }
}

/**
 * Truncate string to maximum length to fit database schema
 */
function truncateString(str: string | null, maxLength: number): string | null {
  if (!str) return null;
  return str.length > maxLength ? str.substring(0, maxLength) : str;
}

// getGeoInfo is now imported from geoip.ts

/**
 * Track a paste view with analytics data
 */
export async function trackPasteView(pasteId: string): Promise<void> {
  try {
    const headersList = await headers();
    const rawUserAgent = headersList.get("user-agent") || "unknown";
    const rawReferrer = headersList.get("referer");
    
    // Sanitize and truncate user-agent and referrer
    const userAgent = truncateString(rawUserAgent, 500); // Limit to 500 chars
    const referrer = truncateString(sanitizeReferrer(rawReferrer), 255); // Limit to 255 chars
    
    const ip = await getClientIP();
    const ipHash = hashIP(ip);
    
    // Parse user agent with enhanced detection
    const { device, browser, os } = parseUserAgent(rawUserAgent);
    
    // Get geographic information
    const geoResult = await getGeoInfo(ip);
    const geoData = geoResult.data || {
      country: "Unknown",
      countryCode: "XX", 
      region: "Unknown",
      city: "Unknown",
      continent: "Unknown",
    };
    
    // Log GeoIP failures in development
    if (!geoResult.success && process.env.NODE_ENV === 'development') {
      console.warn('GeoIP lookup failed:', geoResult.error);
    }
    
    // Log analytics tracking in development only
    if (process.env.NODE_ENV === 'development') {
      console.log(`Analytics tracking for IP: ${ip.substring(0, 3)}... - ${geoData.country}, ${geoData.city}`);
    }
    
    const viewData = {
      id: crypto.randomUUID(),
      pasteId,
      ipHash,
      userAgent,
      country: geoData.country,
      countryCode: geoData.countryCode,
      region: geoData.region,
      city: geoData.city,
      continent: geoData.continent,
      device,
      browser,
      os,
      referrer,
    };
    
    // Insert analytics record with all geographic data
    await db.insert(pasteView).values(viewData);
    
    // Update paste view count
    await db
      .update(paste)
      .set({ 
        views: sql`${paste.views} + 1`
      })
      .where(eq(paste.id, pasteId));
      
  } catch (error) {
    console.error("Failed to track paste view:", error);
    // Don't throw - analytics failures shouldn't break the app
  }
}

/**
 * Get analytics data for a specific paste
 */
export async function getPasteAnalytics(pasteId: string, userId?: string) {
  try {
    // Define time ranges for analytics queries
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Verify paste ownership if userId provided
    if (userId) {
      const pasteOwnership = await db
        .select({ userId: paste.userId })
        .from(paste)
        .where(eq(paste.id, pasteId))
        .limit(1);
        
      if (!pasteOwnership[0] || pasteOwnership[0].userId !== userId) {
        throw new Error("Unauthorized access to paste analytics");
      }
    }
    
    // Get total views and basic paste info
    const pasteInfo = await db
      .select({
        title: paste.title,
        slug: paste.slug,
        totalViews: paste.views,
        createdAt: paste.createdAt,
      })
      .from(paste)
      .where(eq(paste.id, pasteId))
      .limit(1);
    
    if (!pasteInfo[0]) {
      throw new Error("Paste not found");
    }
    
    
    // Get last viewed time
    const lastView = await db
      .select({ viewedAt: pasteView.viewedAt })
      .from(pasteView)
      .where(eq(pasteView.pasteId, pasteId))
      .orderBy(desc(pasteView.viewedAt))
      .limit(1);
    
    // Get views by country (top 5)
    const topCountries = await db
      .select({
        country: pasteView.country,
        views: count(),
      })
      .from(pasteView)
      .where(eq(pasteView.pasteId, pasteId))
      .groupBy(pasteView.country)
      .orderBy(desc(count()))
      .limit(5);
      
    // Filter out null countries and ensure string type
    const filteredCountries = topCountries
      .filter(c => c.country !== null)
      .map(c => ({ country: c.country as string, views: c.views }));
    
    
    // Get views by device type
    const deviceBreakdown = await db
      .select({
        device: pasteView.device,
        views: count(),
      })
      .from(pasteView)
      .where(eq(pasteView.pasteId, pasteId))
      .groupBy(pasteView.device)
      .orderBy(desc(count()));
    
    // Get views by browser
    const browserBreakdown = await db
      .select({
        browser: pasteView.browser,
        views: count(),
      })
      .from(pasteView)
      .where(eq(pasteView.pasteId, pasteId))
      .groupBy(pasteView.browser)
      .orderBy(desc(count()));
    
    // Get views by OS
    const osBreakdown = await db
      .select({
        os: pasteView.os,
        views: count(),
      })
      .from(pasteView)
      .where(eq(pasteView.pasteId, pasteId))
      .groupBy(pasteView.os)
      .orderBy(desc(count()));
    
    // Get views by regions (states/provinces)
    const regionBreakdown = await db
      .select({
        region: pasteView.region,
        views: count(),
      })
      .from(pasteView)
      .where(eq(pasteView.pasteId, pasteId))
      .groupBy(pasteView.region)
      .orderBy(desc(count()))
      .limit(10);
    
    // Get views by cities
    const cityBreakdown = await db
      .select({
        city: pasteView.city,
        views: count(),
      })
      .from(pasteView)
      .where(eq(pasteView.pasteId, pasteId))
      .groupBy(pasteView.city)
      .orderBy(desc(count()))
      .limit(10);
    
    // Get views by continents
    const continentBreakdown = await db
      .select({
        continent: pasteView.continent,
        views: count(),
      })
      .from(pasteView)
      .where(eq(pasteView.pasteId, pasteId))
      .groupBy(pasteView.continent)
      .orderBy(desc(count()));
    
    // Get daily views for the last 30 days
    const dailyViews = await db
      .select({
        date: sql<string>`DATE(${pasteView.viewedAt})`,
        views: count(),
      })
      .from(pasteView)
      .where(and(
        eq(pasteView.pasteId, pasteId),
        gte(pasteView.viewedAt, thirtyDaysAgo)
      ))
      .groupBy(sql`DATE(${pasteView.viewedAt})`)
      .orderBy(sql`DATE(${pasteView.viewedAt})`);
    
    // Get peak viewing hours (0-23) scoped to last 30 days
    const hourlyViews = await db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM ${pasteView.viewedAt})`,
        views: count(),
      })
      .from(pasteView)
      .where(and(
        eq(pasteView.pasteId, pasteId),
        gte(pasteView.viewedAt, thirtyDaysAgo)
      ))
      .groupBy(sql`EXTRACT(HOUR FROM ${pasteView.viewedAt})`)
      .orderBy(desc(count()))
      .limit(1);
    
    // Helper function to filter out null and unknown values while preserving type safety
    const filterNullValues = <T extends Record<string, unknown>>(
      data: T[], 
      key: keyof T
    ) => data.filter(item => {
      const v = item[key];
      return v !== null && v !== undefined && v !== 'Unknown' && v !== 'unknown';
    });

    return {
      paste: pasteInfo[0],
      lastViewed: lastView[0]?.viewedAt || null,
      topCountries: filteredCountries,
      regionBreakdown: filterNullValues(regionBreakdown, 'region'),
      cityBreakdown: filterNullValues(cityBreakdown, 'city'),
      continentBreakdown: filterNullValues(continentBreakdown, 'continent'),
      deviceBreakdown: filterNullValues(deviceBreakdown, 'device'),
      browserBreakdown: filterNullValues(browserBreakdown, 'browser'),
      osBreakdown: filterNullValues(osBreakdown, 'os'),
      dailyViews,
      peakHour: hourlyViews[0]?.hour || null,
    };
  } catch (error) {
    console.error("Failed to get paste analytics:", error);
    throw error;
  }
}

/**
 * Get user dashboard analytics overview
 */
export async function getUserAnalytics(userId: string) {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Get total views across all user's pastes
    const totalViews = await db
      .select({
        totalViews: sql<number>`COALESCE(SUM(${paste.views}), 0)`,
      })
      .from(paste)
      .where(eq(paste.userId, userId));
    
    // Get most popular paste this week
    const weeklyTopPaste = await db
      .select({
        id: paste.id,
        slug: paste.slug,
        title: paste.title,
        views: count(),
      })
      .from(paste)
      .leftJoin(pasteView, eq(pasteView.pasteId, paste.id))
      .where(and(
        eq(paste.userId, userId),
        gte(pasteView.viewedAt, sevenDaysAgo)
      ))
      .groupBy(paste.id, paste.slug, paste.title)
      .orderBy(desc(count()))
      .limit(1);
    
    // Get most popular paste this month
    const monthlyTopPaste = await db
      .select({
        id: paste.id,
        slug: paste.slug,
        title: paste.title,
        views: count(),
      })
      .from(paste)
      .leftJoin(pasteView, eq(pasteView.pasteId, paste.id))
      .where(and(
        eq(paste.userId, userId),
        gte(pasteView.viewedAt, thirtyDaysAgo)
      ))
      .groupBy(paste.id, paste.slug, paste.title)
      .orderBy(desc(count()))
      .limit(1);
    
    // Get language popularity
    const languageStats = await db
      .select({
        language: paste.language,
        pasteCount: count(paste.id),
        totalViews: sql<number>`COALESCE(SUM(${paste.views}), 0)`,
      })
      .from(paste)
      .where(eq(paste.userId, userId))
      .groupBy(paste.language)
      .orderBy(desc(sql`COALESCE(SUM(${paste.views}), 0)`))
      .limit(10);
    
    // Get recent activity (last 10 views)
    const recentActivity = await db
      .select({
        pasteId: paste.id,
        pasteSlug: paste.slug,
        pasteTitle: paste.title,
        viewedAt: pasteView.viewedAt,
        country: pasteView.country,
        device: pasteView.device,
      })
      .from(pasteView)
      .innerJoin(paste, eq(paste.id, pasteView.pasteId))
      .where(eq(paste.userId, userId))
      .orderBy(desc(pasteView.viewedAt))
      .limit(10);
    
    return {
      totalViews: totalViews[0]?.totalViews || 0,
      weeklyTopPaste: weeklyTopPaste[0] || null,
      monthlyTopPaste: monthlyTopPaste[0] || null,
      languageStats,
      recentActivity,
    };
  } catch (error) {
    console.error("Failed to get user analytics:", error);
    throw error;
  }
}