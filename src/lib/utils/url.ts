/**
 * Get the base URL for the application
 * Uses environment variable for consistent SSR/client behavior
 */
export function getBaseUrl(): string {
  // Check for environment variables (consistent across server/client)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  }
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, ''); // Remove trailing slash
  }
  
  // Development fallback - consistent for both server and client
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  
  // Production fallback
  return "https://dup.it.com";
}