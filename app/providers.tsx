'use client';

import { MsalProvider } from '@azure/msal-react';
import { ThemeProvider } from 'next-themes';
import { getMsalInstance } from '@/lib/auth/msal-config';
import { AuthProvider } from '@/lib/auth/auth-context';
import { SessionProvider } from '@/lib/auth/session-context';
import { FeatureRingProvider } from '@/lib/features';
import { DemoProvider } from '@/lib/demo/context';

export function Providers({ children }: { children: React.ReactNode }) {
  const msalInstance = getMsalInstance();

  return (
    <MsalProvider instance={msalInstance}>
      <AuthProvider>
        <SessionProvider>
          <FeatureRingProvider defaultRing={4}>
            <DemoProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
              </ThemeProvider>
            </DemoProvider>
          </FeatureRingProvider>
        </SessionProvider>
      </AuthProvider>
    </MsalProvider>
  );
}