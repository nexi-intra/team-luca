'use client';

import { MsalProvider } from '@azure/msal-react';
import { ThemeProvider } from 'next-themes';
import { getMsalInstance } from '@/lib/auth/msal-config';
import { AuthProvider } from '@/lib/auth/auth-context';
import { FeatureRingProvider } from '@/lib/features';

export function Providers({ children }: { children: React.ReactNode }) {
  const msalInstance = getMsalInstance();

  return (
    <MsalProvider instance={msalInstance}>
      <AuthProvider>
        <FeatureRingProvider defaultRing={4}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </FeatureRingProvider>
      </AuthProvider>
    </MsalProvider>
  );
}