import { base64UrlDecode } from "./core";

/**
 * JWT-related utilities
 */

/**
 * Parse a JWT token without verification
 * WARNING: This does not verify the token signature
 */
export function parseJWT(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const payload = parts[1];
    const decoded = base64UrlDecode(payload);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to parse JWT:", error);
    return null;
  }
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = parseJWT(token);
    if (!payload || !payload.exp) {
      // If no expiration, consider it expired
      return true;
    }

    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();

    // Add a small buffer (5 seconds) to account for clock skew
    return currentTime >= expirationTime - 5000;
  } catch {
    // If we can't parse the token, consider it expired
    return true;
  }
}

/**
 * Get the remaining time until token expiration in seconds
 */
export function getTokenTimeRemaining(token: string): number {
  try {
    const payload = parseJWT(token);
    if (!payload || !payload.exp) {
      return 0;
    }

    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const timeRemaining = Math.max(0, expirationTime - currentTime);

    return Math.floor(timeRemaining / 1000);
  } catch {
    return 0;
  }
}

/**
 * Extract claims from a JWT token
 */
export function extractClaims(
  token: string,
  claims: string[],
): Record<string, any> {
  try {
    const payload = parseJWT(token);
    if (!payload) {
      return {};
    }

    const result: Record<string, any> = {};
    claims.forEach((claim) => {
      if (payload[claim] !== undefined) {
        result[claim] = payload[claim];
      }
    });

    return result;
  } catch {
    return {};
  }
}

/**
 * Get the token type (e.g., 'Bearer')
 */
export function getTokenType(authHeader: string): string | null {
  const parts = authHeader.split(" ");
  if (parts.length === 2) {
    return parts[0];
  }
  return null;
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string): string | null {
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1];
  }
  return null;
}

/**
 * Format a token for Authorization header
 */
export function formatAuthorizationHeader(
  token: string,
  type: string = "Bearer",
): string {
  return `${type} ${token}`;
}

/**
 * Decode JWT header
 */
export function decodeJWTHeader(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const header = parts[0];
    const decoded = base64UrlDecode(header);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to decode JWT header:", error);
    return null;
  }
}

/**
 * Get the algorithm used to sign the JWT
 */
export function getJWTAlgorithm(token: string): string | null {
  try {
    const header = decodeJWTHeader(token);
    return header?.alg || null;
  } catch {
    return null;
  }
}

/**
 * Check if a JWT uses a specific algorithm
 */
export function usesAlgorithm(token: string, algorithm: string): boolean {
  const alg = getJWTAlgorithm(token);
  return alg === algorithm;
}
