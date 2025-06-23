'use client';

// Re-export everything from the new auth provider
export { useAuth } from './auth-provider-v2';
export { AuthProvider } from './auth-provider';
export type { AuthContextType, AuthUser, AuthSession } from './custom-auth-types';

// Provide compatibility for components expecting the old auth context
import { useAuth } from './auth-provider-v2';
import { useCustomAuth } from './custom-auth-context';

export const AuthContext = {
  useAuth
};