'use client';

import { useFeatureRingContext } from '@monorepo/features';

export function useFeatureRing() {
  const { currentRing, setRing } = useFeatureRingContext();
  
  return {
    currentRing,
    setRing,
    hasAccessToRing: (ring: number) => currentRing <= ring,
  };
}