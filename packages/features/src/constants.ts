import { FeatureRing } from "./types";

/**
 * Feature ring metadata
 */
export const FEATURE_RINGS = {
  [FeatureRing.Experimental]: {
    name: "Experimental",
    description: "Early experimental features for internal testing",
    color: "red",
    icon: "🧪",
  },
  [FeatureRing.Preview]: {
    name: "Preview",
    description: "Preview features for early adopters",
    color: "orange",
    icon: "👁",
  },
  [FeatureRing.Beta]: {
    name: "Beta",
    description: "Beta features for wider testing",
    color: "yellow",
    icon: "β",
  },
  [FeatureRing.Stable]: {
    name: "Stable",
    description: "Stable features for all users",
    color: "green",
    icon: "✓",
  },
} as const;

/**
 * Default feature ring for new users
 */
export const DEFAULT_FEATURE_RING = FeatureRing.Stable;

/**
 * Storage key for feature ring
 */
export const FEATURE_RING_STORAGE_KEY = "feature-ring";

/**
 * Get the display name for a feature ring
 */
export function getRingName(ring: FeatureRing): string {
  return FEATURE_RINGS[ring]?.name || "Unknown";
}

/**
 * Get the description for a feature ring
 */
export function getRingDescription(ring: FeatureRing): string {
  return FEATURE_RINGS[ring]?.description || "Unknown ring level";
}

/**
 * Get the color for a feature ring
 */
export function getRingColor(ring: FeatureRing): string {
  return FEATURE_RINGS[ring]?.color || "gray";
}

/**
 * Get the icon for a feature ring
 */
export function getRingIcon(ring: FeatureRing): string {
  return FEATURE_RINGS[ring]?.icon || "?";
}

/**
 * Check if a user with a given ring has access to a feature
 */
export function hasFeatureAccess(
  userRing: FeatureRing,
  requiredRing: FeatureRing,
): boolean {
  return userRing <= requiredRing;
}

/**
 * Get all available ring levels
 */
export function getAllRings(): FeatureRing[] {
  return [
    FeatureRing.Experimental,
    FeatureRing.Preview,
    FeatureRing.Beta,
    FeatureRing.Stable,
  ];
}

/**
 * Parse a ring value from string or number
 */
export function parseFeatureRing(
  value: string | number | null | undefined,
): FeatureRing | null {
  if (value === null || value === undefined) {
    return null;
  }

  const numValue = typeof value === "string" ? parseInt(value, 10) : value;

  if (isNaN(numValue) || numValue < 1 || numValue > 4) {
    return null;
  }

  return numValue as FeatureRing;
}
