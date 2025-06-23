'use client';

import { useAuthCallback } from '@/lib/auth/use-auth-callback';
import { useSearchParams } from 'next/navigation';
import { useMemo, useEffect } from 'react';
import { AuthLogger } from '@/lib/auth/logger';

const logger = new AuthLogger('AuthCallbackHandler');

export function AuthCallbackHandler({ children }: { children: React.ReactNode }) {
  // This hook handles auth callbacks on any page
  useAuthCallback();
  
  const searchParams = useSearchParams();
  
  // Check if we have auth-related query parameters
  const hasAuthParams = useMemo(() => {
    const hasCode = searchParams.has('code');
    const hasState = searchParams.has('state');
    const hasError = searchParams.has('error');
    const hasErrorDesc = searchParams.has('error_description');
    
    const result = hasCode || hasState || hasError || hasErrorDesc;
    
    if (result) {
      logger.info('Auth params detected, blocking render', {
        hasCode,
        hasState,
        hasError,
        hasErrorDesc
      });
    }
    
    return result;
  }, [searchParams]);
  
  // If we have auth params, show a loading state instead of children
  if (hasAuthParams) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent absolute inset-0 mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Completing authentication</p>
            <p className="text-sm text-muted-foreground">Please wait while we sign you in...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}