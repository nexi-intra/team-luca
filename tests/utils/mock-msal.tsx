import React from 'react';
import { PublicClientApplication } from '@azure/msal-browser';

// Create a mock MSAL instance that doesn't require crypto
export function createMockMsalInstance(): PublicClientApplication {
  const mockLogger = {
    error: jest.fn(),
    errorPii: jest.fn(),
    warning: jest.fn(),
    warningPii: jest.fn(),
    info: jest.fn(),
    infoPii: jest.fn(),
    verbose: jest.fn(),
    verbosePii: jest.fn(),
    trace: jest.fn(),
    tracePii: jest.fn(),
    clone: jest.fn(function() { return this; }),
  };

  const mockInstance = {
    initialize: jest.fn().mockResolvedValue(undefined),
    handleRedirectPromise: jest.fn().mockResolvedValue(null),
    getAllAccounts: jest.fn().mockReturnValue([]),
    getActiveAccount: jest.fn().mockReturnValue(null),
    setActiveAccount: jest.fn(),
    loginPopup: jest.fn().mockResolvedValue({
      account: null,
      idToken: '',
      accessToken: '',
      scopes: [],
      expiresOn: null,
    }),
    logoutPopup: jest.fn().mockResolvedValue(undefined),
    acquireTokenSilent: jest.fn().mockResolvedValue({
      accessToken: 'mock-token',
      scopes: [],
      expiresOn: new Date(),
    }),
    addEventCallback: jest.fn().mockReturnValue('mock-callback-id'),
    removeEventCallback: jest.fn(),
    getLogger: jest.fn().mockReturnValue(mockLogger),
    setLogger: jest.fn(),
    getConfiguration: jest.fn().mockReturnValue({
      auth: {
        clientId: 'test-client-id',
        authority: 'https://login.microsoftonline.com/test-tenant-id',
        redirectUri: 'http://localhost:3000',
      },
    }),
    initializeWrapperLibrary: jest.fn(),
  } as any;

  return mockInstance;
}

// Mock MsalProvider that doesn't initialize MSAL
export function MockMsalProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}