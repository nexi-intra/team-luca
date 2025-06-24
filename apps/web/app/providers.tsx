"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@monorepo/auth";
import { AuthProviderFactory } from "@/lib/auth/providers/factory";
import { SessionProvider } from "@/lib/auth/session-context";
import { FeatureRingProvider } from "@monorepo/features";
import { DemoProvider } from "@/lib/demo/context";
import { ReauthNotification } from "@/components/auth/ReauthNotification";
import { AnnounceProvider } from "@/components/accessibility/announce-provider";
import { AccessibilityToolbar } from "@/components/accessibility/accessibility-toolbar";
import { BreadcrumbProvider } from "@/lib/breadcrumb/context";
import { LanguageProvider } from "@/lib/i18n";
import { CommandPaletteProvider } from "@/lib/command/context";
import { CommandPalette } from "@/components/command/CommandPalette";
import { Toaster } from "sonner";
import { AccessibilityProvider } from "@/lib/accessibility/context";
import dynamic from "next/dynamic";
import { WhitelabelProvider } from "@/components/providers/WhitelabelProvider";
import { AuthCallbackHandler } from "@/components/auth/AuthCallbackHandler";
import { initializeConsoleWrapper } from "@/lib/console-wrapper";
import React, { Suspense } from "react";

// Initialize console wrapper on the client side
if (typeof window !== "undefined") {
  initializeConsoleWrapper();
}

// Lazy load DevPanel only in development
const DevPanel = dynamic(() => import("@/components/dev-tools/DevPanel"), {
  ssr: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WhitelabelProvider>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      >
        <AuthProvider provider={AuthProviderFactory.create()}>
          <SessionProvider>
            <FeatureRingProvider initialRing={4}>
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
                            <Suspense
                              fallback={<div className="min-h-screen" />}
                            >
                              <AuthCallbackHandler>
                                {children}
                              </AuthCallbackHandler>
                            </Suspense>
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
        </AuthProvider>
      </Suspense>
    </WhitelabelProvider>
  );
}
