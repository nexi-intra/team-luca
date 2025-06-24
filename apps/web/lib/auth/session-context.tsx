'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';

interface SessionContextValue {
  isSessionActive: boolean;
  isLoading: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const establishSession = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setIsSessionActive(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Exchange the auth token for a session cookie
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken || ''}`,
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.displayName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to establish session');
      }

      const data = await response.json();
      setIsSessionActive(true);

      // Refresh the page to ensure cookies are properly set
      router.refresh();
    } catch (err) {
      console.error('Session establishment error:', err);
      setError(err instanceof Error ? err.message : 'Failed to establish session');
      setIsSessionActive(false);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, router]);

  const refreshSession = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setError(null);
      
      const response = await fetch('/api/auth/session/refresh', {
        method: 'POST',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Session expired, re-establish
          await establishSession();
        } else {
          throw new Error('Failed to refresh session');
        }
      }
    } catch (err) {
      console.error('Session refresh error:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh session');
    }
  }, [isAuthenticated, establishSession]);

  // Establish session when user logs in
  useEffect(() => {
    if (isAuthenticated && user && !isSessionActive) {
      establishSession();
    } else if (!isAuthenticated) {
      setIsSessionActive(false);
      setIsLoading(false);
    }
  }, [isAuthenticated, user, isSessionActive, establishSession]);

  // Set up session refresh interval (refresh every 30 minutes)
  useEffect(() => {
    if (!isSessionActive) {
      return;
    }

    const interval = setInterval(() => {
      refreshSession();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [isSessionActive, refreshSession]);

  // Clear session on logout
  useEffect(() => {
    if (!isAuthenticated && isSessionActive) {
      fetch('/api/auth/session', {
        method: 'DELETE',
      }).catch(console.error);
      setIsSessionActive(false);
    }
  }, [isAuthenticated, isSessionActive]);

  const value: SessionContextValue = {
    isSessionActive,
    isLoading,
    error,
    refreshSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

// Hook to ensure session is active before rendering
export function useRequireSession() {
  const { isSessionActive, isLoading, error } = useSession();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isSessionActive && isAuthenticated) {
      // Session failed to establish but user is authenticated
      console.error('Session establishment failed:', error);
    } else if (!isLoading && !isAuthenticated) {
      // User is not authenticated, redirect to home
      router.push('/');
    }
  }, [isSessionActive, isLoading, isAuthenticated, error, router]);

  return { isSessionActive, isLoading, error };
}