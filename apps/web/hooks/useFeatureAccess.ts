"use client";

import { useFeatureRingContext } from "@monorepo/features";
import { Feature, getFeatureById } from "@monorepo/features";

export function useFeatureAccess(featureId: string) {
  const { hasFeatureAccess, getAccessibleFeatures } = useFeatureRingContext();

  const hasAccess = hasFeatureAccess(featureId);
  const feature = getFeatureById(featureId);

  return {
    hasAccess,
    feature,
    accessibleFeatures: getAccessibleFeatures(),
  };
}

export function useFeatures() {
  const { getAccessibleFeatures, hasFeatureAccess } = useFeatureRingContext();

  return {
    features: getAccessibleFeatures(),
    hasAccess: hasFeatureAccess,
  };
}
