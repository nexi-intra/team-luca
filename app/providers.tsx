'use client';

import { ThemeProvider } from 'next-themes';
import { MsalProviderWrapper } from '@/lib/auth/msal-provider';
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
import { AccessibilityProvider } from '@/lib/accessibility/context';
import dynamic from 'next/dynamic';
import { WhitelabelProvider } from '@/components/providers/WhitelabelProvider';

// Lazy load DevPanel only in development
const DevPanel = dynamic(() => import('@/components/dev-tools/DevPanel'), {
  ssr: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WhitelabelProvider>
      <MsalProviderWrapper>
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
                  <AccessibilityProvider>
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
                  </AccessibilityProvider>
                </ThemeProvider>
              </DemoProvider>
            </FeatureRingProvider>
          </SessionProvider>
        </AuthProviderWrapper>
      </MsalProviderWrapper>
    </WhitelabelProvider>
  );
}