/**
 * White-label configuration for the Magic Button Assistant template
 *
 * This file contains all the customizable aspects of the application that can be
 * modified when forking this template. By keeping all customizations in this file,
 * it's easier to merge upstream updates while maintaining your customizations.
 *
 * To customize:
 * 1. Fork this repository
 * 2. Modify this file with your branding and configuration
 * 3. Run `pnpm run build` to see your changes
 * 4. When pulling updates from upstream, you'll only need to resolve conflicts in this file
 */

export const whitelabel = {
  // ========== BRANDING ==========
  branding: {
    // Application name - appears in headers, titles, and navigation
    appName: "Magic Button Assistant",

    // Short name - used in compact spaces
    appNameShort: "Magic Button",

    // Company/Organization name
    companyName: "Magic Button",

    // Tagline - appears on landing pages
    tagline: "Your intelligent AI assistant powered by Anthropic Claude",

    // Logo paths - place your logos in /public directory
    logo: {
      light: "/magic-button-logo.svg",
      dark: "/magic-button-logo.svg", // Can be different for dark mode
      favicon: "/favicon.ico",
    },

    // Brand colors - used throughout the application
    colors: {
      primary: "#233862", // Main brand color
      primaryDark: "#1a2a4a", // Darker variant
      primaryLight: "#2d4a7f", // Lighter variant
      accent: "#3b82f6", // Accent color for CTAs
    },
  },

  // ========== FEATURES ==========
  features: {
    // Authentication providers to enable
    auth: {
      azure: true, // Azure AD/Microsoft authentication
      google: false, // Google authentication (future)
      github: false, // GitHub authentication (future)
      email: false, // Email/password authentication (future)
    },

    // AI features
    ai: {
      provider: "anthropic" as "anthropic" | "openai" | "azure-openai",
      modelName: "Claude 3 Opus", // Display name for the AI model
    },

    // Telemetry and monitoring
    telemetry: {
      enabled: true,
      serviceName: "magic-button-assistant", // Used in OTEL traces
    },

    // Developer tools
    devTools: {
      koksmatCompanion: true, // Enable Koksmat Companion integration
      devPanel: true, // Show dev panel in development
    },

    // Template features
    template: {
      showIntro: true, // Show template introduction on home page
    },
  },

  // ========== CONTENT ==========
  content: {
    // Landing page content
    landing: {
      hero: {
        title: "Welcome to {appName}",
        subtitle: "{tagline}",
        ctaPrimary: "Get Started",
        ctaSecondary: "Learn More",
      },
      features: [
        {
          title: "AI-Powered",
          description: "Leverages Anthropic Claude for intelligent assistance",
          icon: "Zap",
        },
        {
          title: "Secure by Design",
          description: "Enterprise-grade security with Azure AD integration",
          icon: "Shield",
        },
        {
          title: "Highly Scalable",
          description: "Built on Next.js for optimal performance",
          icon: "Rocket",
        },
      ],
    },

    // Footer content
    footer: {
      copyright: "© {year} {companyName}. All rights reserved.",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Documentation", href: "/docs" },
      ],
    },
  },

  // ========== ROUTES ==========
  routes: {
    // Define which routes should be available
    // Set to false to disable specific sections
    home: true,
    dashboard: true,
    docs: true,
    settings: true,
    accessibility: true,
    magicbutton: true, // Demo section
  },

  // ========== METADATA ==========
  metadata: {
    // SEO and social media metadata
    title: "{appName} - {tagline}",
    description:
      "An intelligent AI assistant template powered by Anthropic Claude, built with Next.js, TypeScript, and enterprise-grade security.",
    keywords: ["AI assistant", "Claude", "Next.js", "TypeScript", "Enterprise"],

    // Open Graph / Social media
    og: {
      image: "/og-image.png", // 1200x630px recommended
      type: "website",
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      creator: "@magicbutton",
    },
  },

  // ========== EXTERNAL SERVICES ==========
  external: {
    // Analytics (future implementation)
    analytics: {
      googleAnalytics: "", // GA4 measurement ID
      plausible: "", // Plausible domain
      posthog: "", // PostHog API key
    },

    // Support and feedback
    support: {
      email: "support@magicbutton.cloud",
      docs: "https://docs.magicbutton.cloud",
      github: "https://github.com/magicbutton/magic-button-assistant",
    },
  },

  // ========== CUSTOMIZATION HELPERS ==========
  // Helper function to replace template variables
  processTemplate: (template: string): string => {
    const vars: Record<string, string> = {
      appName: whitelabel.branding.appName,
      appNameShort: whitelabel.branding.appNameShort,
      companyName: whitelabel.branding.companyName,
      tagline: whitelabel.branding.tagline,
      year: new Date().getFullYear().toString(),
    };

    return template.replace(/{(\w+)}/g, (match, key) => vars[key] || match);
  },
};

// Type-safe helper to get processed content
export function getWhitelabelContent<T extends keyof typeof whitelabel.content>(
  section: T,
): (typeof whitelabel.content)[T] {
  const content = whitelabel.content[section];

  // Process string templates in the content
  const processedContent = JSON.parse(
    JSON.stringify(content, (key, value) => {
      if (typeof value === "string") {
        return whitelabel.processTemplate(value);
      }
      return value;
    }),
  );

  return processedContent;
}

// Export type for use in components
export type WhitelabelConfig = typeof whitelabel;
