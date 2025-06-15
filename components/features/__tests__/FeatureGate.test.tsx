import React from 'react';
import { render, screen } from '@/tests/utils/test-utils';
import { FeatureGate, MultiFeatureGate } from '@/components/features/FeatureGate';
import { useFeatureAccess, useFeatures } from '@/hooks/useFeatureAccess';

jest.mock('@/hooks/useFeatureAccess');

describe('FeatureGate', () => {
  const mockUseFeatureAccess = useFeatureAccess as jest.MockedFunction<typeof useFeatureAccess>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when user has access to feature', () => {
    mockUseFeatureAccess.mockReturnValue({
      hasAccess: true,
      feature: { id: 'test-feature', name: 'Test Feature', description: 'Test', ring: 4 },
      accessibleFeatures: [],
    });

    render(
      <FeatureGate featureId="test-feature">
        <div>Protected Content</div>
      </FeatureGate>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders fallback when user lacks access', () => {
    mockUseFeatureAccess.mockReturnValue({
      hasAccess: false,
      feature: { id: 'test-feature', name: 'Test Feature', description: 'Test', ring: 1 },
      accessibleFeatures: [],
    });

    render(
      <FeatureGate featureId="test-feature" fallback={<div>Upgrade Required</div>}>
        <div>Protected Content</div>
      </FeatureGate>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Upgrade Required')).toBeInTheDocument();
  });

  it('renders disabled content when showWhenDisabled is true', () => {
    mockUseFeatureAccess.mockReturnValue({
      hasAccess: false,
      feature: { id: 'test-feature', name: 'Test Feature', description: 'Test', ring: 1 },
      accessibleFeatures: [],
    });

    render(
      <FeatureGate featureId="test-feature" showWhenDisabled>
        <button>Protected Button</button>
      </FeatureGate>
    );

    const button = screen.getByText('Protected Button');
    expect(button).toBeInTheDocument();
    expect(button.parentElement).toHaveStyle({
      opacity: '0.5',
      pointerEvents: 'none',
    });
  });

  it('renders custom disabled content with renderDisabled', () => {
    mockUseFeatureAccess.mockReturnValue({
      hasAccess: false,
      feature: { id: 'test-feature', name: 'Test Feature', description: 'Test', ring: 2 },
      accessibleFeatures: [],
    });

    render(
      <FeatureGate 
        featureId="test-feature" 
        renderDisabled={(feature) => <div>Feature &quot;{feature?.name}&quot; requires ring {feature?.ring}</div>}
      >
        <div>Protected Content</div>
      </FeatureGate>
    );

    expect(screen.getByText('Feature "Test Feature" requires ring 2')).toBeInTheDocument();
  });
});

describe('MultiFeatureGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when all features are accessible (requireAll=true)', () => {
    const mockHasAccess = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);

    (useFeatures as jest.Mock).mockReturnValue({
      hasAccess: mockHasAccess,
      features: [],
    });

    render(
      <MultiFeatureGate featureIds={['feature1', 'feature2']} requireAll={true}>
        <div>Protected Content</div>
      </MultiFeatureGate>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('does not render children when any feature is inaccessible (requireAll=true)', () => {
    const mockHasAccess = jest.fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    (useFeatures as jest.Mock).mockReturnValue({
      hasAccess: mockHasAccess,
      features: [],
    });

    render(
      <MultiFeatureGate featureIds={['feature1', 'feature2']} requireAll={true}>
        <div>Protected Content</div>
      </MultiFeatureGate>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when any feature is accessible (requireAll=false)', () => {
    const mockHasAccess = jest.fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    (useFeatures as jest.Mock).mockReturnValue({
      hasAccess: mockHasAccess,
      features: [],
    });

    render(
      <MultiFeatureGate featureIds={['feature1', 'feature2']} requireAll={false}>
        <div>Protected Content</div>
      </MultiFeatureGate>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});