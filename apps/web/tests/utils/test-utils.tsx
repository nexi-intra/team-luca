import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { FeatureRingProvider } from '@monorepo/features';
import { AuthProvider } from '@monorepo/auth';
import { NoAuthProvider } from '@/lib/auth/providers/no-auth-provider';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialFeatureRing?: 1 | 2 | 3 | 4;
}

interface AllTheProvidersProps {
  children: React.ReactNode;
  options?: CustomRenderOptions;
}

function AllTheProviders({ children, options }: AllTheProvidersProps) {
  const mockProvider = new NoAuthProvider();
  
  return (
    <AuthProvider provider={mockProvider}>
      <FeatureRingProvider initialRing={options?.initialFeatureRing || 4}>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
      </FeatureRingProvider>
    </AuthProvider>
  );
}

function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
): ReturnType<typeof rtlRender> {
  const { initialFeatureRing, ...renderOptions } = options || {};
  
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders options={{ initialFeatureRing }}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
}

export * from '@testing-library/react';
export { customRender as render };