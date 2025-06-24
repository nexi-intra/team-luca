import type { User, IAuthProvider as IAuthProviderBase } from "@monorepo/types";

/**
 * Extended authentication provider interface with additional methods
 */
export interface IAuthProvider extends IAuthProviderBase {
  /**
   * Refresh the authentication token
   */
  refreshToken?(): Promise<void>;

  /**
   * Get the current authentication state
   */
  getAuthState(): {
    isLoading: boolean;
    error: Error | null;
  };

  /**
   * Set custom headers for API requests
   */
  setHeaders?(headers: Record<string, string>): void;
}

/**
 * Authentication provider factory function type
 */
export type AuthProviderFactory = (config: any) => IAuthProvider;

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Authentication events
 */
export interface AuthEvents {
  onSignIn?: (user: User) => void;
  onSignOut?: () => void;
  onTokenRefresh?: () => void;
  onError?: (error: Error) => void;
}
