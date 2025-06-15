'use client';

import { useFeatureRingContext } from '@/lib/features/context';
import { Feature, getFeatureById } from '@/lib/features/constants';

export function useFeatureAccess(featureId: string) {
  const { hasAccessToFeature, getAccessibleFeatures } = useFeatureRingContext();
  
  const hasAccess = hasAccessToFeature(featureId);
  const feature = getFeatureById(featureId);
  
  return {
    hasAccess,
    feature,
    accessibleFeatures: getAccessibleFeatures(),
  };
}

export function useFeatures() {
  const { getAccessibleFeatures, hasAccessToFeature } = useFeatureRingContext();
  
  return {
    features: getAccessibleFeatures(),
    hasAccess: hasAccessToFeature,
  };
}