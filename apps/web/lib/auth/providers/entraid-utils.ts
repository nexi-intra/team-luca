import { User } from '../types';
import { config } from '@/lib/config';
import { createLogger } from '@monorepo/logger';

const logger = createLogger('EntraIDUtils');

export async function handleAuthCallback(code: string, state?: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Verify state if provided
    if (state) {
      const savedState = sessionStorage.getItem('auth_state');
      if (state !== savedState) {
        return { success: false, error: 'Invalid state parameter' };
      }
    }

    const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
    if (!codeVerifier) {
      return { success: false, error: 'Code verifier not found' };
    }

    // Exchange code for tokens
    const response = await fetch('/api/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        codeVerifier,
        redirectUri: config.get('auth.redirectUri') || window.location.origin + '/auth/callback'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to exchange code: ${error}` };
    }

    const data = await response.json();
    
    const user: User = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name || data.user.displayName,
      givenName: data.user.givenName || '',
      surname: data.user.surname || '',
      jobTitle: data.user.jobTitle || '',
      officeLocation: data.user.officeLocation || '',
      preferredLanguage: data.user.preferredLanguage || 'en',
      accessToken: data.accessToken,
      idToken: data.idToken || null,
      refreshToken: data.refreshToken || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      photo: data.user.photo || null
    };

    // Clean up
    sessionStorage.removeItem('auth_state');
    sessionStorage.removeItem('pkce_code_verifier');

    return { success: true, user };
  } catch (error) {
    logger.error('Auth callback failed', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      logger.error('Token refresh failed', await response.text());
      return null;
    }

    const data = await response.json();
    
    const user: User = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name || data.user.displayName,
      givenName: data.user.givenName || '',
      surname: data.user.surname || '',
      jobTitle: data.user.jobTitle || '',
      officeLocation: data.user.officeLocation || '',
      preferredLanguage: data.user.preferredLanguage || 'en',
      accessToken: data.accessToken,
      idToken: data.idToken || null,
      refreshToken: data.refreshToken || refreshToken, // Keep old refresh token if not provided
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      photo: data.user.photo || null
    };

    return user;
  } catch (error) {
    logger.error('Token refresh error', error);
    return null;
  }
}