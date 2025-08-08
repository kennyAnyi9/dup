/**
 * Secure file validation utilities
 * Implements server-side MIME type validation and magic number checking
 */

// Allowed MIME types for text-based content
const ALLOWED_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'application/javascript',
  'application/json',
  'application/xml',
  'text/html',
  'text/css',
  'text/x-python',
  'text/x-java-source',
  'text/x-c',
  'text/x-c++',
  'text/x-php',
  'text/x-ruby',
  'text/x-go',
  'text/x-rust',
  'text/x-swift',
  'text/x-kotlin',
  'text/x-dart',
  'text/x-scala',
  'text/x-clojure',
  'text/x-haskell',
  'text/x-elm',
  'text/x-sql',
  'text/x-sh',
  'text/x-shellscript',
  'text/yaml',
  'text/x-yaml',
  'application/yaml',
  'application/x-yaml',
  'text/x-toml',
  'application/toml',
] as const;

// File extensions to MIME type mapping
const EXTENSION_TO_MIME: Record<string, string> = {
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.markdown': 'text/x-markdown',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.jsx': 'application/javascript',
  '.ts': 'application/javascript',
  '.tsx': 'application/javascript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.css': 'text/css',
  '.scss': 'text/css',
  '.sass': 'text/css',
  '.less': 'text/css',
  '.py': 'text/x-python',
  '.java': 'text/x-java-source',
  '.c': 'text/x-c',
  '.h': 'text/x-c',
  '.cpp': 'text/x-c++',
  '.cxx': 'text/x-c++',
  '.cc': 'text/x-c++',
  '.hpp': 'text/x-c++',
  '.php': 'text/x-php',
  '.rb': 'text/x-ruby',
  '.go': 'text/x-go',
  '.rs': 'text/x-rust',
  '.swift': 'text/x-swift',
  '.kt': 'text/x-kotlin',
  '.dart': 'text/x-dart',
  '.scala': 'text/x-scala',
  '.clj': 'text/x-clojure',
  '.hs': 'text/x-haskell',
  '.elm': 'text/x-elm',
  '.sql': 'text/x-sql',
  '.sh': 'text/x-sh',
  '.bash': 'text/x-shellscript',
  '.zsh': 'text/x-shellscript',
  '.fish': 'text/x-shellscript',
  '.ps1': 'text/x-shellscript',
  '.bat': 'text/x-shellscript',
  '.cmd': 'text/x-shellscript',
  '.yaml': 'text/yaml',
  '.yml': 'text/x-yaml',
  '.toml': 'text/x-toml',
  '.ini': 'text/plain',
  '.conf': 'text/plain',
  '.env': 'text/plain',
  '.gitignore': 'text/plain',
  '.dockerfile': 'text/plain',
  '.lock': 'text/plain',
};

// Magic numbers for common binary file types (to detect and reject)
const BINARY_MAGIC_NUMBERS = [
  [0x89, 0x50, 0x4E, 0x47], // PNG
  [0xFF, 0xD8, 0xFF], // JPEG
  [0x47, 0x49, 0x46, 0x38], // GIF
  [0x42, 0x4D], // BMP
  [0x50, 0x4B, 0x03, 0x04], // ZIP
  [0x50, 0x4B, 0x05, 0x06], // ZIP empty
  [0x50, 0x4B, 0x07, 0x08], // ZIP spanned
  [0x1F, 0x8B], // GZIP
  [0x25, 0x50, 0x44, 0x46], // PDF
  [0x7F, 0x45, 0x4C, 0x46], // ELF executable
  [0x4D, 0x5A], // PE executable
  [0xCA, 0xFE, 0xBA, 0xBE], // Java class file
  [0xFE, 0xED, 0xFA, 0xCE], // Mach-O binary
  [0xFE, 0xED, 0xFA, 0xCF], // Mach-O binary
  [0xCE, 0xFA, 0xED, 0xFE], // Mach-O binary
  [0xCF, 0xFA, 0xED, 0xFE], // Mach-O binary
];

interface FileValidationResult {
  isValid: boolean;
  error?: string;
  detectedMimeType?: string;
}

/**
 * Validates file type based on MIME type and content analysis
 */
