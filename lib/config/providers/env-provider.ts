import { IConfigProvider, AppConfig, ConfigValue, FeatureRing, ConfigCategory } from '../types';
import { CONFIG_SCHEMA } from '../schema';

/**
 * Environment variable mapping for configuration keys
 */
const ENV_MAPPING: Record<string, string> = {
  // Authentication
  'auth.provider': 'AUTH_PROVIDER',
  'auth.clientId': 'NEXT_PUBLIC_AUTH_CLIENT_ID',
  'auth.authority': 'NEXT_PUBLIC_AUTH_AUTHORITY',
  'auth.redirectUri': 'NEXT_PUBLIC_AUTH_REDIRECT_URI',
  'auth.postLogoutRedirectUri': 'NEXT_PUBLIC_AUTH_POST_LOGOUT_URI',
  'auth.sessionSecret': 'SESSION_SECRET',
  'auth.supabaseUrl': 'NEXT_PUBLIC_SUPABASE_URL',
  'auth.supabaseAnonKey': 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  
  // API
  'api.anthropicKey': 'ANTHROPIC_API_KEY',
  
  // General
  'general.appUrl': 'NEXT_PUBLIC_APP_URL',
  'general.environment': 'NODE_ENV',
  'general.port': 'PORT',
  
  // Telemetry
  'telemetry.serviceName': 'OTEL_SERVICE_NAME',
  'telemetry.serviceVersion': 'OTEL_SERVICE_VERSION',
  'telemetry.tracesEndpoint': 'OTEL_EXPORTER_OTLP_TRACES_ENDPOINT',
  'telemetry.metricsEndpoint': 'OTEL_EXPORTER_OTLP_METRICS_ENDPOINT',
  'telemetry.headers': 'OTEL_EXPORTER_OTLP_HEADERS',
  'telemetry.samplingRate': 'OTEL_SAMPLING_RATE',
  'telemetry.logLevel': 'LOG_LEVEL',
  'telemetry.clientLogLevel': 'NEXT_PUBLIC_LOG_LEVEL',
  
  // Features (these could be env vars or computed)
  'features.enableTelemetry': 'ENABLE_TELEMETRY',
  'features.enableAuth': 'ENABLE_AUTH',
  'features.enableAI': 'ENABLE_AI',
  'features.enableDevPanel': 'ENABLE_DEV_PANEL',
  
  // Runtime
  'runtime.nextRuntime': 'NEXT_RUNTIME',
  
  // Integrations
  'integrations.koksmatCompanionUrl': 'NEXT_PUBLIC_KOKSMAT_COMPANION_URL'
};

/**
 * Configuration provider that reads from environment variables
 */
export class EnvConfigProvider implements IConfigProvider {
  private config: AppConfig;
  private cache: Map<string, any> = new Map();

  constructor() {
    this.config = this.loadConfiguration();
  }

  private loadConfiguration(): AppConfig {
    const config = JSON.parse(JSON.stringify(CONFIG_SCHEMA)) as AppConfig;
    
    // Load values from environment
    this.loadConfigSection(config.auth, 'auth');
    this.loadConfigSection(config.api, 'api');
    this.loadConfigSection(config.general, 'general');
    this.loadConfigSection(config.telemetry, 'telemetry');
    this.loadConfigSection(config.features, 'features');
    this.loadConfigSection(config.runtime, 'runtime');
    this.loadConfigSection(config.integrations, 'integrations');
    
    return config;
  }

  private loadConfigSection(section: any, prefix: string) {
    for (const key in section) {
      const path = `${prefix}.${key}`;
      const envVar = ENV_MAPPING[path];
      
      if (envVar && process.env[envVar] !== undefined) {
        const value = this.parseEnvValue(process.env[envVar]!, section[key]);
        if (value !== undefined) {
          section[key].value = value;
        }
      } else if (section[key].defaultValue !== undefined) {
        section[key].value = section[key].defaultValue;
      }
    }
  }

