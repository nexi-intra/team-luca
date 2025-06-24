import { createBrowserClient } from '@supabase/ssr';
import { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { IAuthProvider, AuthProviderConfig } from './types';
import { User } from '../types';
import { createLogger } from '@/lib/logger';

const logger = createLogger('SupabaseAuthProvider');

/**
 * Supabase authentication provider
 */
export class SupabaseAuthProvider implements IAuthProvider {
  name: 'supabase' = 'supabase';
  private supabase: ReturnType<typeof createBrowserClient> | null = null;
  private currentUser: User | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();
  private config: AuthProviderConfig;

  constructor(config: AuthProviderConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (!this.config.supabaseUrl || !this.config.supabaseAnonKey) {
      throw new Error('Supabase URL and anonymous key are required');
    }

    this.supabase = createBrowserClient(
      this.config.supabaseUrl,
      this.config.supabaseAnonKey
    );

    // Check for existing session
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session) {
      this.currentUser = this.mapSupabaseUserToUser(session.user, session);
      this.notifyListeners();
    }

    // Subscribe to auth changes
    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      logger.info('Auth state changed', { event });
      
      if (session?.user) {
        this.currentUser = this.mapSupabaseUserToUser(session.user, session);
      } else {
        this.currentUser = null;
      }
      
      this.notifyListeners();
    });
  }

  async signIn(): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Use magic link sign in
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'email profile'
      }
    });

    if (error) {
      logger.error('Sign in failed', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { error } = await this.supabase.auth.signOut();
    if (error) {
      logger.error('Sign out failed', error);
      throw error;
    }

    this.currentUser = null;
    this.notifyListeners();
  }

  getUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.supabase) {
      return null;
    }

    const { data: { session } } = await this.supabase.auth.getSession();
    return session?.access_token || null;
  }

  async handleCallback(code?: string, state?: string): Promise<void> {
    // Supabase handles callbacks automatically via the onAuthStateChange listener
    logger.verbose('Handling callback', { code, state });
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

  private mapSupabaseUserToUser(supabaseUser: SupabaseUser, session: Session): User {
    const metadata = supabaseUser.user_metadata || {};
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: metadata.full_name || metadata.name || supabaseUser.email || 'User',
      givenName: metadata.given_name || metadata.first_name || '',
      surname: metadata.family_name || metadata.last_name || '',
      jobTitle: metadata.job_title || '',
      officeLocation: metadata.office_location || '',
      preferredLanguage: metadata.preferred_language || 'en',
      accessToken: session.access_token,
      idToken: null, // Supabase doesn't provide ID tokens in the same way
      refreshToken: session.refresh_token || null,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
      photo: metadata.avatar_url || metadata.picture || null
    };
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