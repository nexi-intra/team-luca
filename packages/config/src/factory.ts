import { IConfigFactory, IConfigProvider, ConfigSchema } from './types';

/**
 * Base configuration provider interface
 */
export interface ConfigProviderConstructor<TConfig = any> {
  new (schema: ConfigSchema, ...args: any[]): IConfigProvider<TConfig>;
}

/**
 * Configuration factory for creating configuration providers
 */
export class ConfigFactory<TConfig = any> implements IConfigFactory<TConfig> {
  private provider: IConfigProvider<TConfig> | null = null;
  
  constructor(
    private readonly schema: ConfigSchema,
    private readonly defaultProviderClass: ConfigProviderConstructor<TConfig>,
    private readonly defaultProviderArgs?: any[]
  ) {}

  /**
   * Create a configuration provider
   */
  create(): IConfigProvider<TConfig> {
    // Use cached provider if available
    if (this.provider) {
      return this.provider;
    }

    this.provider = new this.defaultProviderClass(
      this.schema,
      ...(this.defaultProviderArgs || [])
    );

    return this.provider;
  }

  /**
   * Clear the cached provider
   */
  clear(): void {
    this.provider = null;
  }
}

/**
 * Create a singleton configuration factory
 */
export function createConfigFactory<TConfig = any>(
  schema: ConfigSchema,
  providerClass: ConfigProviderConstructor<TConfig>,
  providerArgs?: any[]
): ConfigFactory<TConfig> {
  return new ConfigFactory(schema, providerClass, providerArgs);
}