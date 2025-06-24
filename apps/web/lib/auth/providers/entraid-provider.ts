import { IAuthProvider, AuthProviderConfig } from './types';
import { User } from '../types';
import { createLogger } from '@/lib/logger';
import { generateCodeChallenge, generateCodeVerifier } from '../custom-auth-utils';
import { handleAuthCallback, refreshAccessToken } from './entraid-utils';
import { config } from '@/lib/config';

const logger = createLogger('EntraIDAuthProvider');

/**
 * Microsoft Entra ID (Azure AD) authentication provider
 */
export class EntraIDAuthProvider implements IAuthProvider {
  name: 'entraid' = 'entraid';
  private currentUser: User | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();
  private config: AuthProviderConfig;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor(config: AuthProviderConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    // Check for existing user in localStorage
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        
        // Check if token is still valid
        if (user.expiresAt && new Date(user.expiresAt) > new Date()) {
          this.currentUser = user;
          this.notifyListeners();
          this.scheduleTokenRefresh(user);
        } else if (user.refreshToken) {
          // Try to refresh the token
          await this.refreshToken(user);
        } else {
          // Token expired and no refresh token
          localStorage.removeItem('auth_user');
        }
      } catch (error) {
        logger.error('Failed to restore user session', error);
        localStorage.removeItem('auth_user');
      }
    }

    // Handle auth callback if we're on the callback URL
    if (typeof window !== 'undefined' && window.location.pathname === '/auth/callback') {
      await this.handleCallback();
    }
  }

  async signIn(): Promise<void> {
    const { clientId, authority, redirectUri, scopes } = this.config;
    
    if (!clientId || !authority) {
      throw new Error('Client ID and authority are required for Entra ID authentication');
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = crypto.randomUUID();

    // Store for callback
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);
    sessionStorage.setItem('auth_state', state);

    const authUrl = new URL(`${authority}/oauth2/v2.0/authorize`);
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', redirectUri || window.location.origin + '/auth/callback');
    authUrl.searchParams.append('scope', (scopes || ['openid', 'profile', 'email', 'offline_access', 'User.Read']).join(' '));
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('prompt', 'select_account');

    window.location.href = authUrl.toString();
  }

  async signOut(): Promise<void> {
    const { authority, clientId, postLogoutRedirectUri } = this.config;
    
    // Clear stored user data
    localStorage.removeItem('auth_user');
    this.currentUser = null;
    this.notifyListeners();

    // Clear refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    if (authority && clientId) {
      const logoutUrl = new URL(`${authority}/oauth2/v2.0/logout`);
      logoutUrl.searchParams.append('post_logout_redirect_uri', postLogoutRedirectUri || window.location.origin);
      window.location.href = logoutUrl.toString();
    }
  }

  getUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && 
           this.currentUser.expiresAt !== null && 
           new Date(this.currentUser.expiresAt) > new Date();
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.currentUser) {
      return null;
    }

    // Check if token needs refresh
    if (this.currentUser.expiresAt && new Date(this.currentUser.expiresAt) <= new Date()) {
      if (this.currentUser.refreshToken) {
        await this.refreshToken(this.currentUser);
      } else {
        return null;
      }
    }

    return this.currentUser.accessToken;
  }

  async handleCallback(code?: string, state?: string): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    code = code || params.get('code') || undefined;
    state = state || params.get('state') || undefined;

    if (!code) {
      logger.error('No authorization code in callback');
      throw new Error('No authorization code received');
    }

    try {
      const result = await handleAuthCallback(code, state);
      
      if (result.success && result.user) {
        this.currentUser = result.user;
        localStorage.setItem('auth_user', JSON.stringify(result.user));
        this.notifyListeners();
        this.scheduleTokenRefresh(result.user);
        
        // Redirect to home or intended destination
        window.location.href = sessionStorage.getItem('auth_redirect_url') || '/';
        sessionStorage.removeItem('auth_redirect_url');
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (error) {
      logger.error('Failed to handle auth callback', error);
      throw error;
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.listeners.add(callback);
    // Immediately call with current state
    callback(this.currentUser);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  requiresAuth(): boolean {
    return true;
  }

  private async refreshToken(user: User): Promise<void> {
    if (!user.refreshToken) {
      logger.warn('No refresh token available');
      return;
    }

    try {
      const refreshedUser = await refreshAccessToken(user.refreshToken);
      
      if (refreshedUser) {
        this.currentUser = refreshedUser;
        localStorage.setItem('auth_user', JSON.stringify(refreshedUser));
        this.notifyListeners();
        this.scheduleTokenRefresh(refreshedUser);
      } else {
        // Refresh failed, sign out
        await this.signOut();
      }
    } catch (error) {
      logger.error('Token refresh failed', error);
      await this.signOut();
    }
  }

  private scheduleTokenRefresh(user: User): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!user.expiresAt || !user.refreshToken) {
      return;
    }

    const expiresAt = new Date(user.expiresAt).getTime();
    const now = Date.now();
    const refreshIn = Math.max(0, expiresAt - now - 5 * 60 * 1000); // Refresh 5 minutes before expiry

    this.refreshTimer = setTimeout(() => {
      this.refreshToken(user);
    }, refreshIn);
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentUser);
      } catch (error) {
        logger.error('Error in auth state change listener', error);
      }
    });
  }
}