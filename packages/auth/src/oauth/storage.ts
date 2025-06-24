import type { User } from '@monorepo/types';
import type { OAuthState } from './pkce';

const AUTH_STORAGE_KEY = 'auth_state';
const OAUTH_STATE_KEY = 'oauth_state';

/**
 * Stored authentication data
 */
export interface StoredAuth {
  user: User;
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  expiresAt: string;
}

/**
 * Check if running in browser
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Save authentication data to storage
 */
export function saveAuthToStorage(auth: StoredAuth): void {
  if (!isBrowser()) return;
  
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  } catch (error) {
    console.error('Failed to save auth to storage:', error);
  }
}

/**
 * Get authentication data from storage
 */
export function getAuthFromStorage(): StoredAuth | null {
  if (!isBrowser()) return null;
  
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    
    const auth = JSON.parse(stored) as StoredAuth;
    
    // Check if token is expired
    const expiresAt = new Date(auth.expiresAt);
    if (expiresAt <= new Date()) {
      clearAuthFromStorage();
      return null;
    }
    
    return auth;
  } catch (error) {
    console.error('Failed to get auth from storage:', error);
    return null;
  }
}

/**
 * Clear authentication data from storage
 */
export function clearAuthFromStorage(): void {
  if (!isBrowser()) return;
  
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear auth from storage:', error);
  }
}

/**
 * Save OAuth state for PKCE flow
 */
export function saveOAuthState(state: OAuthState): void {
  if (!isBrowser()) return;
  
  try {
    sessionStorage.setItem(OAUTH_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save OAuth state:', error);
  }
}

/**
 * Get OAuth state for PKCE flow
 */
export function getOAuthState(): OAuthState | null {
  if (!isBrowser()) return null;
  
  try {
    const stored = sessionStorage.getItem(OAUTH_STATE_KEY);
    if (!stored) return null;
    
    const state = JSON.parse(stored) as OAuthState;
    
    // Check if state is older than 10 minutes
    const age = Date.now() - state.timestamp;
    if (age > 10 * 60 * 1000) {
      clearOAuthState();
      return null;
    }
    
    return state;
  } catch (error) {
    console.error('Failed to get OAuth state:', error);
    return null;
  }
}

/**
 * Clear OAuth state
 */
export function clearOAuthState(): void {
  if (!isBrowser()) return;
  
  try {
    sessionStorage.removeItem(OAUTH_STATE_KEY);
  } catch (error) {
    console.error('Failed to clear OAuth state:', error);
  }
}

/**
 * Open authentication popup window
 */
export function openAuthPopup(url: string, name: string = 'auth'): Window | null {
  if (!isBrowser()) return null;
  
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  
  return window.open(
    url,
    name,
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
  );
}

/**
 * Listen for authentication messages from popup
 */
export function listenForAuthMessage(
  callback: (data: { code?: string; state?: string; error?: string }) => void
): () => void {
  if (!isBrowser()) return () => {};
  
  const handler = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    
    if (event.data?.type === 'auth_callback') {
      callback(event.data);
    }
  };
  
  window.addEventListener('message', handler);
  
  return () => {
    window.removeEventListener('message', handler);
  };
}