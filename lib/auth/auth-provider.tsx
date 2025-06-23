'use client';

import React from 'react';
import { AuthProviderV2, useAuth as useAuthV2 } from './auth-provider-v2';

// Export the auth hook
export { useAuth } from './auth-provider-v2';

// Auth Provider wrapper
export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProviderV2>
      {children}
    </AuthProviderV2>
  );
}

// Create a compatibility layer for existing auth context usage
export const AuthProvider = AuthProviderWrapper;

// Export compatibility hooks for custom auth context (if still needed)
export { useCustomAuth } from './custom-auth-context';