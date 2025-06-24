import { User } from '../types';

/**
 * Authentication provider interface that all auth providers must implement
 */
export interface IAuthProvider {
  /**
   * Provider name for identification
   */
  name: 'none' | 'entraid' | 'supabase';

  /**
   * Initialize the auth provider
   */
  initialize(): Promise<void>;

  /**
   * Sign in the user
   */
  signIn(): Promise<void>;

  /**
   * Sign out the user
   */
  signOut(): Promise<void>;

  /**
   * Get the current user
   */
  getUser(): User | null;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean;

  /**
   * Get access token if available
   */
  getAccessToken(): Promise<string | null>;

  /**
   * Handle authentication callback (for OAuth flows)
   */
  handleCallback?(code?: string, state?: string): Promise<void>;

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void;

  /**
   * Check if the provider requires authentication
   */
  requiresAuth(): boolean;

  /**
   * Get the current authentication state
   */
  getAuthState(): {
    isLoading: boolean;
    error: Error | null;
  };
}

/**
 * Configuration for auth providers
 */
export interface AuthProviderConfig {
  provider: 'none' | 'entraid' | 'supabase';
  clientId?: string;
  authority?: string;
  redirectUri?: string;
  postLogoutRedirectUri?: string;
  scopes?: string[];
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}