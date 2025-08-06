/**
 * Standardized API client with consistent error handling and retry logic
 */

// Simple request cache to prevent duplicate requests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const requestCache = new Map<string, Promise<ApiResponse<any>>>();

/**
 * Clear request cache entry after completion to prevent memory leaks
 */
function clearCacheEntry(cacheKey: string, delay: number = 1000) {
  setTimeout(() => {
    requestCache.delete(cacheKey);
  }, delay);
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Standardized API request with retry logic and proper error handling
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  // Create cache key for request deduplication (only for GET requests)
  if (options.method === 'GET' || !options.method) {
    const method = options.method || 'GET';
    const cacheKey = `${method}:${url}:${JSON.stringify({ headers: options.headers, body: options.body })}`;
    
    if (requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey)! as Promise<ApiResponse<T>>;
    }
    
    // Create and cache the promise
    const requestPromise = performRequest<T>(url, options);
    requestCache.set(cacheKey, requestPromise);
    
    // Clear cache entry after completion
    requestPromise.finally(() => clearCacheEntry(cacheKey));
    
    return requestPromise;
  }

  return performRequest<T>(url, options);
}

/**
 * Perform the actual HTTP request with retry logic
 */
async function performRequest<T = unknown>(
  url: string,
  options: ApiRequestOptions
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    timeout = 10000,
    retries = 3,
    retryDelay = 1000,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle different response types
      if (!response.ok) {
        // Check if this is worth retrying
        const shouldRetry = shouldRetryRequest(response.status, attempt, retries);
        
        if (shouldRetry && attempt < retries) {
          await delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
          continue;
        }

        // Get error message from response if available
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Fallback to status text if JSON parsing fails
          errorMessage = response.statusText || errorMessage;
        }

        throw new ApiError(errorMessage, response.status);
      }

      // Parse response
      const data = await response.json();
      return {
        success: true,
        data,
      };

    } catch (error) {
      lastError = error as Error;

      // Don't retry for certain error types
      if (
        error instanceof ApiError ||
        error instanceof TypeError ||
        (error as Error).name === 'AbortError'
      ) {
        // Only retry server errors (5xx) and specific retryable 4xx errors (429, 408)
        if (error instanceof ApiError && error.status && error.status < 500) {
          // Allow retry for rate limit (429) and timeout (408) errors
          if (error.status === 429 || error.status === 408) {
            // Continue to retry logic
          } else {
            // Don't retry other 4xx errors
            break;
          }
        }
        if ((error as Error).name === 'AbortError' && attempt === retries) {
          break;
        }
      }

      if (attempt < retries) {
        await delay(retryDelay * Math.pow(2, attempt));
        continue;
      }
    }
  }

  // If we get here, all retries failed
  return {
    success: false,
    error: formatApiError(lastError),
  };
}

/**
 * Determine if a request should be retried based on status code
 */
function shouldRetryRequest(status: number, attempt: number, maxRetries: number): boolean {
  if (attempt >= maxRetries) return false;
  
  // Retry server errors (5xx) and some specific client errors
  if (status >= 500) return true;
  if (status === 429) return true; // Rate limited
  if (status === 408) return true; // Request timeout
  
  return false;
}

/**
 * Format error for consistent user messaging
 */
function formatApiError(error: Error | null): string {
  if (!error) return 'An unexpected error occurred';

  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return error.message || 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return error.message || 'A conflict occurred. Please try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Server error. Please try again later.';
      default:
        return error.message || 'An error occurred while processing your request.';
    }
  }

  if (error.name === 'AbortError') {
    return 'Request timed out. Please try again.';
  }

  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Network error. Please check your connection.';
  }

  return error.message || 'An unexpected error occurred.';
}

/**
 * Simple delay utility for retry backoff
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Specialized function for URL availability checking with optimized retry logic
 */
export async function checkUrlAvailability(url: string): Promise<ApiResponse<{ available: boolean }>> {
  return apiRequest('/api/check-url', {
    method: 'POST',
    body: { url: url.trim() },
    timeout: 5000, // Shorter timeout for URL checks
    retries: 2, // Fewer retries for availability checks
    retryDelay: 500, // Faster retry for better UX
  });
}