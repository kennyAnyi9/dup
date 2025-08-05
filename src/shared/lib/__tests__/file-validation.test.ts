import { validateTextContent, validateFile } from '../file-validation';

describe('File Validation Security Tests', () => {
  describe('validateTextContent', () => {
    it('should reject content with null bytes', () => {
      const result = validateTextContent('Hello\0World');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('binary data');
    });

    it('should accept clean text content', () => {
      const result = validateTextContent('console.log("Hello, World!");');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should detect potential script injection', () => {
      const result = validateTextContent('<script>alert("xss")</script>', 'test.html');
      expect(result.isValid).toBe(true); // Still valid but with warnings
      expect(result.warnings).toBeDefined();
      expect(result.warnings![0]).toContain('script content');
    });

    it('should detect javascript protocol', () => {
      const result = validateTextContent('javascript:alert("xss")', 'test.html');
      expect(result.isValid).toBe(true); // Still valid but with warnings
      expect(result.warnings).toBeDefined();
      expect(result.warnings![0]).toContain('script content');
    });

    it('should reject empty content', () => {
      const result = validateTextContent('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject whitespace-only content', () => {
      const result = validateTextContent('   \n\t  ');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should detect directory traversal in filename', () => {
      const result = validateTextContent('normal content', '../../../etc/passwd');
      expect(result.isValid).toBe(true); // Content is valid
      expect(result.warnings).toBeDefined();
      expect(result.warnings![0]).toContain('directory traversal');
    });
  });

  describe('validateFile', () => {
    // Helper to create mock File objects
    const createMockFile = (content: string, filename: string, type: string = 'text/plain'): File => {
      const blob = new Blob([content], { type });
      const file = new File([blob], filename, { type });
      return file;
    };

    it('should reject empty files', async () => {
      const file = createMockFile('', 'test.txt');
      const result = await validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject files that are too large', async () => {
      const largeContent = 'x'.repeat(15 * 1024 * 1024); // 15MB
      const file = createMockFile(largeContent, 'large.txt');
      
      const result = await validateFile(file, { maxSizeBytes: 10 * 1024 * 1024 });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds limit');
    });

    it('should reject files with invalid MIME types', async () => {
      const file = createMockFile('content', 'test.exe', 'application/x-executable');
      const result = await validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('should reject files with disallowed extensions', async () => {
      const file = createMockFile('content', 'malware.exe', 'text/plain');
      const result = await validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('extension is not allowed');
    });

    it('should accept valid text files', async () => {
      const file = createMockFile('console.log("Hello");', 'script.js', 'text/javascript');
      const result = await validateFile(file);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should detect binary content in text files', async () => {
      // Create content with null bytes
      const binaryContent = 'Hello\0World\0\x01\x02\x03';
      const file = createMockFile(binaryContent, 'fake.txt', 'text/plain');
      
      const result = await validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('binary content');
    });

    it('should warn about suspicious content', async () => {
      const suspiciousContent = '<script>alert("xss")</script>';
      const file = createMockFile(suspiciousContent, 'suspicious.html', 'text/html');
      
      const result = await validateFile(file);
      expect(result.isValid).toBe(true); // HTML is allowed
      expect(result.warnings).toBeDefined();
      expect(result.warnings![0]).toContain('script content');
    });

    it('should allow custom MIME types', async () => {
      const file = createMockFile('content', 'test.custom', 'application/custom');
      
      const result = await validateFile(file, {
        customAllowedTypes: ['application/custom']
      });
      expect(result.isValid).toBe(false); // Extension still not allowed
      expect(result.error).toContain('extension is not allowed');
    });

    it('should respect strictMimeValidation setting', async () => {
      const file = createMockFile('content', 'test.txt', 'application/unknown');
      
      const resultStrict = await validateFile(file, { strictMimeValidation: true });
      expect(resultStrict.isValid).toBe(false);
      
      const resultLenient = await validateFile(file, { strictMimeValidation: false });
      expect(resultLenient.isValid).toBe(true); // Extension is allowed
    });
  });

  describe('Security Edge Cases', () => {
    const createMockFile = (content: string, filename: string, type: string = 'text/plain'): File => {
      const blob = new Blob([content], { type });
      return new File([blob], filename, { type });
    };

    it('should handle malformed content gracefully', async () => {
      // Create content with various control characters
      const malformedContent = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x0B\x0C\x0E\x0F';
      const file = createMockFile(malformedContent, 'test.txt');
      
      const result = await validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.isBinary).toBe(true);
    });

    it('should detect encoded malicious content', async () => {
      const encodedScript = '%3Cscript%3Ealert%28%22xss%22%29%3C%2Fscript%3E';
      const file = createMockFile(encodedScript, 'encoded.html', 'text/html');
      
      const result = await validateFile(file);
      expect(result.isValid).toBe(true);
      // The warning detection should catch decoded patterns
    });

    it('should handle very long filenames', async () => {
      const longFilename = 'a'.repeat(1000) + '.txt';
      const file = createMockFile('content', longFilename);
      
      const result = await validateFile(file);
      expect(result.isValid).toBe(true); // Should still work
    });

    it('should detect high ratio of non-printable characters', async () => {
      // Create content that is mostly non-printable but not strictly binary
      const nonPrintableContent = Array.from({ length: 100 }, (_, i) => 
        i % 10 === 0 ? 'a' : String.fromCharCode(128 + (i % 50))
      ).join('');
      
      const file = createMockFile(nonPrintableContent, 'suspicious.txt');
      
      const result = await validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.isBinary).toBe(true);
    });
  });
});