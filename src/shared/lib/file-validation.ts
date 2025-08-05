/**
 * Comprehensive file validation utility for security-first file upload handling
 * Implements multiple layers of validation: MIME type, magic numbers, content analysis
 */

// Magic number signatures for common file types
const FILE_SIGNATURES = {
  // Text files (no magic number, validated by content)
  text: [],
  // JavaScript/TypeScript
  javascript: [],
  // Images (should be rejected for text content)
  png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  jpeg: [0xFF, 0xD8, 0xFF],
  gif: [0x47, 0x49, 0x46, 0x38],
  // Archives (should be rejected)
  zip: [0x50, 0x4B, 0x03, 0x04],
  rar: [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07],
  // Executables (should be rejected)
  exe: [0x4D, 0x5A],
  elf: [0x7F, 0x45, 0x4C, 0x46],
  // Documents (may contain macros, be cautious)
  pdf: [0x25, 0x50, 0x44, 0x46],
  docx: [0x50, 0x4B, 0x03, 0x04], // Same as ZIP
} as const;

// Comprehensive MIME type allowlist for text-based files
const ALLOWED_MIME_TYPES = [
  // Plain text
  'text/plain',
  'text/x-markdown',
  'text/markdown',
  
  // Web technologies
  'text/html',
  'text/css',
  'text/javascript',
  'application/javascript',
  'application/x-javascript',
  'text/x-javascript',
  'application/json',
  'application/xml',
  'text/xml',
  
  // Programming languages
  'text/x-python',
  'text/x-java-source',
  'text/x-c',
  'text/x-c++',
  'text/x-csharp',
  'text/x-php',
  'text/x-ruby',
  'text/x-go',
  'text/x-rust',
  'text/x-swift',
  'text/x-kotlin',
  'text/x-scala',
  'text/x-clojure',
  'text/x-haskell',
  'text/x-elm',
  'text/x-dart',
  'application/typescript',
  'text/typescript',
  
  // Shell scripts
  'text/x-shellscript',
  'application/x-sh',
  'text/x-bash',
  'text/x-zsh',
  'text/x-fish',
  'text/x-powershell',
  
  // Config files
  'text/x-yaml',
  'application/x-yaml',
  'text/yaml',
  'application/toml',
  'text/x-ini',
  'text/x-properties',
  'application/x-wine-extension-ini',
  
  // SQL
  'text/x-sql',
  'application/sql',
  
  // Dockerfile and containerization
  'text/x-dockerfile',
  
  // Other development files
  'text/x-gitignore',
  'application/x-httpd-php',
] as const;

// File extensions that are known to be safe for text content
const ALLOWED_EXTENSIONS = [
  // Plain text
  '.txt', '.md', '.markdown', '.rst', '.adoc',
  
  // Web
  '.html', '.htm', '.css', '.js', '.jsx', '.ts', '.tsx', '.json', '.xml',
  
  // Programming languages
  '.py', '.java', '.c', '.cpp', '.cxx', '.cc', '.h', '.hpp', '.cs', '.php',
  '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.clj', '.hs', '.elm',
  '.dart', '.pl', '.lua', '.r', '.matlab', '.m',
  
  // Shell scripts
  '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd',
  
  // Config files
  '.yaml', '.yml', '.toml', '.ini', '.conf', '.env', '.properties',
  '.gitignore', '.gitattributes', '.editorconfig', '.eslintrc', '.prettierrc',
  
  // SQL and databases
  '.sql', '.sqlite', '.db',
  
  // Documentation and markup
  '.tex', '.latex', '.bib', '.wiki',
  
  // Containerization
  '.dockerfile', '.dockerignore',
  
  // Logs
  '.log',
  
  // Lock files
  '.lock',
] as const;

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
  detectedType?: string;
  isBinary?: boolean;
}

export interface FileValidationOptions {
  maxSizeBytes?: number;
  allowBinary?: boolean;
  strictMimeValidation?: boolean;
  customAllowedTypes?: string[];
}

/**
 * Check file signature (magic numbers) against known binary formats
 */
function checkMagicNumbers(buffer: ArrayBuffer): { isBinary: boolean; detectedType?: string } {
  const bytes = new Uint8Array(buffer.slice(0, 20)); // Check first 20 bytes
  
  for (const [type, signature] of Object.entries(FILE_SIGNATURES)) {
    if (signature.length === 0) continue; // Skip text types
    
    if (signature.every((byte, index) => bytes[index] === byte)) {
      return { isBinary: true, detectedType: type };
    }
  }
  
  return { isBinary: false };
}

/**
 * Advanced binary content detection using multiple heuristics
 */
