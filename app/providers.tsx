'use client';

import { MsalProvider } from '@azure/msal-react';
import { ThemeProvider } from 'next-themes';
import { getMsalInstance } from '@/lib/auth/msal-config';
import { AuthProviderWrapper } from '@/lib/auth/auth-provider-wrapper';
import { SessionProvider } from '@/lib/auth/session-context';
import { FeatureRingProvider } from '@/lib/features';
import { DemoProvider } from '@/lib/demo/context';
import { ReauthNotification } from '@/components/auth/ReauthNotification';
import { AnnounceProvider } from '@/components/accessibility/announce-provider';
import { AccessibilityToolbar } from '@/components/accessibility/accessibility-toolbar';
import { BreadcrumbProvider } from '@/lib/breadcrumb/context';
import { LanguageProvider } from '@/lib/i18n';
import { CommandPaletteProvider } from '@/lib/command/context';
import { CommandPalette } from '@/components/command/CommandPalette';
import { Toaster } from 'sonner';
import dynamic from 'next/dynamic';

// Lazy load DevPanel only in development
const DevPanel = dynamic(() => import('@/components/dev-tools/DevPanel'), {
  ssr: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const msalInstance = getMsalInstance();

  return (
    <MsalProvider instance={msalInstance}>
      <AuthProviderWrapper>
        <SessionProvider>
          <FeatureRingProvider defaultRing={4}>
            <DemoProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
                storageKey="magic-button-theme"
              >
                <AnnounceProvider>
                  <LanguageProvider>
                    <BreadcrumbProvider>
                      <CommandPaletteProvider>
                        {children}
                        <CommandPalette />
                        <ReauthNotification />
                        <AccessibilityToolbar />
                        <Toaster />
                        <DevPanel />
                      </CommandPaletteProvider>
                    </BreadcrumbProvider>
                  </LanguageProvider>
                </AnnounceProvider>
              </ThemeProvider>
            </DemoProvider>
          </FeatureRingProvider>
        </SessionProvider>
      </AuthProviderWrapper>
    </MsalProvider>
  );
}