'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AuthProviderFactory } from './providers/factory';
import { IAuthProvider } from './providers/types';
import { User } from './types';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AuthProviderV2');

// Extended user type for backward compatibility
interface ExtendedUser extends User {
  displayName?: string;
  roles?: string[];
  source?: string;
  metadata?: Record<string, any>;
}

interface AuthContextType {
  user: ExtendedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for signOut
  loginWithPopup: () => Promise<void>; // Alias for signIn
  refreshSession: () => Promise<void>;
  requiresAuth: boolean;
  // Legacy properties for compatibility
  authSource: string | null;
  lastAuthTime: Date | null;
  nextReauthTime: Date | null;
  isReauthRequired: boolean;
  skipReauth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProviderV2: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastAuthTime, setLastAuthTime] = useState<Date | null>(null);
  const providerRef = useRef<IAuthProvider | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Create the auth provider
        const provider = AuthProviderFactory.create();
        providerRef.current = provider;
        
        // Initialize the provider
        await provider.initialize();
        
        // Subscribe to auth state changes
        unsubscribeRef.current = provider.onAuthStateChange((newUser) => {
          logger.info('Auth state changed', { user: newUser?.email });
          
          // Extend user with compatibility fields
          const extendedUser: ExtendedUser | null = newUser ? {
            ...newUser,
            displayName: newUser.name,
            source: provider.name,
            roles: [],
            metadata: {}
          } : null;
          
          setUser(extendedUser);
          setError(null);
          if (extendedUser) {
            setLastAuthTime(new Date());
          }
        });
        
        // Get initial user state
        const currentUser = provider.getUser();
        const extendedUser: ExtendedUser | null = currentUser ? {
          ...currentUser,
          displayName: currentUser.name,
          source: provider.name,
          roles: [],
          metadata: {}
        } : null;
        setUser(extendedUser);
        if (extendedUser) {
          setLastAuthTime(new Date());
        }
        
      } catch (err) {
        logger.error('Failed to initialize auth provider', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Cleanup
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const signIn = async () => {
    if (!providerRef.current) {
      throw new Error('Auth provider not initialized');
    }
    
    try {
      setError(null);
      await providerRef.current.signIn();
    } catch (err) {
      logger.error('Sign in failed', err);
      setError(err as Error);
      throw err;
    }
  };

  const signOut = async () => {
    if (!providerRef.current) {
      throw new Error('Auth provider not initialized');
    }
    
    try {
      setError(null);
      await providerRef.current.signOut();
    } catch (err) {
      logger.error('Sign out failed', err);
      setError(err as Error);
      throw err;
    }
  };

  const refreshSession = async () => {
    // For now, just re-initialize to refresh the session
    if (providerRef.current) {
      const currentUser = providerRef.current.getUser();
      if (currentUser) {
        const extendedUser: ExtendedUser = {
          ...currentUser,
          displayName: currentUser.name,
          source: providerRef.current.name,
          roles: [],
          metadata: {}
        };
        setUser(extendedUser);
        setLastAuthTime(new Date());
      }
    }
  };

  const skipReauth = () => {
    // No-op for compatibility
    logger.info('Skip reauth called');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: providerRef.current?.isAuthenticated() || false,
    isLoading,
    error,
    signIn,
    signOut,
    logout: signOut, // Alias
    loginWithPopup: signIn, // Alias
    refreshSession,
    requiresAuth: providerRef.current?.requiresAuth() ?? true,
    // Legacy properties
    authSource: providerRef.current?.name || null,
    lastAuthTime,
    nextReauthTime: null, // Not implemented in new system
    isReauthRequired: false, // Not implemented in new system
    skipReauth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export for compatibility
export const AuthProviderWrapper = AuthProviderV2;