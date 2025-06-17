import { Redis } from "@upstash/redis";

// Initialize Redis client
let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (error) {
  console.warn("Redis initialization failed:", error);
}

// Cache key prefixes
export const CACHE_KEYS = {
  RECENT_PUBLIC_PASTES: "recent_public_pastes",
  PASTE_VIEW: "paste_view:",      // Rendered paste view with processed content/metadata
  USER_PASTES: "user_pastes:",
  PASTE_COUNT: "paste_count:",
  PASTE: "paste:",                // Raw paste DB record for operations/updates
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  RECENT_PUBLIC_PASTES: 300, // 5 minutes
  PASTE_VIEW: 3600, // 1 hour
  USER_PASTES: 600, // 10 minutes
  PASTE_COUNT: 1800, // 30 minutes
  PASTE: 3600, // 1 hour
} as const;

export interface CacheOptions {
  ttl?: number;
  fallback?: boolean;
}

/**
 * Get data from cache with fallback
 */
export async function getFromCache<T>(
  key: string
): Promise<T | null> {
  if (!redis) {
    return null;
  }

  try {
    const cached = await redis.get(key);
    if (cached !== null && cached !== undefined) {
      // If cached is already an object, return it directly
      if (typeof cached === 'object') {
        return cached as T;
      }
      
      // If cached is a primitive type (number, boolean), return it directly
      if (typeof cached === 'number' || typeof cached === 'boolean') {
        return cached as T;
      }
      
      // If cached is a string, check if it's JSON or primitive
      if (typeof cached === 'string') {
        // If string is empty or doesn't look like JSON, return as-is
        if (cached === '' || (!cached.startsWith('{') && !cached.startsWith('[') && !cached.startsWith('"'))) {
          return cached as T;
        }
        // Try to parse as JSON, fallback to string if parsing fails
        try {
          return JSON.parse(cached);
        } catch {
          return cached as T;
        }
      }
      
      // For any other primitive types, return directly
      return cached as T;
    }
    return null;
  } catch (error) {
    console.warn(`Cache get failed for key ${key}:`, error);
    // Clear the corrupted cache entry
    try {
      await redis.del(key);
    } catch (deleteError) {
      console.warn(`Failed to delete corrupted cache key ${key}:`, deleteError);
    }
    return null;
  }
}

/**
 * Set data in cache with TTL
 */
export async function setInCache<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): Promise<boolean> {
  if (!redis) {
    return false;
  }

  try {
    const ttl = options.ttl || 300; // Default 5 minutes
    
    // Ensure we can serialize the data
    let serialized: string;
    try {
      serialized = JSON.stringify(data);
    } catch (serializeError) {
      console.warn(`Failed to serialize data for cache key ${key}:`, serializeError);
      return false;
    }
    
    await redis.setex(key, ttl, serialized);
    return true;
  } catch (error) {
    console.warn(`Cache set failed for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete from cache
 */
export async function deleteFromCache(key: string): Promise<boolean> {
  if (!redis) {
    return false;
  }

  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.warn(`Cache delete failed for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete multiple keys from cache (for pattern-based invalidation)
 */
export async function deleteCachePattern(pattern: string): Promise<boolean> {
  if (!redis) {
    return false;
  }

  try {
    // Note: Upstash Redis doesn't support KEYS command in free tier
    // We'll need to track cache keys manually for pattern deletion
    console.warn(`Pattern deletion not supported: ${pattern}`);
    return false;
  } catch (error) {
    console.warn(`Cache pattern delete failed for ${pattern}:`, error);
    return false;
  }
}

/**
 * Cache wrapper function - get from cache or execute function and cache result
 */
export async function cached<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get from cache first
  const cached = await getFromCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute function and cache result
  try {
    const result = await fetchFn();
    await setInCache(key, result, options);
    return result;
  } catch (error) {
    console.error(`Function execution failed for cache key ${key}:`, error);
    throw error;
  }
}

/**
 * Check if Redis is available
 */
export function isCacheAvailable(): boolean {
  return redis !== null;
}

/**
 * Generate cache key with parameters
 */
export function generateCacheKey(prefix: string, ...params: (string | number)[]): string {
  return `${prefix}${params.join(":")}`;
}