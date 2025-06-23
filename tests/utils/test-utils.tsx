import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { FeatureRingProvider } from '@/lib/features';
import { AuthProvider } from '@/lib/auth/auth-context';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialFeatureRing?: 1 | 2 | 3 | 4;
}

interface AllTheProvidersProps {
  children: React.ReactNode;
  options?: CustomRenderOptions;
}

function AllTheProviders({ children, options }: AllTheProvidersProps) {
  return (
    <AuthProvider>
      <FeatureRingProvider defaultRing={options?.initialFeatureRing || 4}>
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
) {
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