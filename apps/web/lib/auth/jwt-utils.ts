import { JWTPayload } from './types';

export function parseJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to parse JWT:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  return Date.now() > expirationTime;
}

export function extractUserFromToken(token: string): {
  id: string;
  email: string;
  displayName: string;
  roles?: string[];
} | null {
  const payload = parseJWT(token);
  if (!payload) {
    return null;
  }

  // Common claim mappings across different providers
  const id = payload.sub || payload.oid || payload.user_id || '';
  const email = payload.email || payload.preferred_username || payload.upn || '';
  const displayName = payload.name || payload.given_name || payload.display_name || email;
  
  // Extract roles from various possible claims
  let roles: string[] = [];
  if (payload.roles) {
    roles = Array.isArray(payload.roles) ? payload.roles : [payload.roles];
  } else if (payload.role) {
    roles = Array.isArray(payload.role) ? payload.role : [payload.role];
  } else if (payload.groups) {
    roles = Array.isArray(payload.groups) ? payload.groups : [payload.groups];
  }

  return {
    id,
    email,
    displayName,
    roles: roles.length > 0 ? roles : undefined
  };
}