"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  FeatureRing,
  Feature,
  getFeatureById,
  FEATURE_RINGS,
} from "./constants";

interface FeatureRingContextValue {
  userRing: FeatureRing;
  setUserRing: (ring: FeatureRing) => void;
  hasAccessToFeature: (featureId: string) => boolean;
  hasAccessToRing: (ring: FeatureRing) => boolean;
  getAccessibleFeatures: () => Feature[];
}

const FeatureRingContext = createContext<FeatureRingContextValue | undefined>(
  undefined,
);

interface FeatureRingProviderProps {
  children: ReactNode;
  defaultRing?: FeatureRing;
  persistKey?: string;
}

export function FeatureRingProvider({
  children,
  defaultRing = FEATURE_RINGS.STABLE,
  persistKey = "feature-ring",
}: FeatureRingProviderProps) {
  const [userRing, setUserRingState] = useState<FeatureRing>(() => {
    if (typeof window !== "undefined" && persistKey) {
      const stored = localStorage.getItem(persistKey);
      if (stored) {
        const ring = parseInt(stored, 10) as FeatureRing;
        if ([1, 2, 3, 4].includes(ring)) {
          return ring;
        }
      }
    }
    return defaultRing;
  });

  const setUserRing = useCallback(
    (ring: FeatureRing) => {
      setUserRingState(ring);
      if (typeof window !== "undefined" && persistKey) {
        localStorage.setItem(persistKey, ring.toString());
      }
    },
    [persistKey],
  );

  const hasAccessToRing = useCallback(
    (ring: FeatureRing): boolean => {
      return userRing <= ring;
    },
    [userRing],
  );

  const hasAccessToFeature = useCallback(
    (featureId: string): boolean => {
      const feature = getFeatureById(featureId);
      if (!feature) return false;
      return hasAccessToRing(feature.ring);
    },
    [hasAccessToRing],
  );

  const getAccessibleFeatures = useCallback((): Feature[] => {
    const { getAllFeatures } = require("./constants");
    return getAllFeatures().filter((feature: Feature) =>
      hasAccessToRing(feature.ring),
    );
  }, [hasAccessToRing]);

  const value: FeatureRingContextValue = {
    userRing,
    setUserRing,
    hasAccessToFeature,
    hasAccessToRing,
    getAccessibleFeatures,
  };

  return (
    <FeatureRingContext.Provider value={value}>
      {children}
    </FeatureRingContext.Provider>
  );
}

export function useFeatureRingContext() {
  const context = useContext(FeatureRingContext);
  if (!context) {
    throw new Error(
      "useFeatureRingContext must be used within a FeatureRingProvider",
    );
  }
  return context;
}
