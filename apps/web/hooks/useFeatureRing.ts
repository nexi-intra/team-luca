'use client';

import { useFeatureRingContext } from '@/lib/features/context';

export function useFeatureRing() {
  const { userRing, setUserRing, hasAccessToRing } = useFeatureRingContext();
  
  return {
    currentRing: userRing,
    setRing: setUserRing,
    hasAccessToRing,
  };
}