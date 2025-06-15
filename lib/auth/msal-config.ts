import { Configuration, LogLevel, PublicClientApplication } from '@azure/msal-browser';

const getRedirectUri = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}`,
    redirectUri: getRedirectUri(),
    postLogoutRedirectUri: getRedirectUri(),
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
        }
      },
      piiLoggingEnabled: false,
    },
  },
};

export const loginRequest = {
  scopes: ['User.Read', 'User.ReadWrite', 'openid', 'profile', 'email'],
};

export const graphScopes = {
  scopes: ['User.Read', 'User.ReadWrite', 'Directory.Read.All'],
};

let msalInstance: PublicClientApplication | null = null;

export const getMsalInstance = () => {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
  }
  return msalInstance;
};

export const isGuestUser = (account: any): boolean => {
  return account?.idTokenClaims?.idp !== undefined && 
         account?.idTokenClaims?.idp !== 'https://sts.windows.net/' + process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID + '/';
};

export const getUserRoles = (account: any): string[] => {
  return account?.idTokenClaims?.roles || [];
};