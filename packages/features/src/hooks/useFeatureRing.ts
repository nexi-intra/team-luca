import { useFeatureRingContext } from '../context';

/**
 * Hook to get the current feature ring
 */
export function useFeatureRing() {
  const { currentRing, setRing } = useFeatureRingContext();
  return { currentRing, setRing };
}