export async function validateFileType(file: File): Promise<FileValidationResult> {
  try {
    // Check file size (server-side enforcement)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB limit`,
      };
    }

    // Get file extension
    const fileName = file.name.toLowerCase();
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    
    // Check if extension is allowed
    if (!EXTENSION_TO_MIME[extension]) {
      return {
        isValid: false,
        error: `File type '${extension}' is not allowed. Only text-based files are supported.`,
      };
    }

    // Validate MIME type
    const expectedMimeType = EXTENSION_TO_MIME[extension];
    if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number]) && file.type !== expectedMimeType) {
      // For security, be strict about MIME type matching
      if (file.type && !file.type.startsWith('text/') && !file.type.startsWith('application/')) {
        return {
          isValid: false,
          error: 'Only text-based files are allowed',
        };
      }
    }

    // Read file content for magic number validation
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Check for binary magic numbers
    if (containsBinaryMagicNumbers(uint8Array)) {
      return {
        isValid: false,
        error: 'File appears to be a binary file and cannot be processed as text',
      };
    }

    // Advanced binary content detection
    const content = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
    if (containsBinaryContent(content, uint8Array)) {
      return {
        isValid: false,
        error: 'File contains binary content and cannot be displayed as text',
      };
    }

    return {
      isValid: true,
      detectedMimeType: expectedMimeType,
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to validate file: ' + (error instanceof Error ? error.message : 'Unknown error'),
    };
  }
}

/**
 * Checks if byte array starts with known binary magic numbers
 */
function containsBinaryMagicNumbers(bytes: Uint8Array): boolean {
  for (const magicNumber of BINARY_MAGIC_NUMBERS) {
    if (bytes.length >= magicNumber.length) {
      let matches = true;
      for (let i = 0; i < magicNumber.length; i++) {
        if (bytes[i] !== magicNumber[i]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Advanced binary content detection
 */
function containsBinaryContent(text: string, bytes: Uint8Array): boolean {
  // Check for null bytes (definitive binary indicator)
  if (text.includes('\0')) {
    return true;
  }

  // Check for replacement characters (indicates encoding issues)
  if (text.includes('\uFFFD')) {
    return true;
  }

  // Calculate ratio of non-printable characters
  let nonPrintableCount = 0;
  const totalChars = text.length;

  for (let i = 0; i < totalChars; i++) {
    const charCode = text.charCodeAt(i);
    // Allow printable ASCII, common whitespace, and basic Unicode
    if (!(
      (charCode >= 32 && charCode <= 126) || // Printable ASCII
      charCode === 9 || // Tab
      charCode === 10 || // LF
      charCode === 13 || // CR
      (charCode >= 160 && charCode <= 65535) // Basic Unicode range
    )) {
      nonPrintableCount++;
    }
  }

  // If more than 5% non-printable characters, likely binary
  const nonPrintableRatio = nonPrintableCount / totalChars;
  if (nonPrintableRatio > 0.05) {
    return true;
  }

  // Check byte entropy (high entropy suggests binary/compressed data)
  if (bytes.length > 100) {
    const entropy = calculateEntropy(bytes.slice(0, 1000)); // Check first 1KB
    if (entropy > 7.5) { // High entropy threshold
      return true;
    }
  }

  return false;
}

/**
 * Calculates Shannon entropy of byte array
 */
function calculateEntropy(bytes: Uint8Array): number {
  const frequencies = new Array(256).fill(0);
  
  for (const byte of bytes) {
    frequencies[byte]++;
  }

  let entropy = 0;
  const length = bytes.length;

  for (const freq of frequencies) {
    if (freq > 0) {
      const probability = freq / length;
      entropy -= probability * Math.log2(probability);
    }
  }

  return entropy;
}

/**
 * Server-side content validation for paste content
 * Now context-aware to avoid false positives on legitimate code examples
 */
export function validatePasteContent(content: string): { isValid: boolean; error?: string } {
  // Check for null bytes
  if (content.includes('\0')) {
    return {
      isValid: false,
      error: 'Content contains null bytes and cannot be processed',
    };
  }

  // For a pastebin, we should be much more lenient since users often paste:
  // - HTML/JS code examples and tutorials
  // - Event handler examples (onclick, onload, etc.)
  // - URL examples (javascript:, data: URLs)
  // - Base64 encoded content for examples
  
  // Only block content that's very likely to be actual malicious attacks,
  // not legitimate code examples or educational content
  
  // Check for extremely suspicious patterns that are almost never legitimate
  const reallyMaliciousPatterns = [
    // Active script execution attempts with common XSS payloads
    /<script[^>]*>[\s\S]*?(alert|prompt|confirm|document\.cookie|window\.location)[\s\S]*?<\/script>/gi,
    
    // Suspicious iframe injections
    /<iframe[^>]*src\s*=\s*["']?(javascript:|data:)/gi,
    
    // Form submissions to external domains (potential data theft)
    /<form[^>]*action\s*=\s*["']?https?:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0)/gi,
    
    // Meta refresh to external domains
    /<meta[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*url\s*=\s*["']?https?:\/\//gi,
  ];

  for (const pattern of reallyMaliciousPatterns) {
    if (pattern.test(content)) {
      return {
        isValid: false,
        error: 'Content contains potentially malicious code',
      };
    }
  }

  return { isValid: true };
}