function detectBinaryContent(text: string, buffer: ArrayBuffer): { isBinary: boolean; confidence: number } {
  // Check for null bytes (definitive binary indicator)
  if (text.includes('\0')) {
    return { isBinary: true, confidence: 1.0 };
  }
  
  // Check magic numbers first
  const magicCheck = checkMagicNumbers(buffer);
  if (magicCheck.isBinary) {
    return { isBinary: true, confidence: 1.0 };
  }
  
  // Statistical analysis of character distribution
  let nonPrintableCount = 0;
  let controlCount = 0;
  let highAsciiCount = 0;
  
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    
    // Allow common whitespace/control characters
    if (code === 0x09 || code === 0x0A || code === 0x0D) continue; // Tab, LF, CR
    
    if (code < 0x20) {
      controlCount++;
    } else if (code > 0x7E && code < 0xA0) {
      nonPrintableCount++;
    } else if (code > 0xFF) {
      highAsciiCount++;
    }
  }
  
  const totalChars = text.length;
  if (totalChars === 0) return { isBinary: false, confidence: 0 };
  
  const nonPrintableRatio = nonPrintableCount / totalChars;
  const controlRatio = controlCount / totalChars;
  const highAsciiRatio = highAsciiCount / totalChars;
  
  // More conservative thresholds
  if (nonPrintableRatio > 0.05 || controlRatio > 0.05) {
    return { isBinary: true, confidence: Math.max(nonPrintableRatio, controlRatio) * 2 };
  }
  
  // High confidence if mostly printable ASCII
  if (nonPrintableRatio < 0.01 && controlRatio < 0.01 && highAsciiRatio < 0.1) {
    return { isBinary: false, confidence: 0.9 };
  }
  
  return { isBinary: false, confidence: 0.5 };
}

/**
 * Validate MIME type against allowlist
 */
function validateMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType as any);
}

/**
 * Validate file extension against allowlist
 */
function validateExtension(filename: string): boolean {
  const extension = filename.toLowerCase().match(/\.[^.]*$/)?.[0];
  if (!extension) return false;
  
  return ALLOWED_EXTENSIONS.includes(extension as any);
}

/**
 * Detect potential security risks in content
 */
function detectSecurityRisks(content: string, filename: string): string[] {
  const warnings: string[] = [];
  
  // Check for potential script injection patterns
  const scriptPatterns = [
    /<script[^>]*>/i,
    /javascript:/i,
    /vbscript:/i,
    /data:text\/html/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /<iframe[^>]*>/i,
    /<object[^>]*>/i,
    /<embed[^>]*>/i,
  ];
  
  for (const pattern of scriptPatterns) {
    if (pattern.test(content)) {
      warnings.push(`Potential script content detected in ${filename}`);
      break;
    }
  }
  
  // Check for suspicious file patterns
  if (filename.includes('..')) {
    warnings.push('Filename contains directory traversal patterns');
  }
  
  if (content.length > 5 * 1024 * 1024) { // 5MB
    warnings.push('File content is unusually large, verify it is legitimate');
  }
  
  return warnings;
}

/**
 * Main file validation function with comprehensive security checks
 */
export async function validateFile(
  file: File,
  options: FileValidationOptions = {}
): Promise<FileValidationResult> {
  const {
    maxSizeBytes = 10 * 1024 * 1024, // 10MB default
    allowBinary = false,
    strictMimeValidation = true,
    customAllowedTypes = [],
  } = options;
  
  // Basic file properties validation
  if (file.size === 0) {
    return { isValid: false, error: 'File is empty' };
  }
  
  if (file.size > maxSizeBytes) {
    return { 
      isValid: false, 
      error: `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds limit (${Math.round(maxSizeBytes / 1024 / 1024)}MB)` 
    };
  }
  
  // MIME type validation
  const allowedTypes = customAllowedTypes.length > 0 ? customAllowedTypes : ALLOWED_MIME_TYPES;
  const mimeValid = allowedTypes.includes(file.type) || validateMimeType(file.type);
  
  if (strictMimeValidation && !mimeValid) {
    return { 
      isValid: false, 
      error: `File type "${file.type}" is not allowed. Only text-based files are permitted.` 
    };
  }
  
  // Extension validation
  if (!validateExtension(file.name)) {
    return { 
      isValid: false, 
      error: `File extension is not allowed. Only text-based file extensions are permitted.` 
    };
  }
  
  try {
    // Read file content for analysis
    const buffer = await file.arrayBuffer();
    const text = await file.text();
    
    // Binary content detection
    const binaryCheck = detectBinaryContent(text, buffer);
    
    if (binaryCheck.isBinary && !allowBinary) {
      return { 
        isValid: false, 
        error: 'File appears to contain binary content and cannot be processed as text',
        isBinary: true
      };
    }
    
    // Security risk detection
    const warnings = detectSecurityRisks(text, file.name);
    
    return { 
      isValid: true, 
      warnings: warnings.length > 0 ? warnings : undefined,
      detectedType: file.type,
      isBinary: binaryCheck.isBinary
    };
    
  } catch (error) {
    return { 
      isValid: false, 
      error: `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Lightweight validation for content strings (when file upload bypassed)
 */
export function validateTextContent(content: string, filename?: string): FileValidationResult {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Content is empty' };
  }
  
  // Basic binary detection for string content
  if (content.includes('\0')) {
    return { isValid: false, error: 'Content contains binary data', isBinary: true };
  }
  
  const warnings = filename ? detectSecurityRisks(content, filename) : [];
  
  return { 
    isValid: true, 
    warnings: warnings.length > 0 ? warnings : undefined,
    isBinary: false
  };
}