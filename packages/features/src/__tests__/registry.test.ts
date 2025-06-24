import { FeatureRegistry, registerFeature, getAllFeatures, getFeatureById } from '../registry';
import { FeatureRing } from '../types';
import type { Feature } from '../types';

describe('FeatureRegistry', () => {
  let registry: FeatureRegistry;

  beforeEach(() => {
    registry = new FeatureRegistry();
  });

  const mockFeature: Feature = {
    id: 'test-feature',
    name: 'Test Feature',
    description: 'A test feature',
    category: 'experimental',
    minRing: FeatureRing.Beta,
    enabled: true,
  };

  describe('register', () => {
    it('should register a feature', () => {
      registry.register(mockFeature);
      expect(registry.getById('test-feature')).toEqual(mockFeature);
    });

    it('should warn when registering duplicate feature', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      registry.register(mockFeature);
      registry.register(mockFeature);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Feature with ID "test-feature" is already registered'
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('unregister', () => {
    it('should unregister a feature', () => {
      registry.register(mockFeature);
      registry.unregister('test-feature');
      
      expect(registry.getById('test-feature')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all registered features', () => {
      const feature1 = { ...mockFeature, id: 'feature-1' };
      const feature2 = { ...mockFeature, id: 'feature-2' };
      
      registry.register(feature1);
      registry.register(feature2);
      
      const all = registry.getAll();
      expect(all).toHaveLength(2);
      expect(all).toContainEqual(feature1);
      expect(all).toContainEqual(feature2);
    });
  });

  describe('getByCategory', () => {
    it('should return features by category', () => {
      const experimentalFeature = { ...mockFeature, id: 'exp-1', category: 'experimental' as const };
      const coreFeature = { ...mockFeature, id: 'core-1', category: 'core' as const };
      
      registry.register(experimentalFeature);
      registry.register(coreFeature);
      
      const experimental = registry.getByCategory('experimental');
      expect(experimental).toHaveLength(1);
      expect(experimental[0].id).toBe('exp-1');
    });
  });

  describe('getByRing', () => {
    it('should return features accessible at or above ring level', () => {
      const betaFeature = { ...mockFeature, id: 'beta-1', minRing: FeatureRing.Beta };
      const stableFeature = { ...mockFeature, id: 'stable-1', minRing: FeatureRing.Stable };
      
      registry.register(betaFeature);
      registry.register(stableFeature);
      
      // Preview ring should see Beta and Stable features
      const previewFeatures = registry.getByRing(FeatureRing.Preview);
      expect(previewFeatures).toHaveLength(2);
      
      // Stable ring should only see Stable features
      const stableFeatures = registry.getByRing(FeatureRing.Stable);
      expect(stableFeatures).toHaveLength(1);
      expect(stableFeatures[0].id).toBe('stable-1');
    });
  });
});

describe('Global registry functions', () => {
  beforeEach(() => {
    // Clear the global registry
    getAllFeatures().forEach(feature => {
      // We don't have unregister in global functions, so we'll just test registration
    });
  });

  it('should register features globally', () => {
    const feature: Feature = {
      id: 'global-test',
      name: 'Global Test',
      description: 'A globally registered feature',
      category: 'core',
      minRing: FeatureRing.Stable,
      enabled: true,
    };

    registerFeature(feature);
    
    expect(getFeatureById('global-test')).toEqual(feature);
  });
});