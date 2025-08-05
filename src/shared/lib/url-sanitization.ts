/**
 * URL sanitization utility for security-first URL handling in QR codes
 * Prevents XSS attacks and malicious URL schemes
 */

// Allowed URL protocols for QR codes
const ALLOWED_PROTOCOLS = ['http:', 'https:'] as const;

// Dangerous protocols that should never be allowed
const DANGEROUS_PROTOCOLS = [
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
  'ftp:',
  'chrome:',
  'chrome-extension:',
  'moz-extension:',
  'ms-appx:',
  'app:',
] as const;

// Common URL patterns that might be malicious
const SUSPICIOUS_PATTERNS = [
  /javascript:/i,
  /vbscript:/i,
  /data:text\/html/i,
  /data:application\/javascript/i,
  /<script/i,
  /%3cscript/i, // URL encoded <script
  /&lt;script/i,
  /onclick=/i,
  /onerror=/i,
  /onload=/i,
] as const;

export interface UrlValidationResult {
  isValid: boolean;
  sanitizedUrl?: string;
  error?: string;
  warnings?: string[];
  detectedIssues?: string[];
}

/**
 * Sanitize and validate URLs for QR code generation
 */
export function sanitizeQrUrl(url: string): UrlValidationResult {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      error: 'URL is required and must be a string'
    };
  }

  const trimmedUrl = url.trim();
  
  if (trimmedUrl.length === 0) {
    return {
      isValid: false,
      error: 'URL cannot be empty'
    };
  }

  // Check for suspicious patterns before URL parsing
  const detectedIssues: string[] = [];
  const warnings: string[] = [];
  
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(trimmedUrl)) {
      detectedIssues.push(`Suspicious pattern detected: ${pattern.source}`);
    }
  }

  // Check for dangerous protocols in raw string (before URL parsing)
  const lowerUrl = trimmedUrl.toLowerCase();
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (lowerUrl.startsWith(protocol)) {
      return {
        isValid: false,
        error: `Dangerous protocol "${protocol}" is not allowed`,
        detectedIssues
      };
    }
  }

  // If no protocol specified, default to https
  let urlToValidate = trimmedUrl;
  if (!trimmedUrl.includes('://')) {
    urlToValidate = `https://${trimmedUrl}`;
  }

  try {
    // Parse URL to validate structure
    const parsedUrl = new URL(urlToValidate);
    
    // Validate protocol
    if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol as any)) {
      return {
        isValid: false,
        error: `Protocol "${parsedUrl.protocol}" is not allowed. Only HTTP and HTTPS are permitted.`,
        detectedIssues
      };
    }

    // Validate hostname
    if (!parsedUrl.hostname || parsedUrl.hostname.length === 0) {
      return {
        isValid: false,
        error: 'URL must have a valid hostname',
        detectedIssues
      };
    }

    // Check for localhost/private network access (security concern)
    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')) {
      warnings.push('URL points to localhost or private network');
    }

    // Additional security checks on the full URL string
    const finalUrl = parsedUrl.toString();
    
    // Check for URL encoding that might hide malicious content
    if (finalUrl.includes('%')) {
      try {
        const decoded = decodeURIComponent(finalUrl);
        for (const pattern of SUSPICIOUS_PATTERNS) {
          if (pattern.test(decoded)) {
            detectedIssues.push(`Suspicious pattern found in decoded URL: ${pattern.source}`);
          }
        }
      } catch (e) {
        warnings.push('URL contains malformed encoding');
      }
    }

    // Check URL length (QR codes have practical limits)
    if (finalUrl.length > 2048) {
      warnings.push('URL is very long and may not work well in QR codes');
    }

    // If any issues were detected, reject the URL
    if (detectedIssues.length > 0) {
      return {
        isValid: false,
        error: 'URL contains potentially malicious content',
        detectedIssues,
        warnings
      };
    }

    return {
      isValid: true,
      sanitizedUrl: finalUrl,
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Invalid URL format: ${error instanceof Error ? error.message : 'Unknown error'}`,
      detectedIssues
    };
  }
}

/**
 * Validate color hex values for QR code customization
 */
export function validateHexColor(color: string): { isValid: boolean; error?: string; sanitizedColor?: string } {
  if (!color || typeof color !== 'string') {
    return {
      isValid: false,
      error: 'Color is required and must be a string'
    };
  }

  const trimmedColor = color.trim();
  
  // Must start with # and be exactly 7 characters (#RRGGBB)
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;
  
  if (!hexPattern.test(trimmedColor)) {
    return {
      isValid: false,
      error: 'Color must be a valid hex color in format #RRGGBB (e.g., #FF0000)'
    };
  }

  return {
    isValid: true,
    sanitizedColor: trimmedColor.toUpperCase() // Normalize to uppercase
  };
}

/**
 * Comprehensive validation for QR code generation parameters
 */
export interface QrCodeValidationOptions {
  url: string;
  foregroundColor?: string;
  backgroundColor?: string;
}

export interface QrCodeValidationResult {
  isValid: boolean;
  sanitizedParams?: {
    url: string;
    foregroundColor?: string;
    backgroundColor?: string;
  };
  errors?: string[];
  warnings?: string[];
}

export function validateQrCodeParams(options: QrCodeValidationOptions): QrCodeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sanitizedParams: any = {};

  // Validate URL
  const urlResult = sanitizeQrUrl(options.url);
  if (!urlResult.isValid) {
    errors.push(urlResult.error || 'Invalid URL');
  } else {
    sanitizedParams.url = urlResult.sanitizedUrl;
    if (urlResult.warnings) {
      warnings.push(...urlResult.warnings);
    }
  }

  // Validate foreground color if provided
  if (options.foregroundColor) {
    const colorResult = validateHexColor(options.foregroundColor);
    if (!colorResult.isValid) {
      errors.push(`Foreground color: ${colorResult.error}`);
    } else {
      sanitizedParams.foregroundColor = colorResult.sanitizedColor;
    }
  }

  // Validate background color if provided
  if (options.backgroundColor) {
    const colorResult = validateHexColor(options.backgroundColor);
    if (!colorResult.isValid) {
      errors.push(`Background color: ${colorResult.error}`);
    } else {
      sanitizedParams.backgroundColor = colorResult.sanitizedColor;
    }
  }

  // Check color contrast if both colors provided
  if (sanitizedParams.foregroundColor && sanitizedParams.backgroundColor) {
    if (sanitizedParams.foregroundColor === sanitizedParams.backgroundColor) {
      errors.push('Foreground and background colors cannot be identical');
    }
    
    // Basic contrast warning (simplified check)
    const fg = sanitizedParams.foregroundColor.slice(1);
    const bg = sanitizedParams.backgroundColor.slice(1);
    
    // Convert to RGB and calculate basic brightness
    const fgBrightness = parseInt(fg.slice(0,2), 16) + parseInt(fg.slice(2,4), 16) + parseInt(fg.slice(4,6), 16);
    const bgBrightness = parseInt(bg.slice(0,2), 16) + parseInt(bg.slice(2,4), 16) + parseInt(bg.slice(4,6), 16);
    
    if (Math.abs(fgBrightness - bgBrightness) < 150) {
      warnings.push('Colors may have low contrast, QR code might be difficult to scan');
    }
  }

  return {
    isValid: errors.length === 0,
    sanitizedParams: errors.length === 0 ? sanitizedParams : undefined,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}