  private parseEnvValue(envValue: string, configValue: ConfigValue<any>): any {
    // Handle special cases based on the expected type
    if (configValue.defaultValue !== undefined) {
      const defaultType = typeof configValue.defaultValue;
      
      switch (defaultType) {
        case 'boolean':
          return envValue.toLowerCase() === 'true' || envValue === '1';
        
        case 'number':
          const num = parseFloat(envValue);
          return isNaN(num) ? undefined : num;
        
        case 'object':
          if (Array.isArray(configValue.defaultValue)) {
            // Handle array values (e.g., scopes)
            return envValue.split(',').map(s => s.trim()).filter(Boolean);
          } else {
            // Handle JSON objects
            try {
              return JSON.parse(envValue);
            } catch {
              return undefined;
            }
          }
        
        default:
          return envValue;
      }
    }
    
    // Default to string
    return envValue;
  }

  get<T>(path: string): T | undefined {
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }

    const parts = path.split('.');
    let current: any = this.config;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    const value = current?.value;
    this.cache.set(path, value);
    return value;
  }

  getWithMetadata<T>(path: string): ConfigValue<T> | undefined {
    const parts = path.split('.');
    let current: any = this.config;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current as ConfigValue<T>;
  }

  getAll(): AppConfig {
    return this.config;
  }

  has(path: string): boolean {
    return this.get(path) !== undefined;
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    this.validateSection(this.config.auth, 'auth', errors);
    this.validateSection(this.config.api, 'api', errors);
    this.validateSection(this.config.general, 'general', errors);
    this.validateSection(this.config.telemetry, 'telemetry', errors);
    this.validateSection(this.config.features, 'features', errors);
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  private validateSection(section: any, prefix: string, errors: string[]) {
    for (const key in section) {
      const configValue = section[key] as ConfigValue<any>;
      const path = `${prefix}.${key}`;
      
      // Special handling for auth section - fields are conditionally required
      if (prefix === 'auth') {
        const provider = this.get<string>('auth.provider');
        
        // Skip validation for provider-specific fields if not using that provider
        if (provider !== 'entraid' && ['clientId', 'authority', 'scopes'].includes(key)) {
          continue;
        }
        if (provider !== 'supabase' && ['supabaseUrl', 'supabaseAnonKey'].includes(key)) {
          continue;
        }
        
        // Make fields required based on provider
        if (provider === 'entraid' && ['clientId', 'authority'].includes(key) && !configValue.value) {
          errors.push(`${configValue.name} (${path}) is required when using Entra ID authentication`);
          continue;
        }
        if (provider === 'supabase' && ['supabaseUrl', 'supabaseAnonKey'].includes(key) && !configValue.value) {
          errors.push(`${configValue.name} (${path}) is required when using Supabase authentication`);
          continue;
        }
      }
      
      // Check required values
      if (configValue.required && !configValue.value) {
        errors.push(`${configValue.name} (${path}) is required but not set`);
      }
      
      // Run validation if value exists
      if (configValue.value && configValue.validate) {
        const result = configValue.validate(configValue.value);
        if (result !== true) {
          errors.push(`${configValue.name} (${path}): ${result}`);
        }
      }
    }
  }

  getByFeatureRing(ring: FeatureRing): Partial<AppConfig> {
    const result: any = {};
    
    const filterByRing = (section: any, targetSection: any) => {
      for (const key in section) {
        if (section[key].featureRing === ring) {
          targetSection[key] = section[key];
        }
      }
    };
    
    if (this.config.auth) {
      result.auth = {};
      filterByRing(this.config.auth, result.auth);
    }
    
    if (this.config.api) {
      result.api = {};
      filterByRing(this.config.api, result.api);
    }
    
    if (this.config.general) {
      result.general = {};
      filterByRing(this.config.general, result.general);
    }
    
    if (this.config.telemetry) {
      result.telemetry = {};
      filterByRing(this.config.telemetry, result.telemetry);
    }
    
    if (this.config.features) {
      result.features = {};
      filterByRing(this.config.features, result.features);
    }
    
    return result;
  }

  getByCategory(category: ConfigCategory): any {
    switch (category) {
      case ConfigCategory.Authentication:
        return this.config.auth;
      case ConfigCategory.API:
        return this.config.api;
      case ConfigCategory.General:
        return this.config.general;
      case ConfigCategory.Telemetry:
        return this.config.telemetry;
      case ConfigCategory.Features:
        return this.config.features;
      default:
        return {};
    }
  }
}