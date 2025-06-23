import { Metadata } from 'next';
import { whitelabel } from '@/config/whitelabel';

/**
 * Generate metadata for pages based on whitelabel configuration
 */
export function generateMetadata(overrides?: Partial<Metadata>): Metadata {
  const processedTitle = whitelabel.processTemplate(whitelabel.metadata.title);
  const processedDescription = whitelabel.processTemplate(whitelabel.metadata.description);
  
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    title: processedTitle,
    description: processedDescription,
    keywords: whitelabel.metadata.keywords,
    icons: {
      icon: whitelabel.branding.logo.favicon,
    },
    openGraph: {
      title: processedTitle,
      description: processedDescription,
      type: whitelabel.metadata.og.type as any,
      images: whitelabel.metadata.og.image ? [whitelabel.metadata.og.image] : undefined,
    },
    twitter: {
      card: whitelabel.metadata.twitter.card as any,
      creator: whitelabel.metadata.twitter.creator,
      title: processedTitle,
      description: processedDescription,
      images: whitelabel.metadata.og.image ? [whitelabel.metadata.og.image] : undefined,
    },
    ...overrides,
  };
}