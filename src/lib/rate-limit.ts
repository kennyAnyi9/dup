import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { 
  RATE_LIMIT_ANONYMOUS, 
  RATE_LIMIT_AUTHENTICATED 
} from "@/lib/constants";

let redis: Redis | undefined;
let rateLimitAnonymous: Ratelimit | undefined;
let rateLimitAuthenticated: Ratelimit | undefined;

function initializeRedis() {
  if (!redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    rateLimitAnonymous = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        RATE_LIMIT_ANONYMOUS.requests, 
        RATE_LIMIT_ANONYMOUS.window
      ),
      analytics: true,
    });

    rateLimitAuthenticated = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        RATE_LIMIT_AUTHENTICATED.requests, 
        RATE_LIMIT_AUTHENTICATED.window
      ),
      analytics: true,
    });
  }
}

export async function checkRateLimit(
  userId: string | null,
  action: string = "paste"
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  // If Redis is not configured, allow all requests
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("Redis not configured, skipping rate limiting");
    return { success: true };
  }

  initializeRedis();

  // Get IP address for anonymous users
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : headersList.get("x-real-ip") || "127.0.0.1";
  
  // Create identifier: user ID for authenticated users, IP for anonymous
  const identifier = userId ? `user:${userId}:${action}` : `ip:${ip}:${action}`;
  
  try {
    const rateLimit = userId ? rateLimitAuthenticated : rateLimitAnonymous;
    
    if (!rateLimit) {
      console.error("Rate limit not initialized");
      return { success: true }; // Fail open
    }

    const result = await rateLimit.limit(identifier);
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return { success: true }; // Fail open on errors
  }
}

export function getRateLimitInfo(isAuthenticated: boolean) {
  return isAuthenticated ? RATE_LIMIT_AUTHENTICATED : RATE_LIMIT_ANONYMOUS;
}