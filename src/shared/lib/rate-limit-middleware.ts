/**
 * Rate limiting middleware helpers for Next.js API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/shared/lib/auth-server";
import { 
  checkAdvancedRateLimit, 
  getRateLimitHeaders, 
  createRateLimitResponse,
  type RateLimitResult,
  RATE_LIMIT_CONFIGS 
} from "./advanced-rate-limit";

export type RateLimitAction = keyof typeof RATE_LIMIT_CONFIGS;

/**
 * Enhanced rate limiting middleware that adds headers to successful responses
 */
export async function withEnhancedRateLimit<T>(
  action: RateLimitAction,
  handler: (result: RateLimitResult) => Promise<T | Response>,
  options?: {
    userId?: string | null;
    request?: NextRequest;
    getUserId?: (request: NextRequest) => Promise<string | null>;
  }
): Promise<T | Response> {
  // Get user ID for rate limiting
  let userId = options?.userId;
  if (!userId && options?.getUserId && options.request) {
    userId = await options.getUserId(options.request);
  } else if (!userId && options?.request) {
    const user = await getCurrentUser();
    userId = user?.id || null;
  }

  // Check rate limits
  const rateLimitResult = await checkAdvancedRateLimit({
    userId,
    action,
  });

  // If rate limited, return error response
  if (!rateLimitResult.success) {
    const headers = getRateLimitHeaders(rateLimitResult);
    const errorData = createRateLimitResponse(rateLimitResult);
    
    return new Response(JSON.stringify(errorData), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
  }

  // Call the handler with rate limit info
  const response = await handler(rateLimitResult);
  
  // Add rate limit headers to successful responses
  if (response instanceof Response) {
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

/**
 * Simple rate limiting decorator for API routes
 */
export function rateLimited(action: RateLimitAction) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const request = args[0] as NextRequest;
      const user = await getCurrentUser();
      
      return withEnhancedRateLimit(
        action,
        async () => originalMethod.apply(this, args),
        { 
          userId: user?.id || null,
          request 
        }
      );
    };

    return descriptor;
  };
}

/**
 * Create a rate-limited API handler
 */
export function createRateLimitedHandler(
  action: RateLimitAction,
  handler: (request: NextRequest, ...args: unknown[]) => Promise<Response>
) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const user = await getCurrentUser();
    
    return withEnhancedRateLimit(
      action,
      async (rateLimitResult) => {
        const response = await handler(request, ...args);
        
        // Add rate limit headers
        const headers = getRateLimitHeaders(rateLimitResult);
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        
        return response;
      },
      { 
        userId: user?.id || null,
        request 
      }
    );
  };
}

/**
 * Middleware for adding rate limit information to responses
 */
export async function addRateLimitHeaders(
  response: NextResponse,
  action: RateLimitAction,
  userId?: string | null
): Promise<NextResponse> {
  try {
    // Check current rate limit status (without consuming a request)
    const result = await checkAdvancedRateLimit({
      userId,
      action,
    });
    
    // Add headers to response
    const headers = getRateLimitHeaders(result);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  } catch (error) {
    console.error("Failed to add rate limit headers:", error);
    return response;
  }
}

/**
 * Get rate limit status without consuming a request
 */
export async function getRateLimitStatus(
  action: RateLimitAction,
  userId?: string | null
): Promise<{
  remaining: number;
  limit: number;
  resetTime: number;
  canMakeRequest: boolean;
}> {
  try {
    const result = await checkAdvancedRateLimit({
      userId,
      action,
    });
    
    return {
      remaining: result.remaining || 0,
      limit: result.limit || 0,
      resetTime: result.reset || Date.now() + 60000,
      canMakeRequest: result.success,
    };
  } catch (error) {
    console.error("Failed to get rate limit status:", error);
    return {
      remaining: 0,
      limit: 0,
      resetTime: Date.now() + 60000,
      canMakeRequest: false,
    };
  }
}

/**
 * Utility to format rate limit error messages for users
 */
export function formatRateLimitError(result: RateLimitResult): string {
  if (result.isAbuse && result.banExpiry) {
    const banTimeLeft = Math.ceil((result.banExpiry - Date.now()) / 1000);
    const minutes = Math.ceil(banTimeLeft / 60);
    
    if (minutes > 60) {
      const hours = Math.ceil(minutes / 60);
      return `You've been temporarily banned due to excessive requests. Try again in ${hours} hour${hours > 1 ? 's' : ''}.`;
    }
    
    return `You've been temporarily banned due to excessive requests. Try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
  }
  
  if (result.retryAfter) {
    const seconds = result.retryAfter;
    
    if (seconds > 60) {
      const minutes = Math.ceil(seconds / 60);
      return `Rate limit exceeded. Try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
    }
    
    return `Rate limit exceeded. Try again in ${seconds} second${seconds > 1 ? 's' : ''}.`;
  }
  
  return "Rate limit exceeded. Please try again later.";
}