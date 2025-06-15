import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { CookieConsent } from '@/components/cookie-consent';
import { AccessibilitySkipLinks } from '@/components/compliance/accessibility-skip-links';
import { PrivacyBanner } from '@/components/compliance/privacy-banner';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Magic Button Assistant for XXX',
  description: 'Leverage Claude AI to its fullest potential for your specific use case',
  icons: {
    icon: '/magic-button-logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AccessibilitySkipLinks />
        <Providers>
          <main id="main-content" role="main">
            {children}
          </main>
        </Providers>
        <CookieConsent />
        <PrivacyBanner />
      </body>
    </html>
  );
}