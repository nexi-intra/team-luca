/**
 * Feature ring levels for gradual feature rollout
 */
export enum FeatureRing {
  /** Internal testing only */
  Internal = 'internal',
  /** Early adopters and beta testers */
  Beta = 'beta',
  /** General availability */
  GA = 'ga',
  /** Available to all users */
  Public = 'public'
}

/**
 * Base configuration value with metadata
 */
export interface ConfigValue<T> {
  /** The actual configuration value */
  value: T;
  /** User-friendly name for the configuration */
  name: string;
  /** Detailed description of what this configuration does */
  description: string;
  /** Feature ring - when this config becomes available */
  featureRing: FeatureRing;
  /** Whether this is a required configuration */
  required: boolean;
  /** Default value if not provided */
  defaultValue?: T;
  /** Example value for documentation */
  example?: string;
  /** Validation function */
  validate?: (value: T) => boolean | string;
}

/**
 * Configuration categories for organization
 */
export enum ConfigCategory {
  Authentication = 'authentication',
  API = 'api',
  Telemetry = 'telemetry',
  General = 'general',
  Features = 'features'
}

/**
 * Base configuration schema type
 * Apps should extend this with their specific configuration
 */
export type ConfigSchema = Record<string, Record<string, ConfigValue<any>>>;

/**
 * Configuration provider interface
 */
export interface IConfigProvider<TConfig = any> {
  /** Get a configuration value by path (e.g., 'auth.clientId') */
  get<T>(path: string): T | undefined;
  
  /** Get a configuration value with its metadata */
  getWithMetadata<T>(path: string): ConfigValue<T> | undefined;
  
  /** Get all configuration values */
  getAll(): TConfig;
  
  /** Check if a configuration exists */
  has(path: string): boolean;
  
  /** Validate all required configurations */
  validate(): { valid: boolean; errors: string[] };
  
  /** Get configurations by feature ring */
  getByFeatureRing(ring: FeatureRing): Partial<TConfig>;
  
  /** Get configurations by category */
  getByCategory(category: ConfigCategory): any;
}

/**
 * Configuration factory interface
 */
export interface IConfigFactory<TConfig = any> {
  /** Create a configuration provider */
  create(): IConfigProvider<TConfig>;
}

/**
 * Environment variable mapping interface
 */
export interface EnvMapping {
  [configPath: string]: {
    envVar: string;
    transform?: (value: string) => any;
  };
}