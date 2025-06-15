import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { ThemeProvider } from 'next-themes';
import { FeatureRingProvider } from '@/lib/features';
import { AuthProvider } from '@/lib/auth/auth-context';
import { DIContainer } from '@/lib/di/container';
import { createMockMsalInstance } from './mock-msal';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialFeatureRing?: 1 | 2 | 3 | 4;
  msalInstance?: PublicClientApplication;
  diContainer?: DIContainer;
}

interface AllTheProvidersProps {
  children: React.ReactNode;
  options?: CustomRenderOptions;
}

function AllTheProviders({ children, options }: AllTheProvidersProps) {
  const msalInstance = options?.msalInstance || createMockMsalInstance();

  return (
    <MsalProvider instance={msalInstance}>
      <AuthProvider>
        <FeatureRingProvider defaultRing={options?.initialFeatureRing || 4}>
          <ThemeProvider attribute="class" defaultTheme="light">
            {children}
          </ThemeProvider>
        </FeatureRingProvider>
      </AuthProvider>
    </MsalProvider>
  );
}

function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { initialFeatureRing, msalInstance, diContainer, ...renderOptions } = options || {};
  
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders options={{ initialFeatureRing, msalInstance, diContainer }}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
}

export * from '@testing-library/react';
export { customRender as render };