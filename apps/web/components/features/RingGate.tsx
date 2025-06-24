'use client';

import React from 'react';
import { useFeatureRingContext } from '@/lib/features/context';
import type { FeatureRing } from '@/lib/features/constants';

interface RingGateProps {
  requiredRing: FeatureRing;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RingGate({ requiredRing, children, fallback = null }: RingGateProps) {
  const { hasAccessToRing } = useFeatureRingContext();
  
  if (!hasAccessToRing(requiredRing)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}