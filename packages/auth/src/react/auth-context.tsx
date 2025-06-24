'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, AuthSession, AuthSource } from '@monorepo/types';
import type { IAuthProvider } from '../providers/types';

/**
 * Authentication context value
 */
export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  session: AuthSession | null;
  authSource: AuthSource | null;
  signIn: (source?: AuthSource) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Authentication provider props
 */
export interface AuthProviderProps {
  children: React.ReactNode;
  provider: IAuthProvider;
  onSessionExpired?: () => void;
}

/**
 * Authentication provider component
 */
export function AuthProvider({ children, provider, onSessionExpired }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);

  // Initialize authentication
  useEffect(() => {
    const initialize = async () => {
      try {
        await provider.initialize();
        const currentUser = provider.getUser();
        setUser(currentUser);
        
        if (currentUser) {
          setSession({
            user: {
              id: currentUser.id,
              email: currentUser.email,
              displayName: currentUser.name,
              source: provider.name as AuthSource,
            },
            token: await provider.getAccessToken() || '',
            source: provider.name as AuthSource,
          });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [provider]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = provider.onAuthStateChange((newUser) => {
      setUser(newUser);
      
      if (newUser) {
        provider.getAccessToken().then(token => {
          setSession({
            user: {
              id: newUser.id,
              email: newUser.email,
              displayName: newUser.name,
              source: provider.name as AuthSource,
            },
            token: token || '',
            source: provider.name as AuthSource,
          });
        });
      } else {
        setSession(null);
      }
    });

    return unsubscribe;
  }, [provider]);

  const signIn = useCallback(async (source?: AuthSource) => {
    setIsLoading(true);
    try {
      await provider.signIn();
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await provider.signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  const refreshSession = useCallback(async () => {
    if ('refreshToken' in provider && typeof provider.refreshToken === 'function') {
      try {
        await provider.refreshToken();
      } catch (error) {
        console.error('Session refresh failed:', error);
        if (onSessionExpired) {
          onSessionExpired();
        }
        throw error;
      }
    }
  }, [provider, onSessionExpired]);

  const getAccessToken = useCallback(async () => {
    return provider.getAccessToken();
  }, [provider]);

  const value: AuthContextValue = {
    isAuthenticated: !!user,
    isLoading,
    user,
    session,
    authSource: provider.name as AuthSource,
    signIn,
    signOut,
    refreshSession,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to require authentication
 */
export function useRequireAuth(redirectTo?: string) {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && redirectTo) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  return { isAuthenticated, isLoading };
}