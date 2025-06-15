import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { CookieConsent } from '@/components/cookie-consent';

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
        <Providers>{children}</Providers>
        <CookieConsent
          onAccept={(preferences) => {
            console.log('Cookie preferences accepted:', preferences);
            // You can handle analytics initialization here based on preferences
            if (preferences.analytics) {
              // Initialize analytics services
            }
          }}
          onDecline={() => {
            console.log('Cookies declined');
          }}
        />
      </body>
    </html>
  );
}