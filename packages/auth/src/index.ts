/**
 * @monorepo/auth - Authentication package for the monorepo
 */

// Provider types and interfaces
export * from './providers/types';
export * from './providers/base-provider';
export * from './providers/no-auth-provider';
export * from './providers/factory';

// OAuth/PKCE utilities
export * from './oauth/pkce';
export * from './oauth/storage';

// Session management
export * from './session/manager';

// React components and hooks
export * from './react/auth-context';

// Re-export auth types from @monorepo/types
export type {
  AuthSource,
  User,
  AuthenticatedUser,
  AuthUser,
  AuthSession,
  JWTPayload,
  SessionPayload,
  IAuthProvider as IAuthProviderBase,
  AuthProviderConfig,
} from '@monorepo/types';