export interface AuthUser {
  id: string;
  email: string;
  name: string;
  displayName?: string; // Make optional for compatibility
  roles?: string[];
  picture?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  source?: 'custom' | 'entraid' | 'sso' | 'supabase' | 'magic';
  metadata?: Record<string, any>;
}

export interface AuthSession {
  user: AuthUser;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: Error;
}

export interface AuthConfig {
  clientId: string;
  authority: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  scopes: string[];
  popup?: {
    width?: number;
    height?: number;
  };
  persistence?: {
    enabled: boolean;
    storageKey?: string;
  };
  silentAuth?: {
    enabled: boolean;
    checkInterval?: number; // in milliseconds
  };
}

export interface AuthContextType {
  session: AuthSession | null;
  login: (hint?: string) => Promise<void>;
  loginWithPopup: (hint?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: Error | null;
}

export interface StoredAuthData {
  user: AuthUser;
  expiresAt: number;
  refreshToken?: string;
}