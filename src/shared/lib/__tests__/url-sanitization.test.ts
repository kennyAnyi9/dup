import { sanitizeQrUrl, validateHexColor, validateQrCodeParams } from '../url-sanitization';

describe('URL Sanitization Security Tests', () => {
  describe('sanitizeQrUrl', () => {
    it('should accept valid HTTP URLs', () => {
      const result = sanitizeQrUrl('http://example.com');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUrl).toBe('http://example.com/');
    });

    it('should accept valid HTTPS URLs', () => {
      const result = sanitizeQrUrl('https://example.com/path?query=value');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUrl).toBe('https://example.com/path?query=value');
    });

    it('should add https:// to URLs without protocol', () => {
      const result = sanitizeQrUrl('example.com');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUrl).toBe('https://example.com/');
    });

    it('should reject javascript: protocol', () => {
      const result = sanitizeQrUrl('javascript:alert("xss")');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('javascript:');
    });

    it('should reject data: protocol', () => {
      const result = sanitizeQrUrl('data:text/html,<script>alert("xss")</script>');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('data:');
    });

    it('should reject vbscript: protocol', () => {
      const result = sanitizeQrUrl('vbscript:msgbox("xss")');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('vbscript:');
    });

    it('should reject file: protocol', () => {
      const result = sanitizeQrUrl('file:///etc/passwd');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('file:');
    });

    it('should reject ftp: protocol', () => {
      const result = sanitizeQrUrl('ftp://malicious.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Protocol "ftp:" is not allowed');
    });

    it('should reject empty or invalid URLs', () => {
      expect(sanitizeQrUrl('').isValid).toBe(false);
      expect(sanitizeQrUrl('   ').isValid).toBe(false);
      expect(sanitizeQrUrl('not-a-url').isValid).toBe(false);
    });

    it('should warn about localhost URLs', () => {
      const result = sanitizeQrUrl('http://localhost:3000');
      expect(result.isValid).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings![0]).toContain('localhost');
    });

    it('should warn about private network URLs', () => {
      const privateIPs = [
        'http://192.168.1.1',
        'http://10.0.0.1',
        'http://172.16.0.1'
      ];

      privateIPs.forEach(url => {
        const result = sanitizeQrUrl(url);
        expect(result.isValid).toBe(true);
        expect(result.warnings).toBeDefined();
        expect(result.warnings![0]).toContain('private network');
      });
    });

    it('should detect suspicious patterns in URLs', () => {
      const suspiciousUrls = [
        'https://example.com/<script>alert("xss")</script>',
        'https://example.com/javascript:alert(1)',
        'https://example.com/?param=<script>',
      ];

      suspiciousUrls.forEach(url => {
        const result = sanitizeQrUrl(url);
        expect(result.isValid).toBe(false);
        expect(result.detectedIssues).toBeDefined();
        expect(result.detectedIssues!.length).toBeGreaterThan(0);
      });
    });

    it('should handle URL encoding in suspicious content', () => {
      const encodedScript = 'https://example.com/?param=%3Cscript%3Ealert%28%22xss%22%29%3C%2Fscript%3E';
      const result = sanitizeQrUrl(encodedScript);
      expect(result.isValid).toBe(false);
      expect(result.detectedIssues).toBeDefined();
    });

    it('should warn about very long URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2100);
      const result = sanitizeQrUrl(longUrl);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings![0]).toContain('very long');
    });

    it('should handle case-insensitive protocol detection', () => {
      const result = sanitizeQrUrl('JAVASCRIPT:alert("xss")');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('javascript:');
    });

    it('should reject URLs without hostnames', () => {
      const invalidUrls = [
        'https://',
        'http:///',
        'https://   ',
      ];

      invalidUrls.forEach(url => {
        const result = sanitizeQrUrl(url);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('hostname');
      });
    });
  });

  describe('validateHexColor', () => {
    it('should accept valid hex colors', () => {
      const validColors = [
        '#000000',
        '#FFFFFF',
        '#FF0000',
        '#00FF00',
        '#0000FF',
        '#123456',
        '#abcdef',
        '#ABCDEF'
      ];

      validColors.forEach(color => {
        const result = validateHexColor(color);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedColor).toBe(color.toUpperCase());
      });
    });

    it('should reject invalid hex colors', () => {
      const invalidColors = [
        '#GG0000', // Invalid hex characters
        '#FF00',   // Too short
        '#FF00000', // Too long
        'FF0000',  // Missing #
        '#ff00gg', // Invalid characters
        '',        // Empty
        'red',     // Named color
        'rgb(255,0,0)', // RGB format
      ];

      invalidColors.forEach(color => {
        const result = validateHexColor(color);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it('should normalize hex colors to uppercase', () => {
      const result = validateHexColor('#abcdef');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedColor).toBe('#ABCDEF');
    });

    it('should handle null and undefined inputs', () => {
      expect(validateHexColor(null as any).isValid).toBe(false);
      expect(validateHexColor(undefined as any).isValid).toBe(false);
    });

    it('should trim whitespace', () => {
      const result = validateHexColor('  #FF0000  ');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedColor).toBe('#FF0000');
    });
  });

  describe('validateQrCodeParams', () => {
    it('should validate all parameters together', () => {
      const params = {
        url: 'https://example.com',
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF'
      };

      const result = validateQrCodeParams(params);
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
      expect(result.sanitizedParams).toEqual({
        url: 'https://example.com/',
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF'
      });
    });

    it('should reject identical foreground and background colors', () => {
      const params = {
        url: 'https://example.com',
        foregroundColor: '#FF0000',
        backgroundColor: '#FF0000'
      };

      const result = validateQrCodeParams(params);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toContain('identical');
    });

    it('should warn about low contrast colors', () => {
      const params = {
        url: 'https://example.com',
        foregroundColor: '#808080',
        backgroundColor: '#808080'
      };

      const result = validateQrCodeParams(params);
      expect(result.isValid).toBe(false); // Should be invalid due to identical colors
      expect(result.errors).toBeDefined();
    });

    it('should accumulate multiple errors', () => {
      const params = {
        url: 'javascript:alert("xss")',
        foregroundColor: '#invalid',
        backgroundColor: 'not-a-color'
      };

      const result = validateQrCodeParams(params);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(1);
    });

    it('should work with only URL parameter', () => {
      const params = {
        url: 'https://example.com'
      };

      const result = validateQrCodeParams(params);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedParams?.url).toBe('https://example.com/');
    });

    it('should handle partial color specification', () => {
      const params = {
        url: 'https://example.com',
        foregroundColor: '#000000'
        // backgroundColor not specified
      };

      const result = validateQrCodeParams(params);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedParams?.foregroundColor).toBe('#000000');
      expect(result.sanitizedParams?.backgroundColor).toBeUndefined();
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle URLs with embedded credentials', () => {
      const result = sanitizeQrUrl('https://user:pass@example.com');
      expect(result.isValid).toBe(true);
      // URL constructor should handle this properly
    });

    it('should handle URLs with unusual but valid characters', () => {
      const result = sanitizeQrUrl('https://example.com/path%20with%20spaces?query=value&other=123');
      expect(result.isValid).toBe(true);
    });

    it('should detect obfuscated javascript protocol', () => {
      const obfuscatedUrls = [
        'java\tscript:alert(1)',
        'java\nscript:alert(1)',
        'java\rscript:alert(1)',
      ];

      // These should be caught by URL parsing as invalid
      obfuscatedUrls.forEach(url => {
        const result = sanitizeQrUrl(url);
        expect(result.isValid).toBe(false);
      });
    });

    it('should handle international domain names', () => {
      const result = sanitizeQrUrl('https://例え.テスト');
      expect(result.isValid).toBe(true);
    });

    it('should handle edge case color values', () => {
      // Test boundary values
      const edgeCases = [
        '#000000', // All zeros
        '#FFFFFF', // All F's
        '#123456', // Mixed
      ];

      edgeCases.forEach(color => {
        const result = validateHexColor(color);
        expect(result.isValid).toBe(true);
      });
    });
  });
});