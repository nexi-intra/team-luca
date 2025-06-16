'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import type { AccountInfo, InteractionStatus as MSALInteractionStatus } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loginRequest, getUserRoles, isGuestUser } from './msal-config';
import { AuthContextType, AuthUser, AuthSession, AuthSource } from './types';
import { extractUserFromToken, isTokenExpired } from './jwt-utils';
import { defaultReauthConfig, shouldReauthenticate, getNextReauthTime } from './reauth-config';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Handle server-side rendering gracefully
  let msalData = { instance: null as any, accounts: [] as any[], inProgress: 'None' as string };
  
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    msalData = useMsal();
  } catch (error) {
    // During SSR, useMsal will throw because MsalProvider hasn't initialized yet
    console.debug('Auth context initializing without MSAL during SSR');
  }
  
  const { instance, accounts, inProgress } = msalData;
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authSource, setAuthSource] = useState<AuthSource | null>(null);
  const [lastAuthTime, setLastAuthTime] = useState<Date | null>(null);
  const [isReauthRequired, setIsReauthRequired] = useState(false);
  const reauthTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for magic auth params
  useEffect(() => {
    const checkMagicAuth = async () => {
      const magicauth = searchParams.get('magicauth');
      const token = searchParams.get('token');
      const route = searchParams.get('route');

      if (magicauth === 'true' && token) {
        try {
          // Validate and parse the token
          if (!isTokenExpired(token)) {
            const userInfo = extractUserFromToken(token);
            if (userInfo) {
              const user: AuthUser = {
                id: userInfo.id,
                email: userInfo.email,
                displayName: userInfo.displayName,
                roles: userInfo.roles,
                source: 'magic'
              };

              const newSession: AuthSession = {
                user,
                token,
                source: 'magic'
              };

              setSession(newSession);
              setAuthSource('magic');
              setLastAuthTime(new Date());
              setIsReauthRequired(false);

              // Clear magic auth params from URL
              const url = new URL(window.location.href);
              url.searchParams.delete('magicauth');
              url.searchParams.delete('token');
              url.searchParams.delete('route');
              window.history.replaceState({}, '', url);

              // Navigate to requested route if provided
              if (route) {
                router.push(route);
              }
            }
          }
        } catch (error) {
          console.error('Magic auth failed:', error);
        }
      }
    };

    checkMagicAuth();
  }, [searchParams, router]);

  // Handle MSAL authentication
  const msalAccount = accounts[0] || null;
  
  useEffect(() => {
    const handleMsalAuth = async () => {
      if (msalAccount && !session) {
        try {
          const tokenResponse = await instance.acquireTokenSilent({
            ...loginRequest,
            account: msalAccount,
          });

          if (tokenResponse.accessToken) {
            const user: AuthUser = {
              id: msalAccount.localAccountId,
              email: msalAccount.username,
              displayName: msalAccount.name || msalAccount.username,
              roles: getUserRoles(msalAccount),
              source: 'msal',
              metadata: {
                isGuest: isGuestUser(msalAccount)
              }
            };

            const newSession: AuthSession = {
              user,
              token: tokenResponse.accessToken,
              expiresAt: tokenResponse.expiresOn || undefined,
              source: 'msal'
            };

            setSession(newSession);
            setAuthSource('msal');
            setLastAuthTime(new Date());
            setIsReauthRequired(false);
          }
        } catch (error) {
          console.error('MSAL token acquisition failed:', error);
        }
      }
    };

    // Check if no interaction is in progress
    if ((inProgress as string) === 'None' && msalAccount) {
      handleMsalAuth();
    }
  }, [msalAccount, inProgress, instance, session]);

  // Initialize auth state
  useEffect(() => {
    if ((inProgress as string) === 'None' && !searchParams.get('magicauth')) {
      setIsLoading(false);
    }
  }, [inProgress, searchParams]);

  const login = useCallback(async (source: AuthSource = 'msal') => {
    try {
      switch (source) {
        case 'msal':
          await instance.loginPopup(loginRequest);
          break;
        case 'sso':
          // Implement SSO login
          console.log('SSO login not implemented');
          break;
        case 'supabase':
          // Implement Supabase login
          console.log('Supabase login not implemented');
          break;
        default:
          throw new Error(`Unsupported auth source: ${source}`);
      }
    } catch (error) {
      throw error;
    }
  }, [instance]);

  const logout = useCallback(async () => {
    try {
      setSession(null);
      setAuthSource(null);
      
      if (authSource === 'msal' && msalAccount) {
        await instance.logoutPopup();
      }
      
      // Clear any stored tokens
      localStorage.removeItem('auth_session');
    } catch (error) {
      throw error;
    }
  }, [instance, authSource, msalAccount]);

  const switchAuthSource = useCallback(async (source: AuthSource) => {
    await logout();
    await login(source);
  }, [login, logout]);

  const refreshSession = useCallback(async () => {
    if (!session) return;

    try {
      switch (session.source) {
        case 'msal':
          if (msalAccount) {
            const response = await instance.acquireTokenSilent({
              ...loginRequest,
              account: msalAccount,
              forceRefresh: true
            });
            
            setSession(prev => prev ? {
              ...prev,
              token: response.accessToken,
              expiresAt: response.expiresOn || undefined
            } : null);
          }
          break;
        case 'magic':
          // Magic tokens typically can't be refreshed
          console.warn('Magic tokens cannot be refreshed');
          break;
        default:
          console.warn(`Refresh not implemented for source: ${session.source}`);
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      await logout();
    }
  }, [session, msalAccount, instance, logout]);

  // Re-authentication timer
  useEffect(() => {
    if (!authSource || authSource === 'magic') {
      // No re-auth for magic auth
      return;
    }

    const checkReauth = () => {
      const shouldReauth = shouldReauthenticate(authSource, lastAuthTime);
      setIsReauthRequired(shouldReauth);
      
      if (shouldReauth && session) {
        // Attempt silent re-authentication
        refreshSession().catch(() => {
          // If silent refresh fails, require interactive login
          setIsReauthRequired(true);
        });
      }
    };

    // Check immediately
    checkReauth();

    // Set up interval to check every minute
    const interval = setInterval(checkReauth, 60 * 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [authSource, lastAuthTime, session, refreshSession]);

  const skipReauth = useCallback(() => {
    // Skip re-auth for this session by updating last auth time
    setLastAuthTime(new Date());
    setIsReauthRequired(false);
  }, []);

  const nextReauthTime = getNextReauthTime(lastAuthTime);

  const value: AuthContextType = {
    isAuthenticated: !!session,
    isLoading,
    user: session?.user || null,
    session,
    authSource,
    lastAuthTime,
    nextReauthTime,
    isReauthRequired,
    login,
    logout,
    switchAuthSource,
    refreshSession,
    skipReauth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};