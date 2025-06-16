'use client';

import React, { useEffect, useState } from 'react';
import { MsalProvider as BaseMsalProvider } from '@azure/msal-react';
import type { PublicClientApplication } from '@azure/msal-browser';

interface MsalProviderWrapperProps {
  children: React.ReactNode;
}

export function MsalProviderWrapper({ children }: MsalProviderWrapperProps) {
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        const { getMsalInstance } = await import('@/lib/auth/msal-instance');
        const instance = await getMsalInstance();
        setMsalInstance(instance);
      } catch (error) {
        console.error('Failed to initialize MSAL:', error);
      }
    };

    initializeMsal();
  }, []);

  if (!msalInstance) {
    return <>{children}</>;
  }

  return (
    <BaseMsalProvider instance={msalInstance}>
      {children}
    </BaseMsalProvider>
  );
}