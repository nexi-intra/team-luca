'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { AccountInfo, InteractionStatus } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { loginRequest, getUserRoles, isGuestUser } from './msal-config';

interface AuthContextType {
  account: AccountInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGuest: boolean;
  roles: string[];
  login: (loginHint?: string) => Promise<void>;
  silentLogin: () => Promise<boolean>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { instance, accounts, inProgress } = useMsal();
  const [isLoading, setIsLoading] = useState(true);

  const account = accounts[0] || null;
  const isAuthenticated = !!account;
  const isGuest = account ? isGuestUser(account) : false;
  const roles = useMemo(() => account ? getUserRoles(account) : [], [account]);

  const silentLogin = useCallback(async (): Promise<boolean> => {
    try {
      const accounts = instance.getAllAccounts();
      if (accounts.length === 0) {
        return false;
      }

      const account = accounts[0];
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: account,
      });

      if (response.account) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, [instance]);

  useEffect(() => {
    const initializeAuth = async () => {
      if (inProgress === InteractionStatus.None) {
        if (!isAuthenticated) {
          await silentLogin();
        }
        setIsLoading(false);
      }
    };

    if (inProgress === InteractionStatus.None) {
      initializeAuth();
    }
  }, [inProgress, isAuthenticated, silentLogin]);

  const login = async (loginHint?: string) => {
    try {
      const requestWithHint = loginHint 
        ? { ...loginRequest, loginHint }
        : loginRequest;
      
      await instance.loginPopup(requestWithHint);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await instance.logoutPopup();
    } catch (error) {
      throw error;
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    if (!account) {
      return null;
    }

    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account,
      });
      return response.accessToken;
    } catch (error) {
      try {
        const response = await instance.acquireTokenPopup(loginRequest);
        return response.accessToken;
      } catch (popupError) {
        return null;
      }
    }
  };

  const value: AuthContextType = {
    account,
    isAuthenticated,
    isLoading,
    isGuest,
    roles,
    login,
    silentLogin,
    logout,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};