"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { Feature, FeatureAccess, IFeatureStorage } from "./types";
import { FeatureRing } from "./types";
import { DEFAULT_FEATURE_RING, hasFeatureAccess } from "./constants";
import { getAllFeatures, getFeatureById } from "./registry";
import { createFeatureStorage } from "./storage";

/**
 * Feature ring context value
 */
export interface FeatureRingContextValue {
  /**
   * Current feature ring level
   */
  currentRing: FeatureRing;

  /**
   * Set the feature ring level
   */
  setRing: (ring: FeatureRing) => void;

  /**
   * Check if a feature is accessible
   */
  hasFeatureAccess: (featureId: string) => boolean;

  /**
   * Get detailed access info for a feature
   */
  getFeatureAccess: (featureId: string) => FeatureAccess | null;

  /**
   * Get all accessible features
   */
  getAccessibleFeatures: () => Feature[];
}

const FeatureRingContext = createContext<FeatureRingContextValue | undefined>(
  undefined,
);

/**
 * Feature ring provider props
 */
export interface FeatureRingProviderProps {
  children: React.ReactNode;
  /**
   * Initial ring level
   */
  initialRing?: FeatureRing;
  /**
   * Storage implementation
   */
  storage?: IFeatureStorage;
  /**
   * Whether to persist ring selection
   */
  persist?: boolean;
}

/**
 * Feature ring provider component
 */
export function FeatureRingProvider({
  children,
  initialRing,
  storage: customStorage,
  persist = true,
}: FeatureRingProviderProps) {
  const storage = useMemo(
    () => customStorage || createFeatureStorage(),
    [customStorage],
  );

  const [currentRing, setCurrentRing] = useState<FeatureRing>(() => {
    if (persist) {
      const stored = storage.getRing();
      if (stored !== null) {
        return stored;
      }
    }
    return initialRing || DEFAULT_FEATURE_RING;
  });

  // Persist ring changes
  useEffect(() => {
    if (persist) {
      storage.setRing(currentRing);
    }
  }, [currentRing, persist, storage]);

  const setRing = useCallback((ring: FeatureRing) => {
    setCurrentRing(ring);
  }, []);

  const hasFeature = useCallback(
    (featureId: string): boolean => {
      const feature = getFeatureById(featureId);
      if (!feature || !feature.enabled) {
        return false;
      }
      return hasFeatureAccess(currentRing, feature.minRing);
    },
    [currentRing],
  );

  const getFeatureAccess = useCallback(
    (featureId: string): FeatureAccess | null => {
      const feature = getFeatureById(featureId);
      if (!feature) {
        return null;
      }

      return {
        featureId,
        hasAccess:
          feature.enabled && hasFeatureAccess(currentRing, feature.minRing),
        currentRing,
        requiredRing: feature.minRing,
      };
    },
    [currentRing],
  );

  const getAccessibleFeatures = useCallback((): Feature[] => {
    return getAllFeatures().filter(
      (feature) =>
        feature.enabled && hasFeatureAccess(currentRing, feature.minRing),
    );
  }, [currentRing]);

  const value: FeatureRingContextValue = {
    currentRing,
    setRing,
    hasFeatureAccess: hasFeature,
    getFeatureAccess,
    getAccessibleFeatures,
  };

  return (
    <FeatureRingContext.Provider value={value}>
      {children}
    </FeatureRingContext.Provider>
  );
}

/**
 * Hook to use feature ring context
 */
export function useFeatureRingContext(): FeatureRingContextValue {
  const context = useContext(FeatureRingContext);
  if (!context) {
    throw new Error(
      "useFeatureRingContext must be used within a FeatureRingProvider",
    );
  }
  return context;
}
