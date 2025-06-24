import { ConfigHelpers } from '@monorepo/config';
import { configFactory } from './factory';
import { AppConfig } from './types';

// Create the configuration provider
const provider = configFactory.create();

// Create helpers with our provider
const helpers = new ConfigHelpers<AppConfig>(provider);

// Export a unified config object with all methods
export const config = {
  // Direct provider methods
  get: provider.get.bind(provider),
  getWithMetadata: provider.getWithMetadata.bind(provider),
  getAll: provider.getAll.bind(provider),
  has: provider.has.bind(provider),
  validate: provider.validate.bind(provider),
  getByFeatureRing: provider.getByFeatureRing.bind(provider),
  getByCategory: provider.getByCategory.bind(provider),
  
  // Helper methods
  getRequired: helpers.getRequired.bind(helpers),
  getOrDefault: helpers.getOrDefault.bind(helpers),
  getMany: helpers.getMany.bind(helpers),
  hasAll: helpers.hasAll.bind(helpers),
  hasAny: helpers.hasAny.bind(helpers),
  getValidated: helpers.getValidated.bind(helpers),
  getAllPaths: helpers.getAllPaths.bind(helpers),
  getSummary: helpers.getSummary.bind(helpers),
};

// Export types for convenience
export type { AppConfig } from './types';
export { FeatureRing, ConfigCategory } from './types';