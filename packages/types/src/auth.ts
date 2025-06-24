/**
 * Authentication source types
 */
export type AuthSource = "entraid" | "sso" | "supabase" | "magic" | "custom";

/**
 * Base user interface
 */
export interface User {
  id: string;
  email: string;
  name: string;
  givenName?: string;
  surname?: string;
  jobTitle?: string;
  officeLocation?: string;
  preferredLanguage?: string;
  photo?: string | null;
}

/**
 * User with authentication details
 */
export interface AuthenticatedUser extends User {
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
}

/**
 * Simplified auth user for session management
 */
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roles?: string[];
  source: AuthSource;
  metadata?: Record<string, any>;
}

/**
 * Authentication session
 */
export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt?: Date;
  source: AuthSource;
}

/**
 * JWT token payload
 */
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

/**
 * Session payload for internal session management
 */
export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  exp?: number;
  iat?: number;
}

/**
 * Authentication provider interface
 */
export interface IAuthProvider {
  name: "none" | "entraid" | "supabase";
  initialize(): Promise<void>;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
  getUser(): User | null;
  isAuthenticated(): boolean;
  getAccessToken(): Promise<string | null>;
  handleCallback?(code?: string, state?: string): Promise<void>;
  onAuthStateChange(callback: (user: User | null) => void): () => void;
  requiresAuth(): boolean;
}

/**
 * Authentication provider configuration
 */
export interface AuthProviderConfig {
  provider: "none" | "entraid" | "supabase";
  clientId?: string;
  authority?: string;
  redirectUri?: string;
  postLogoutRedirectUri?: string;
  scopes?: string[];
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}
