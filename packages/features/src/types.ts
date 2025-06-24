/**
 * Feature ring levels for gradual rollout
 */
export enum FeatureRing {
  /**
   * Experimental features - Development and testing only
   */
  Experimental = 1,
  
  /**
   * Preview features - Internal users and early adopters
   */
  Preview = 2,
  
  /**
   * Beta features - Limited external users
   */
  Beta = 3,
  
  /**
   * Stable features - All users
   */
  Stable = 4,
}

/**
 * Feature category for organization
 */
export type FeatureCategory = 
  | 'core'
  | 'experimental'
  | 'ui'
  | 'api'
  | 'security'
  | 'analytics'
  | 'integration'
  | 'performance';

/**
 * Feature definition
 */
export interface Feature {
  /**
   * Unique identifier for the feature
   */
  id: string;
  
  /**
   * Display name
   */
  name: string;
  
  /**
   * Description of what the feature does
   */
  description: string;
  
  /**
   * Category for grouping
   */
  category: FeatureCategory;
  
  /**
   * Minimum ring level required to access this feature
   */
  minRing: FeatureRing;
  
  /**
   * Whether the feature is enabled
   */
  enabled: boolean;
  
  /**
   * Optional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Feature access result
 */
export interface FeatureAccess {
  /**
   * Feature ID
   */
  featureId: string;
  
  /**
   * Whether access is granted
   */
  hasAccess: boolean;
  
  /**
   * Current user's ring level
   */
  currentRing: FeatureRing;
  
  /**
   * Required ring level
   */
  requiredRing: FeatureRing;
}

/**
 * Feature storage interface
 */
export interface IFeatureStorage {
  /**
   * Get the stored feature ring
   */
  getRing(): FeatureRing | null;
  
  /**
   * Set the feature ring
   */
  setRing(ring: FeatureRing): void;
  
  /**
   * Clear the stored ring
   */
  clearRing(): void;
}

/**
 * Feature registry interface
 */
export interface IFeatureRegistry {
  /**
   * Register a new feature
   */
  register(feature: Feature): void;
  
  /**
   * Unregister a feature
   */
  unregister(featureId: string): void;
  
  /**
   * Get all features
   */
  getAll(): Feature[];
  
  /**
   * Get a feature by ID
   */
  getById(featureId: string): Feature | undefined;
  
  /**
   * Get features by category
   */
  getByCategory(category: FeatureCategory): Feature[];
  
  /**
   * Get features by ring
   */
  getByRing(ring: FeatureRing): Feature[];
}