// Client-side only MSAL instance management
import type { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './msal-config';

let msalInstance: PublicClientApplication | null = null;

export async function getMsalInstance(): Promise<PublicClientApplication> {
  if (typeof window === 'undefined') {
    throw new Error('MSAL can only be initialized on the client side');
  }

  if (!msalInstance) {
    const { PublicClientApplication } = await import('@azure/msal-browser');
    msalInstance = new PublicClientApplication(msalConfig);
    await msalInstance.initialize();
  }

  return msalInstance;
}