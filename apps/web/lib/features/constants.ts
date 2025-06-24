export type FeatureRing = 1 | 2 | 3 | 4;

export interface Feature {
  id: string;
  name: string;
  description: string;
  ring: FeatureRing;
  category?: string;
}

export const FEATURE_RINGS = {
  EXPERIMENTAL: 1,
  PREVIEW: 2,
  BETA: 3,
  STABLE: 4,
} as const;

export const FEATURES: Record<string, Feature> = {
  DARK_MODE: {
    id: "dark-mode",
    name: "Dark Mode",
    description: "Toggle between light and dark theme",
    ring: 4,
    category: "UI",
  },
  AI_SUGGESTIONS: {
    id: "ai-suggestions",
    name: "AI Suggestions",
    description: "Get AI-powered suggestions and recommendations",
    ring: 3,
    category: "AI",
  },
  ADVANCED_ANALYTICS: {
    id: "advanced-analytics",
    name: "Advanced Analytics",
    description: "Access detailed analytics and insights",
    ring: 2,
    category: "Analytics",
  },
  EXPERIMENTAL_CHAT: {
    id: "experimental-chat",
    name: "Experimental Chat Interface",
    description: "New experimental chat UI with advanced features",
    ring: 1,
    category: "UI",
  },
  SIDEBAR_PANEL: {
    id: "sidebar-panel",
    name: "Sidebar Panel",
    description: "Collapsible sidebar navigation with mobile support",
    ring: 1,
    category: "UI",
  },
};

export function getAllFeatures(): Feature[] {
  return Object.values(FEATURES);
}

export function getFeaturesByRing(ring: FeatureRing): Feature[] {
  return getAllFeatures().filter((feature) => feature.ring === ring);
}

export function getFeaturesByCategory(category: string): Feature[] {
  return getAllFeatures().filter((feature) => feature.category === category);
}

export function getFeatureById(id: string): Feature | undefined {
  return Object.values(FEATURES).find((feature) => feature.id === id);
}

export function getRingName(ring: FeatureRing): string {
  switch (ring) {
    case 1:
      return "Experimental";
    case 2:
      return "Preview";
    case 3:
      return "Beta";
    case 4:
      return "Stable";
    default:
      return "Unknown";
  }
}

export function getRingDescription(ring: FeatureRing): string {
  switch (ring) {
    case 1:
      return "Highly experimental features that may change or be removed";
    case 2:
      return "Preview features that are being tested and refined";
    case 3:
      return "Beta features that are nearly ready for general availability";
    case 4:
      return "Stable features available to all users";
    default:
      return "Unknown ring level";
  }
}
