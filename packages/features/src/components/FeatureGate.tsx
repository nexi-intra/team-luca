import React from "react";
import { useFeatureAccess } from "../hooks/useFeatureAccess";

/**
 * Props for FeatureGate component
 */
export interface FeatureGateProps {
  /**
   * Feature ID to check
   */
  feature: string;
  /**
   * Content to render when feature is accessible
   */
  children: React.ReactNode;
  /**
   * Content to render when feature is not accessible
   */
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders content based on feature access
 */
export function FeatureGate({
  feature,
  children,
  fallback = null,
}: FeatureGateProps) {
  const hasAccess = useFeatureAccess(feature);
  return <>{hasAccess ? children : fallback}</>;
}

/**
 * Props for MultiFeatureGate component
 */
export interface MultiFeatureGateProps {
  /**
   * Feature IDs to check
   */
  features: string[];
  /**
   * Whether all features must be accessible (AND) or just one (OR)
   */
  mode?: "all" | "any";
  /**
   * Content to render when condition is met
   */
  children: React.ReactNode;
  /**
   * Content to render when condition is not met
   */
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders content based on multiple feature access
 */
export function MultiFeatureGate({
  features,
  mode = "all",
  children,
  fallback = null,
}: MultiFeatureGateProps) {
  const { hasFeatureAccess } = useFeatureRingContext();

  const hasAccess = React.useMemo(() => {
    if (mode === "all") {
      return features.every((feature) => hasFeatureAccess(feature));
    } else {
      return features.some((feature) => hasFeatureAccess(feature));
    }
  }, [features, mode, hasFeatureAccess]);

  return <>{hasAccess ? children : fallback}</>;
}

// Import needed for MultiFeatureGate
import { useFeatureRingContext } from "../context";
