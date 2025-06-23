import { IConfigFactory, IConfigProvider } from './types';
import { EnvConfigProvider } from './providers/env-provider';

/**
 * Configuration factory for creating configuration providers
 */
export class ConfigFactory implements IConfigFactory {
  private static instance: ConfigFactory;
  private provider: IConfigProvider | null = null;

  private constructor() {}

  /**
   * Get the singleton instance of the configuration factory
   */
  static getInstance(): ConfigFactory {
    if (!ConfigFactory.instance) {
      ConfigFactory.instance = new ConfigFactory();
    }
    return ConfigFactory.instance;
  }

  /**
   * Create a configuration provider
   * @param type The type of provider to create (defaults to 'env')
   */
  create(type: 'env' | 'memory' | 'file' = 'env'): IConfigProvider {
    // Use cached provider if available
    if (this.provider) {
      return this.provider;
    }

    switch (type) {
      case 'env':
        this.provider = new EnvConfigProvider();
        break;
      
      // Future providers can be added here
      // case 'memory':
      //   this.provider = new MemoryConfigProvider();
      //   break;
      // case 'file':
      //   this.provider = new FileConfigProvider();
      //   break;
      
      default:
        throw new Error(`Unknown configuration provider type: ${type}`);
    }

    return this.provider;
  }

  /**
   * Clear the cached provider
   */
  clear(): void {
    this.provider = null;
  }
}