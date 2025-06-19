import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { CookieConsent } from '@/components/cookie-consent';
import { AccessibilitySkipLinks } from '@/components/compliance/accessibility-skip-links';
import { PrivacyBanner } from '@/components/compliance/privacy-banner';
import { generateMetadata } from '@/lib/whitelabel/metadata';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = generateMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
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