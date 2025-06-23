import { AuthUser, StoredAuthData } from './custom-auth-types';
import { AuthLogger } from './logger';

const STORAGE_KEY = 'magic-button-auth';

// Create logger instance
const logger = new AuthLogger('Auth Utils');

export function saveAuthToStorage(user: AuthUser, expiresAt: number, refreshToken?: string): void {
  if (typeof window === 'undefined') return;
  
  const data: StoredAuthData = {
    user,
    expiresAt,
    refreshToken
  };
  
  logger.info('Saving auth to storage', { userId: user.id, expiresAt, hasRefreshToken: !!refreshToken });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getAuthFromStorage(): StoredAuthData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    logger.info('Reading auth from storage', { found: !!stored });
    
    if (!stored) return null;
    
    const data = JSON.parse(stored) as StoredAuthData;
    logger.info('Parsed auth data', { userId: data.user.id, expiresAt: data.expiresAt });
    
    // Check if the session is expired
    if (data.expiresAt && data.expiresAt < Date.now()) {
      logger.info('Session expired', { expiresAt: data.expiresAt, now: Date.now() });
      clearAuthFromStorage();
      return null;
    }
    
    return data;
  } catch (error) {
    logger.info('Error reading auth from storage:', error);
    logger.error('Error reading auth from storage:', error);
    return null;
  }
}

export function clearAuthFromStorage(): void {
  if (typeof window === 'undefined') return;
  logger.info('Clearing auth from storage');
  localStorage.removeItem(STORAGE_KEY);
}

export function openAuthPopup(url: string, width = 500, height = 600): Window | null {
  if (typeof window === 'undefined') return null;
  
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  
  const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
  logger.info('Opening auth popup', { url, features });
  
  return window.open(
    url,
    'auth-popup',
    features
  );
}

export function listenForAuthMessage(): Promise<any> {
  return new Promise((resolve, reject) => {
    logger.info('Setting up auth message listener');
    
    const handleMessage = (event: MessageEvent) => {
      logger.info('Received message', { origin: event.origin, type: event.data?.type });
      
      // Verify the origin matches your auth domain
      if (event.origin !== window.location.origin) {
        logger.info('Ignoring message from different origin', { expected: window.location.origin, received: event.origin });
        return;
      }
      
      if (event.data.type === 'auth-success') {
        logger.info('Auth success message received', event.data.payload);
        window.removeEventListener('message', handleMessage);
        resolve(event.data.payload);
      } else if (event.data.type === 'auth-error') {
        logger.info('Auth error message received', event.data.error);
        window.removeEventListener('message', handleMessage);
        reject(new Error(event.data.error || 'Authentication failed'));
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Cleanup after timeout
    setTimeout(() => {
      logger.info('Auth message listener timeout');
      window.removeEventListener('message', handleMessage);
      reject(new Error('Authentication timeout'));
    }, 5 * 60 * 1000); // 5 minutes
  });
}

export function parseJwt(token: string): any {
  try {
    const parts = token.split('.');
    logger.info('Parsing JWT', { parts: parts.length });
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    logger.info('JWT payload', payload);
    return payload;
  } catch (error) {
    logger.info('Error parsing JWT:', error);
    logger.error('Error parsing JWT:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) {
    logger.info('Token has no expiration', { hasPayload: !!payload, hasExp: !!payload?.exp });
    return true;
  }
  
  const isExpired = Date.now() >= payload.exp * 1000;
  logger.info('Token expiration check', { 
    exp: payload.exp, 
    expiresAt: new Date(payload.exp * 1000).toISOString(),
    now: new Date().toISOString(),
    isExpired 
  });
  return isExpired;
}

// Generate a random state for OAuth flows
export function generateState(): string {
  const array = new Uint32Array(4);
  crypto.getRandomValues(array);
  const state = Array.from(array, dec => ('0' + dec.toString(16)).slice(-2)).join('');
  logger.info('Generated state', state);
  return state;
}

// Generate PKCE code verifier and challenge
export async function generatePKCE() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  logger.info('Generated PKCE', { 
    verifierLength: codeVerifier.length, 
    challengeLength: codeChallenge.length 
  });
  return { codeVerifier, codeChallenge };
}

export function generateCodeVerifier(): string {
  const array = new Uint32Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(array: Uint8Array | Uint32Array): string {
  const numbers = Array.from(array);
  const bytes = new Uint8Array(numbers);
  const string = String.fromCharCode.apply(null, Array.from(bytes));
  const base64 = btoa(string);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}