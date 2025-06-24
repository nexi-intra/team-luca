import {
  parseJWT,
  isTokenExpired,
  getTokenTimeRemaining,
  extractClaims,
  getTokenType,
  extractTokenFromHeader,
  formatAuthorizationHeader,
  decodeJWTHeader,
  getJWTAlgorithm,
  usesAlgorithm,
} from '../jwt';

// Mock base64UrlDecode
jest.mock('../core', () => ({
  base64UrlDecode: jest.fn((str: string) => {
    // Simple mock implementation
    const base64 = str
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(str.length + (4 - str.length % 4) % 4, '=');
    return Buffer.from(base64, 'base64').toString();
  }),
}));

describe('JWT utilities', () => {
  const mockHeader = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const mockPayload = {
    sub: '1234567890',
    name: 'John Doe',
    email: 'john@example.com',
    iat: 1516239022,
    exp: 1516242622 // 1 hour later
  };

  const createMockToken = (payload = mockPayload, header = mockHeader) => {
    const headerStr = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = 'mock-signature';
    return `${headerStr}.${payloadStr}.${signature}`;
  };

  describe('parseJWT', () => {
    it('should parse a valid JWT', () => {
      const token = createMockToken();
      const parsed = parseJWT(token);
      
      expect(parsed).toEqual(mockPayload);
    });

    it('should return null for invalid token', () => {
      expect(parseJWT('invalid')).toBeNull();
      expect(parseJWT('only.two')).toBeNull();
      expect(parseJWT('')).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return false for non-expired token', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const token = createMockToken({ ...mockPayload, exp: futureExp });
      
      expect(isTokenExpired(token)).toBe(false);
    });

    it('should return true for expired token', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const token = createMockToken({ ...mockPayload, exp: pastExp });
      
      expect(isTokenExpired(token)).toBe(true);
    });

    it('should return true for token without exp', () => {
      const { exp, ...payloadWithoutExp } = mockPayload;
      const token = createMockToken(payloadWithoutExp);
      
      expect(isTokenExpired(token)).toBe(true);
    });

    it('should return true for invalid token', () => {
      expect(isTokenExpired('invalid')).toBe(true);
    });

    it('should account for clock skew', () => {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const tokenExpIn3Seconds = createMockToken({ ...mockPayload, exp: nowInSeconds + 3 });
      
      // Token expires in 3 seconds, but with 5 second buffer, should be expired
      expect(isTokenExpired(tokenExpIn3Seconds)).toBe(true);
    });
  });

  describe('getTokenTimeRemaining', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return correct time remaining', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const token = createMockToken({ ...mockPayload, exp: futureExp });
      
      expect(getTokenTimeRemaining(token)).toBe(3600);
    });

    it('should return 0 for expired token', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const token = createMockToken({ ...mockPayload, exp: pastExp });
      
      expect(getTokenTimeRemaining(token)).toBe(0);
    });

    it('should return 0 for invalid token', () => {
      expect(getTokenTimeRemaining('invalid')).toBe(0);
    });
  });

  describe('extractClaims', () => {
    it('should extract specified claims', () => {
      const token = createMockToken();
      const claims = extractClaims(token, ['sub', 'name', 'email']);
      
      expect(claims).toEqual({
        sub: '1234567890',
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    it('should ignore non-existent claims', () => {
      const token = createMockToken();
      const claims = extractClaims(token, ['sub', 'nonexistent']);
      
      expect(claims).toEqual({
        sub: '1234567890',
      });
    });

    it('should return empty object for invalid token', () => {
      const claims = extractClaims('invalid', ['sub']);
      expect(claims).toEqual({});
    });
  });

  describe('getTokenType', () => {
    it('should extract token type from header', () => {
      expect(getTokenType('Bearer token123')).toBe('Bearer');
      expect(getTokenType('Basic credentials')).toBe('Basic');
    });

    it('should return null for invalid header', () => {
      expect(getTokenType('token123')).toBeNull();
      expect(getTokenType('')).toBeNull();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract bearer token', () => {
      expect(extractTokenFromHeader('Bearer token123')).toBe('token123');
      expect(extractTokenFromHeader('bearer token123')).toBe('token123');
    });

    it('should return null for non-bearer token', () => {
      expect(extractTokenFromHeader('Basic credentials')).toBeNull();
      expect(extractTokenFromHeader('token123')).toBeNull();
    });
  });

  describe('formatAuthorizationHeader', () => {
    it('should format authorization header', () => {
      expect(formatAuthorizationHeader('token123')).toBe('Bearer token123');
      expect(formatAuthorizationHeader('credentials', 'Basic')).toBe('Basic credentials');
    });
  });

  describe('decodeJWTHeader', () => {
    it('should decode JWT header', () => {
      const token = createMockToken();
      const header = decodeJWTHeader(token);
      
      expect(header).toEqual(mockHeader);
    });

    it('should return null for invalid token', () => {
      expect(decodeJWTHeader('invalid')).toBeNull();
    });
  });

  describe('getJWTAlgorithm', () => {
    it('should get JWT algorithm', () => {
      const token = createMockToken();
      expect(getJWTAlgorithm(token)).toBe('HS256');
    });

    it('should return null for invalid token', () => {
      expect(getJWTAlgorithm('invalid')).toBeNull();
    });
  });

  describe('usesAlgorithm', () => {
    it('should check algorithm correctly', () => {
      const token = createMockToken();
      expect(usesAlgorithm(token, 'HS256')).toBe(true);
      expect(usesAlgorithm(token, 'RS256')).toBe(false);
    });

    it('should return false for invalid token', () => {
      expect(usesAlgorithm('invalid', 'HS256')).toBe(false);
    });
  });
});