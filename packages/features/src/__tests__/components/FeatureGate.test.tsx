import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeatureGate, MultiFeatureGate } from '../../components/FeatureGate';
import { FeatureRingProvider } from '../../context';
import { registerFeature } from '../../registry';
import { FeatureRing } from '../../types';
import type { Feature } from '../../types';

// Mock features
const betaFeature: Feature = {
  id: 'beta-feature',
  name: 'Beta Feature',
  description: 'A beta feature',
  category: 'experimental',
  minRing: FeatureRing.Beta,
  enabled: true,
};

const stableFeature: Feature = {
  id: 'stable-feature',
  name: 'Stable Feature',
  description: 'A stable feature',
  category: 'core',
  minRing: FeatureRing.Stable,
  enabled: true,
};

const disabledFeature: Feature = {
  id: 'disabled-feature',
  name: 'Disabled Feature',
  description: 'A disabled feature',
  category: 'experimental',
  minRing: FeatureRing.Experimental,
  enabled: false,
};

describe('FeatureGate', () => {
  beforeEach(() => {
    // Register test features
    registerFeature(betaFeature);
    registerFeature(stableFeature);
    registerFeature(disabledFeature);
  });

  it('should render children when feature is accessible', () => {
    render(
      <FeatureRingProvider initialRing={FeatureRing.Beta}>
        <FeatureGate feature="stable-feature">
          <div>Feature Content</div>
        </FeatureGate>
      </FeatureRingProvider>
    );

    expect(screen.getByText('Feature Content')).toBeInTheDocument();
  });

  it('should render fallback when feature is not accessible', () => {
    render(
      <FeatureRingProvider initialRing={FeatureRing.Stable}>
        <FeatureGate feature="beta-feature" fallback={<div>Fallback Content</div>}>
          <div>Feature Content</div>
        </FeatureGate>
      </FeatureRingProvider>
    );

    expect(screen.queryByText('Feature Content')).not.toBeInTheDocument();
    expect(screen.getByText('Fallback Content')).toBeInTheDocument();
  });

  it('should not render disabled features regardless of ring', () => {
    render(
      <FeatureRingProvider initialRing={FeatureRing.Experimental}>
        <FeatureGate feature="disabled-feature">
          <div>Feature Content</div>
        </FeatureGate>
      </FeatureRingProvider>
    );

    expect(screen.queryByText('Feature Content')).not.toBeInTheDocument();
  });
});

describe('MultiFeatureGate', () => {
  beforeEach(() => {
    registerFeature(betaFeature);
    registerFeature(stableFeature);
  });

  it('should render when all features are accessible (mode="all")', () => {
    render(
      <FeatureRingProvider initialRing={FeatureRing.Beta}>
        <MultiFeatureGate features={['beta-feature', 'stable-feature']} mode="all">
          <div>All Features Content</div>
        </MultiFeatureGate>
      </FeatureRingProvider>
    );

    expect(screen.getByText('All Features Content')).toBeInTheDocument();
  });

  it('should not render when not all features are accessible (mode="all")', () => {
    render(
      <FeatureRingProvider initialRing={FeatureRing.Stable}>
        <MultiFeatureGate features={['beta-feature', 'stable-feature']} mode="all">
          <div>All Features Content</div>
        </MultiFeatureGate>
      </FeatureRingProvider>
    );

    expect(screen.queryByText('All Features Content')).not.toBeInTheDocument();
  });

  it('should render when any feature is accessible (mode="any")', () => {
    render(
      <FeatureRingProvider initialRing={FeatureRing.Stable}>
        <MultiFeatureGate features={['beta-feature', 'stable-feature']} mode="any">
          <div>Any Feature Content</div>
        </MultiFeatureGate>
      </FeatureRingProvider>
    );

    expect(screen.getByText('Any Feature Content')).toBeInTheDocument();
  });

  it('should use "all" mode by default', () => {
    render(
      <FeatureRingProvider initialRing={FeatureRing.Stable}>
        <MultiFeatureGate features={['beta-feature', 'stable-feature']}>
          <div>Default Mode Content</div>
        </MultiFeatureGate>
      </FeatureRingProvider>
    );

    expect(screen.queryByText('Default Mode Content')).not.toBeInTheDocument();
  });
});