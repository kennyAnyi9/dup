/**
 * URL sanitization utilities for QR code generation
 * Prevents XSS and dangerous protocol attacks
 */

// Allowed protocols for QR code URLs
const ALLOWED_PROTOCOLS = ['http:', 'https:'] as const;

// Dangerous protocols that should be blocked
const DANGEROUS_PROTOCOLS = [
  'javascript:',
  'vbscript:',
  'data:',
  'file:',
  'ftp:',
  'about:',
  'chrome:',
  'chrome-extension:',
  'moz-extension:',
  'ms-browser-extension:',
  'blob:',
] as const;

interface UrlValidationResult {
  isValid: boolean;
  sanitizedUrl?: string;
  error?: string;
}

/**
 * Sanitizes and validates URLs for QR code generation
 */
export function sanitizeQRUrl(url: string): UrlValidationResult {
  try {
    // Basic input validation
    if (!url || typeof url !== 'string') {
      return {
        isValid: false,
        error: 'URL is required and must be a string',
      };
    }

    // Trim whitespace
    const trimmedUrl = url.trim();
    
    if (trimmedUrl.length === 0) {
      return {
        isValid: false,
        error: 'URL cannot be empty',
      };
    }

    // Check URL length (reasonable limit for QR codes)
    if (trimmedUrl.length > 2048) {
      return {
        isValid: false,
        error: 'URL is too long (maximum 2048 characters)',
      };
    }

    // Check for dangerous protocols first (case-insensitive)
    const lowerUrl = trimmedUrl.toLowerCase();
    for (const protocol of DANGEROUS_PROTOCOLS) {
      if (lowerUrl.startsWith(protocol)) {
        return {
          isValid: false,
          error: `Protocol '${protocol}' is not allowed for security reasons`,
        };
      }
    }

    // Try to parse as URL
    let parsedUrl: URL;
    try {
      // If URL doesn't have protocol, assume https
      if (!trimmedUrl.includes('://')) {
        parsedUrl = new URL(`https://${trimmedUrl}`);
      } else {
        parsedUrl = new URL(trimmedUrl);
      }
    } catch {
      return {
        isValid: false,
        error: 'Invalid URL format',
      };
    }

    // Validate protocol
    if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol as typeof ALLOWED_PROTOCOLS[number])) {
      return {
        isValid: false,
        error: `Only HTTP and HTTPS protocols are allowed. Found: ${parsedUrl.protocol}`,
      };
    }

    // Additional security checks
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Block localhost and internal IPs for public QR codes
    if (isInternalHost(hostname)) {
      return {
        isValid: false,
        error: 'Internal/localhost URLs are not allowed',
      };
    }

    // Block suspicious patterns
    if (containsSuspiciousPatterns(parsedUrl.href)) {
      return {
        isValid: false,
        error: 'URL contains suspicious patterns',
      };
    }

    // Sanitize the URL by reconstructing it
    const sanitizedUrl = reconstructSafeUrl(parsedUrl);

    return {
      isValid: true,
      sanitizedUrl,
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to validate URL: ' + (error instanceof Error ? error.message : 'Unknown error'),
    };
  }
}

/**
 * Validates hex color codes for QR customization
 */
export function validateHexColor(color: string): { isValid: boolean; error?: string } {
  if (!color || typeof color !== 'string') {
    return {
      isValid: false,
      error: 'Color is required and must be a string',
    };
  }

  // Enhanced hex color validation
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  
  if (!hexPattern.test(color)) {
    return {
      isValid: false,
      error: 'Color must be a valid hex color code (e.g., #FF0000 or #F00)',
    };
  }

  // Additional check for contrast (prevent invisible QR codes)
  if (color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#fff') {
    // White color should be validated in context of background
    return { isValid: true };
  }

  return { isValid: true };
}

/**
 * Validates color contrast for QR code readability
 */
export function validateColorContrast(foreground: string, background: string): { isValid: boolean; error?: string } {
  // Validate individual colors first
  const fgValidation = validateHexColor(foreground);
  if (!fgValidation.isValid) {
    return { isValid: false, error: `Foreground color error: ${fgValidation.error}` };
  }

  const bgValidation = validateHexColor(background);
  if (!bgValidation.isValid) {
    return { isValid: false, error: `Background color error: ${bgValidation.error}` };
  }

  // Check if colors are too similar
  if (foreground.toLowerCase() === background.toLowerCase()) {
    return {
      isValid: false,
      error: 'Foreground and background colors cannot be the same',
    };
  }

  // Calculate basic contrast ratio
  const fgLuminance = calculateLuminance(foreground);
  const bgLuminance = calculateLuminance(background);
  
  const contrastRatio = (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05);
  
  // QR codes need higher contrast for reliable scanning
  if (contrastRatio < 3) {
    return {
      isValid: false,
      error: 'Colors have insufficient contrast for reliable QR code scanning',
    };
  }

  return { isValid: true };
}

/**
 * Checks if hostname is internal/localhost
 */
function isInternalHost(hostname: string): boolean {
  const internalPatterns = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    '10.',
    '172.16.',
    '172.17.',
    '172.18.',
    '172.19.',
    '172.20.',
    '172.21.',
    '172.22.',
    '172.23.',
    '172.24.',
    '172.25.',
    '172.26.',
    '172.27.',
    '172.28.',
    '172.29.',
    '172.30.',
    '172.31.',
    '192.168.',
    '169.254.',
  ];

  return internalPatterns.some(pattern => hostname.startsWith(pattern));
}

/**
 * Checks for suspicious URL patterns
 */
function containsSuspiciousPatterns(url: string): boolean {
  const suspiciousPatterns = [
    // XSS attempts
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+=/i,
    
    // Data URI attempts
    /data:.*base64/i,
    
    // Common phishing patterns
    /\.tk$/i,
    /\.ml$/i,
    /\.ga$/i,
    /\.cf$/i,
    
    // URL shortener abuse prevention (optional - can be removed if legitimate shorteners needed)
    // /bit\.ly/i,
    // /tinyurl/i,
    // /t\.co/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(url));
}

/**
 * Reconstructs URL in a safe manner
 */
function reconstructSafeUrl(parsedUrl: URL): string {
  // Reconstruct URL to remove any potentially dangerous components
  const safeUrl = new URL(parsedUrl.href);
  
  // Remove any fragment that might contain JavaScript
  safeUrl.hash = '';
  
  // Ensure protocol is lowercase
  const protocol = safeUrl.protocol.toLowerCase();
  const hostname = safeUrl.hostname.toLowerCase();
  const pathname = safeUrl.pathname;
  const search = safeUrl.search;
  const port = safeUrl.port ? `:${safeUrl.port}` : '';
  
  return `${protocol}//${hostname}${port}${pathname}${search}`;
}

/**
 * Calculates relative luminance for contrast checking
 */
function calculateLuminance(hexColor: string): number {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substr(4, 2), 16) / 255;

  // Apply gamma correction
  const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  
  const rLinear = toLinear(r);
  const gLinear = toLinear(g);
  const bLinear = toLinear(b);

  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}