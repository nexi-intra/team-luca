"use client";

import React from "react";
import { useFeatureRingContext } from "@monorepo/features";
import type { FeatureRing } from "@monorepo/features";

interface RingGateProps {
  requiredRing: FeatureRing;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RingGate({
  requiredRing,
  children,
  fallback = null,
}: RingGateProps) {
  const { currentRing } = useFeatureRingContext();

  // User has access if their ring is less than or equal to required ring
  const hasAccess = currentRing <= requiredRing;

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
