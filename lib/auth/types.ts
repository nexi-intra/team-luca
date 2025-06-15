export type AuthSource = 'msal' | 'sso' | 'supabase' | 'magic' | 'custom';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roles?: string[];
  source: AuthSource;
  metadata?: Record<string, any>;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt?: Date;
  source: AuthSource;
}

export interface MagicAuthParams {
  token: string;
  route?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  session: AuthSession | null;
  authSource: AuthSource | null;
  lastAuthTime: Date | null;
  nextReauthTime: Date | null;
  isReauthRequired: boolean;
  login: (source?: AuthSource) => Promise<void>;
  logout: () => Promise<void>;
  switchAuthSource: (source: AuthSource) => Promise<void>;
  refreshSession: () => Promise<void>;
  skipReauth: () => void;
}

export interface JWTPayload {
  sub?: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  roles?: string[];
  exp?: number;
  iat?: number;
  [key: string]: any;
}