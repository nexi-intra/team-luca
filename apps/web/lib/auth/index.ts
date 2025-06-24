// Auth context
export { useAuth, AuthProvider } from './auth-context';
export type { AuthContextType as MainAuthContextType } from './auth-context';

// Types
export type { 
  User, 
  AuthUser as LegacyAuthUser, 
  AuthSession as LegacyAuthSession, 
  AuthSource,
  MagicAuthParams,
  JWTPayload 
} from './types';

// Utils
export * from './jwt-utils';
export * from './magic-auth';

// Components
export { AuthStatus } from '@/components/auth/AuthStatus';