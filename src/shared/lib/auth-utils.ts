/**
 * Auth-related utility functions
 */

/**
 * Validates and returns a safe redirect URL for authentication flows.
 * Only allows redirects to paste URLs (/p/*), defaults to dashboard otherwise.
 * 
 * @param searchParams - URL search parameters containing potential redirect
 * @returns Safe redirect URL
 */
export function getValidatedRedirectUrl(searchParams: URLSearchParams): string {
  const redirectParam = searchParams.get('redirect');
  return redirectParam?.startsWith('/p/') ? redirectParam : '/dashboard';
}