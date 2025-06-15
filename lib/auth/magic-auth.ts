import { AuthUser, AuthSession } from './types';
import { extractUserFromToken, isTokenExpired, parseJWT } from './jwt-utils';

export interface MagicAuthConfig {
  allowedIssuers?: string[];
  requiredClaims?: string[];
  tokenValidation?: boolean;
}

export class MagicAuthHandler {
  private config: MagicAuthConfig;

  constructor(config: MagicAuthConfig = {}) {
    this.config = {
      tokenValidation: true,
      ...config
    };
  }

  async validateToken(token: string): Promise<boolean> {
    if (!this.config.tokenValidation) {
      return true;
    }

    try {
      // Check if token is expired
      if (isTokenExpired(token)) {
        return false;
      }

      // Parse token to check claims
      const payload = parseJWT(token);
      if (!payload) {
        return false;
      }

      // Check issuer if configured
      if (this.config.allowedIssuers && this.config.allowedIssuers.length > 0) {
        const issuer = payload.iss;
        if (!issuer || !this.config.allowedIssuers.includes(issuer)) {
          return false;
        }
      }

      // Check required claims
      if (this.config.requiredClaims) {
        for (const claim of this.config.requiredClaims) {
          if (!payload[claim]) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  async createSessionFromToken(token: string): Promise<AuthSession | null> {
    try {
      // Validate token first
      const isValid = await this.validateToken(token);
      if (!isValid) {
        return null;
      }

      // Extract user information
      const userInfo = extractUserFromToken(token);
      if (!userInfo) {
        return null;
      }

      // Get token expiration
      const payload = parseJWT(token);
      const expiresAt = payload?.exp ? new Date(payload.exp * 1000) : undefined;

      // Create user object
      const user: AuthUser = {
        id: userInfo.id,
        email: userInfo.email,
        displayName: userInfo.displayName,
        roles: userInfo.roles,
        source: 'magic',
        metadata: {
          tokenClaims: payload
        }
      };

      // Create session
      const session: AuthSession = {
        user,
        token,
        expiresAt,
        source: 'magic'
      };

      return session;
    } catch (error) {
      console.error('Failed to create session from token:', error);
      return null;
    }
  }

  generateMagicLink(baseUrl: string, token: string, route?: string): string {
    const url = new URL(baseUrl);
    url.searchParams.set('magicauth', 'true');
    url.searchParams.set('token', token);
    if (route) {
      url.searchParams.set('route', route);
    }
    return url.toString();
  }
}

// Default instance
export const magicAuth = new MagicAuthHandler();