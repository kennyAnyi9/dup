/**
 * Get the base URL for the application
 * Uses NEXT_PUBLIC_BASE_URL environment variable if available,
 * otherwise falls back to the current window location origin
 */
export function getBaseUrl(): string {
  // Check for environment variable first (works in all environments)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // Fallback to window.location.origin (client-side only)
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  
  // Server-side fallback (should not happen with NEXT_PUBLIC_BASE_URL set)
  return "https://dup.it.com";
}