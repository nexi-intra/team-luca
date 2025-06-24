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
 * Complete application configuration schema
 */
export interface AppConfig {
  // Authentication
  auth: {
    provider: ConfigValue<string>;
    clientId: ConfigValue<string>;
    authority: ConfigValue<string>;
    redirectUri: ConfigValue<string>;
    postLogoutRedirectUri: ConfigValue<string>;
    sessionSecret: ConfigValue<string>;
    scopes: ConfigValue<string[]>;
    supabaseUrl: ConfigValue<string>;
    supabaseAnonKey: ConfigValue<string>;
  };
  
  // API Keys and External Services
  api: {
    anthropicKey: ConfigValue<string>;
  };
  
  // General Application Settings
  general: {
    appUrl: ConfigValue<string>;
    environment: ConfigValue<'development' | 'production' | 'test'>;
    port: ConfigValue<number>;
  };
  
  // Telemetry and Monitoring
  telemetry: {
    serviceName: ConfigValue<string>;
    serviceVersion: ConfigValue<string>;
    tracesEndpoint: ConfigValue<string>;
    metricsEndpoint: ConfigValue<string>;
    headers: ConfigValue<Record<string, string>>;
    samplingRate: ConfigValue<number>;
    logLevel: ConfigValue<'VERBOSE' | 'INFO' | 'WARN' | 'ERROR' | 'NONE'>;
    clientLogLevel: ConfigValue<'VERBOSE' | 'INFO' | 'WARN' | 'ERROR' | 'NONE'>;
  };
  
  // Feature Flags
  features: {
    enableTelemetry: ConfigValue<boolean>;
    enableAuth: ConfigValue<boolean>;
    enableAI: ConfigValue<boolean>;
    enableDevPanel: ConfigValue<boolean>;
  };
  
  // Runtime Configuration
  runtime: {
    nextRuntime: ConfigValue<string>;
  };
  
  // External Integrations
  integrations: {
    koksmatCompanionUrl: ConfigValue<string>;
  };
}

/**
 * Configuration provider interface
 */
export interface IConfigProvider {
  /** Get a configuration value by path (e.g., 'auth.clientId') */
  get<T>(path: string): T | undefined;
  
  /** Get a configuration value with its metadata */
  getWithMetadata<T>(path: string): ConfigValue<T> | undefined;
  
  /** Get all configuration values */
  getAll(): AppConfig;
  
  /** Check if a configuration exists */
  has(path: string): boolean;
  
  /** Validate all required configurations */
  validate(): { valid: boolean; errors: string[] };
  
  /** Get configurations by feature ring */
  getByFeatureRing(ring: FeatureRing): Partial<AppConfig>;
  
  /** Get configurations by category */
  getByCategory(category: ConfigCategory): any;
}

/**
 * Configuration factory interface
 */
export interface IConfigFactory {
  /** Create a configuration provider */
  create(): IConfigProvider;
}