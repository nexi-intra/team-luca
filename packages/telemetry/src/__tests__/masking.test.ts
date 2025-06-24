import {
  maskSensitiveValue,
  maskSensitiveData,
  sanitizeHeaders,
  sanitizeUrl,
} from '../masking';

describe('Masking Utilities', () => {
  describe('maskSensitiveValue', () => {
    it('should mask email addresses', () => {
      expect(maskSensitiveValue('user@example.com')).toBe('***@example.com');
      expect(maskSensitiveValue('john.doe+test@company.org')).toBe('***@company.org');
    });

    it('should mask tokens and keys', () => {
      const token = 'sk_test_1234567890abcdefghijklmnop';
      expect(maskSensitiveValue(token)).toBe('sk_t***');
      
      const apiKey = 'abcdefghijklmnopqrstuvwxyz123456';
      expect(maskSensitiveValue(apiKey)).toBe('abcd***');
    });

    it('should mask credit card numbers', () => {
      expect(maskSensitiveValue('4111111111111111')).toBe('************1111');
      expect(maskSensitiveValue('5500000000000004')).toBe('************0004');
    });

    it('should mask phone numbers', () => {
      expect(maskSensitiveValue('+1234567890')).toBe('+******7890');
      expect(maskSensitiveValue('9876543210')).toBe('******3210');
    });

    it('should not mask regular strings', () => {
      expect(maskSensitiveValue('hello world')).toBe('hello world');
      expect(maskSensitiveValue('12345')).toBe('12345'); // Too short for credit card
    });

    it('should handle non-string values', () => {
      expect(maskSensitiveValue(123)).toBe(123);
      expect(maskSensitiveValue(true)).toBe(true);
      expect(maskSensitiveValue(null)).toBe(null);
      expect(maskSensitiveValue(undefined)).toBe(undefined);
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask sensitive fields in objects', () => {
      const data = {
        username: 'john',
        password: 'secret123',
        apiKey: 'key123',
        email: 'john@example.com',
        regular: 'data',
      };

      const masked = maskSensitiveData(data);
      expect(masked).toEqual({
        username: 'john',
        password: '***REDACTED***',
        apiKey: '***REDACTED***',
        email: '***REDACTED***',
        regular: 'data',
      });
    });

    it('should remove forbidden fields', () => {
      const data = {
        authorization: 'Bearer token123',
        cookie: 'session=abc123',
        'x-api-key': 'secret',
        regular: 'data',
      };

      const masked = maskSensitiveData(data);
      expect(masked).toEqual({
        regular: 'data',
      });
    });

    it('should handle nested objects', () => {
      const data = {
        user: {
          name: 'John',
          credentials: {
            password: 'secret',
            token: 'abc123',
          },
        },
      };

      const masked = maskSensitiveData(data);
      expect(masked).toEqual({
        user: {
          name: 'John',
          credentials: {
            password: '***REDACTED***',
            token: '***REDACTED***',
          },
        },
      });
    });

    it('should handle arrays', () => {
      const data = [
        { password: 'secret1' },
        { password: 'secret2' },
        { regular: 'data' },
      ];

      const masked = maskSensitiveData(data);
      expect(masked).toEqual([
        { password: '***REDACTED***' },
        { password: '***REDACTED***' },
        { regular: 'data' },
      ]);
    });

    it('should handle null and undefined', () => {
      expect(maskSensitiveData(null)).toBe(null);
      expect(maskSensitiveData(undefined)).toBe(undefined);
    });

    it('should handle primitive values', () => {
      expect(maskSensitiveData('string')).toBe('string');
      expect(maskSensitiveData(123)).toBe(123);
      expect(maskSensitiveData(true)).toBe(true);
    });
  });

  describe('sanitizeHeaders', () => {
    it('should remove forbidden headers', () => {
      const headers = {
        'Authorization': 'Bearer token',
        'Cookie': 'session=abc',
        'X-API-Key': 'secret',
        'Content-Type': 'application/json',
      };

      const sanitized = sanitizeHeaders(headers);
      expect(sanitized).toEqual({
        'Content-Type': 'application/json',
      });
    });

    it('should handle case-insensitive header names', () => {
      const headers = {
        'authorization': 'Bearer token',
        'COOKIE': 'session=abc',
        'x-api-key': 'secret',
      };

      const sanitized = sanitizeHeaders(headers);
      expect(sanitized).toEqual({});
    });

    it('should handle array header values', () => {
      const headers = {
        'Accept': ['application/json', 'text/plain'],
        'Cookie': ['session1', 'session2'],
      };

      const sanitized = sanitizeHeaders(headers);
      expect(sanitized).toEqual({
        'Accept': ['application/json', 'text/plain'],
      });
    });
  });

  describe('sanitizeUrl', () => {
    it('should mask sensitive query parameters', () => {
      const url = 'https://api.example.com/endpoint?apiKey=secret&user=john&password=pass123';
      const sanitized = sanitizeUrl(url);
      
      expect(sanitized).toContain('apiKey=***REDACTED***');
      expect(sanitized).toContain('password=***REDACTED***');
      expect(sanitized).toContain('user=john');
    });

    it('should mask userinfo in URLs', () => {
      const url = 'https://user:password@example.com/path';
      const sanitized = sanitizeUrl(url);
      
      expect(sanitized).toBe('https://***@example.com/path');
    });

    it('should handle URLs without sensitive data', () => {
      const url = 'https://example.com/path?page=1&limit=10';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('should handle invalid URLs gracefully', () => {
      const invalidUrl = 'not-a-url';
      expect(sanitizeUrl(invalidUrl)).toBe(invalidUrl);
    });

    it('should handle complex query parameters', () => {
      const url = 'https://api.example.com?token=abc123&data[secret]=hidden&normal=value';
      const sanitized = sanitizeUrl(url);
      
      expect(sanitized).toContain('token=***REDACTED***');
      expect(sanitized).toContain('data%5Bsecret%5D=***REDACTED***');
      expect(sanitized).toContain('normal=value');
    });
  });
});