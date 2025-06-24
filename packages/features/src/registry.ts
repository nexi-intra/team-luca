import type { Feature, FeatureCategory, IFeatureRegistry } from './types';
import { FeatureRing } from './types';

/**
 * Default feature registry implementation
 */
export class FeatureRegistry implements IFeatureRegistry {
  private features: Map<string, Feature> = new Map();

  register(feature: Feature): void {
    if (this.features.has(feature.id)) {
      console.warn(`Feature with ID "${feature.id}" is already registered`);
    }
    this.features.set(feature.id, feature);
  }

  unregister(featureId: string): void {
    this.features.delete(featureId);
  }

  getAll(): Feature[] {
    return Array.from(this.features.values());
  }

  getById(featureId: string): Feature | undefined {
    return this.features.get(featureId);
  }

  getByCategory(category: FeatureCategory): Feature[] {
    return Array.from(this.features.values()).filter(
      feature => feature.category === category
    );
  }

  getByRing(ring: FeatureRing): Feature[] {
    return Array.from(this.features.values()).filter(
      feature => feature.minRing >= ring
    );
  }
}

/**
 * Global feature registry instance
 */
let globalRegistry: IFeatureRegistry | null = null;

/**
 * Get the global feature registry
 */
export function getGlobalRegistry(): IFeatureRegistry {
  if (!globalRegistry) {
    globalRegistry = new FeatureRegistry();
  }
  return globalRegistry;
}

/**
 * Set a custom feature registry
 */
export function setGlobalRegistry(registry: IFeatureRegistry): void {
  globalRegistry = registry;
}

/**
 * Register a feature in the global registry
 */
export function registerFeature(feature: Feature): void {
  getGlobalRegistry().register(feature);
}

/**
 * Register multiple features
 */
export function registerFeatures(features: Feature[]): void {
  const registry = getGlobalRegistry();
  features.forEach(feature => registry.register(feature));
}

/**
 * Get all registered features
 */
export function getAllFeatures(): Feature[] {
  return getGlobalRegistry().getAll();
}

/**
 * Get a feature by ID
 */
export function getFeatureById(featureId: string): Feature | undefined {
  return getGlobalRegistry().getById(featureId);
}

/**
 * Get features by category
 */
export function getFeaturesByCategory(category: FeatureCategory): Feature[] {
  return getGlobalRegistry().getByCategory(category);
}

/**
 * Get features by ring
 */
export function getFeaturesByRing(ring: FeatureRing): Feature[] {
  return getGlobalRegistry().getByRing(ring);
}