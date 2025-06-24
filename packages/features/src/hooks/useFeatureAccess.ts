import { useMemo } from "react";
import { useFeatureRingContext } from "../context";
import type { Feature } from "../types";

/**
 * Hook to check access to a single feature
 */
export function useFeatureAccess(featureId: string): boolean {
  const { hasFeatureAccess } = useFeatureRingContext();
  return hasFeatureAccess(featureId);
}

/**
 * Hook to check access to multiple features
 */
export function useFeatures(featureIds: string[]): Record<string, boolean> {
  const { hasFeatureAccess } = useFeatureRingContext();

  return useMemo(() => {
    const access: Record<string, boolean> = {};
    featureIds.forEach((id) => {
      access[id] = hasFeatureAccess(id);
    });
    return access;
  }, [featureIds, hasFeatureAccess]);
}

/**
 * Hook to get all accessible features
 */
export function useAccessibleFeatures(): Feature[] {
  const { getAccessibleFeatures } = useFeatureRingContext();
  return getAccessibleFeatures();
}
