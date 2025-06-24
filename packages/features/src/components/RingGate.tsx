import React from 'react';
import { useFeatureRing } from '../hooks/useFeatureRing';
import { FeatureRing } from '../types';

/**
 * Props for RingGate component
 */
export interface RingGateProps {
  /**
   * Minimum ring level required
   */
  minRing: FeatureRing;
  /**
   * Content to render when ring level is sufficient
   */
  children: React.ReactNode;
  /**
   * Content to render when ring level is insufficient
   */
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders content based on feature ring level
 */
export function RingGate({ minRing, children, fallback = null }: RingGateProps) {
  const { currentRing } = useFeatureRing();
  const hasAccess = currentRing <= minRing;
  
  return <>{hasAccess ? children : fallback}</>;
}