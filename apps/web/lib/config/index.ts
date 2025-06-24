import { ConfigFactory } from './factory';
import { IConfigProvider } from './types';

// Create and export a singleton configuration instance
const factory = ConfigFactory.getInstance();
const configProvider = factory.create('env');

/**
 * Main configuration object for the application
 */
export const config = {
  /**
   * Get a configuration value by path
   * @example config.get('auth.clientId')
   */
  get<T = any>(path: string): T | undefined {
    return configProvider.get<T>(path);
  },

  /**
   * Get a configuration value with a default fallback
   * @example config.getOrDefault('auth.scopes', ['openid'])
   */
  getOrDefault<T = any>(path: string, defaultValue: T): T {
    const value = configProvider.get<T>(path);
    return value !== undefined ? value : defaultValue;
  },

  /**
   * Get a required configuration value (throws if not found)
   * @example config.getRequired('auth.clientId')
   */
  getRequired<T = any>(path: string): T {
    const value = configProvider.get<T>(path);
    if (value === undefined) {
      throw new Error(`Required configuration not found: ${path}`);
    }
    return value;
  },

  /**
   * Get a configuration value with its metadata
   * @example config.getWithMetadata('auth.clientId')
   */
  getWithMetadata: configProvider.getWithMetadata.bind(configProvider),

  /**
   * Get all configuration values
   */
  getAll: configProvider.getAll.bind(configProvider),

  /**
   * Check if a configuration exists
   * @example config.has('auth.clientId')
   */
  has: configProvider.has.bind(configProvider),

  /**
   * Validate all required configurations
   */
  validate: configProvider.validate.bind(configProvider),

  /**
   * Get configurations by feature ring
   */
  getByFeatureRing: configProvider.getByFeatureRing.bind(configProvider),

  /**
   * Get configurations by category
   */
  getByCategory: configProvider.getByCategory.bind(configProvider),

  /**
   * Get the raw configuration provider
   */
  getProvider(): IConfigProvider {
    return configProvider;
  }
};

// Export types and enums for external use
export { FeatureRing, ConfigCategory } from './types';
export type { ConfigValue, AppConfig, IConfigProvider } from './types';