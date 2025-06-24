'use client';

import { ReactNode } from 'react';
import { useFeatureAccess, useFeatures } from '@/hooks/useFeatureAccess';

interface FeatureGateProps {
  featureId: string;
  children: ReactNode;
  fallback?: ReactNode;
  showWhenDisabled?: boolean;
  renderDisabled?: (feature?: any) => ReactNode;
}

export function FeatureGate({ 
  featureId, 
  children, 
  fallback = null,
  showWhenDisabled = false,
  renderDisabled
}: FeatureGateProps) {
  const { hasAccess, feature } = useFeatureAccess(featureId);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (renderDisabled) {
    return <>{renderDisabled(feature)}</>;
  }

  if (showWhenDisabled && children) {
    return (
      <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
        {children}
      </div>
    );
  }

  return <>{fallback}</>;
}

interface MultiFeatureGateProps {
  featureIds: string[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function MultiFeatureGate({ 
  featureIds, 
  requireAll = true,
  children, 
  fallback = null 
}: MultiFeatureGateProps) {
  const { hasAccess } = useFeatures();
  
  const accessResults = featureIds.map(id => hasAccess(id));
  const hasRequiredAccess = requireAll 
    ? accessResults.every(Boolean)
    : accessResults.some(Boolean);

  return hasRequiredAccess ? <>{children}</> : <>{fallback}</>;
}