import { IConfigProvider, ConfigValue, FeatureRing, ConfigCategory, ConfigSchema } from '../types';

/**
 * Base configuration provider with common functionality
 */
export abstract class BaseConfigProvider<TConfig = any> implements IConfigProvider<TConfig> {
  protected config: TConfig;
  protected cache: Map<string, any> = new Map();
  protected schema: ConfigSchema;

  constructor(schema: ConfigSchema) {
    this.schema = schema;
    // Config will be loaded by subclass after initialization
  }

  /**
   * Initialize the configuration (should be called after constructor)
   */
  protected initialize(): void {
    this.config = this.loadConfiguration();
  }

  /**
   * Load configuration from the source
   */
  protected abstract loadConfiguration(): TConfig;

  get<T>(path: string): T | undefined {
    if (!this.config) {
      return undefined;
    }
    
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
    if (!this.config) {
      return undefined;
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
    
    return current as ConfigValue<T>;
  }

  getAll(): TConfig {
    return this.config || ({} as TConfig);
  }

  has(path: string): boolean {
    const value = this.get(path);
    return value !== undefined && value !== null;
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate all sections in the schema
    for (const sectionKey in this.schema) {
      if (this.config && typeof this.config === 'object' && sectionKey in this.config) {
        this.validateSection((this.config as any)[sectionKey], sectionKey, errors);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  protected validateSection(section: any, prefix: string, errors: string[]) {
    for (const key in section) {
      const configValue = section[key] as ConfigValue<any>;
      const path = `${prefix}.${key}`;
      
      // Check required values
      if (configValue.required && !configValue.value) {
        errors.push(`${configValue.name} (${path}) is required but not set`);
      }
      
      // Run validation if value exists
      if (configValue.value !== undefined && configValue.value !== null && configValue.validate) {
        const result = configValue.validate(configValue.value);
        if (result !== true) {
          errors.push(`${configValue.name} (${path}): ${result}`);
        }
      }
    }
  }

  getByFeatureRing(ring: FeatureRing): Partial<TConfig> {
    const result: any = {};
    
    const filterByRing = (section: any, targetSection: any) => {
      for (const key in section) {
        if (section[key].featureRing === ring) {
          targetSection[key] = section[key];
        }
      }
    };
    
    for (const sectionKey in this.config) {
      if (this.config && typeof this.config === 'object') {
        const section = (this.config as any)[sectionKey];
        if (section && typeof section === 'object') {
          result[sectionKey] = {};
          filterByRing(section, result[sectionKey]);
        }
      }
    }
    
    return result;
  }

  getByCategory(category: ConfigCategory): any {
    // This is a simple implementation that maps category enum values to config keys
    // Apps can override this for custom behavior
    const categoryKey = category.toLowerCase();
    
    if (this.config && typeof this.config === 'object' && categoryKey in this.config) {
      return (this.config as any)[categoryKey];
    }
    
    return {};
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}