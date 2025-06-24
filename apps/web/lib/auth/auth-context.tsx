'use client';

// Re-export everything from the new auth provider
export { useAuth } from './auth-provider-v2';
export { AuthProvider } from './auth-provider';
export type { AuthContextType, AuthUser, AuthSession } from './custom-auth-types';

// Provide compatibility for components expecting the old auth context
// No need to export AuthContext directly