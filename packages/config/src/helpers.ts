import { IConfigProvider } from './types';

/**
 * Configuration helper functions
 */
export class ConfigHelpers<TConfig = any> {
  constructor(private provider: IConfigProvider<TConfig>) {}

  /**
   * Get a configuration value or throw if not found
   */
  getRequired<T>(path: string): T {
    const value = this.provider.get<T>(path);
    if (value === undefined) {
      throw new Error(`Required configuration not found: ${path}`);
    }
    return value;
  }

  /**
   * Get a configuration value or return a default
   */
  getOrDefault<T>(path: string, defaultValue: T): T {
    const value = this.provider.get<T>(path);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Get multiple configuration values
   */
  getMany<T extends Record<string, any>>(paths: string[]): Partial<T> {
    const result: any = {};
    for (const path of paths) {
      const value = this.provider.get(path);
      if (value !== undefined) {
        result[path] = value;
      }
    }
    return result;
  }

  /**
   * Check if all required configurations are present
   */
  hasAll(paths: string[]): boolean {
    return paths.every(path => this.provider.has(path));
  }

  /**
   * Check if any of the configurations are present
   */
  hasAny(paths: string[]): boolean {
    return paths.some(path => this.provider.has(path));
  }

  /**
   * Get configuration with validation
   */
  getValidated<T>(path: string, validator: (value: T) => boolean | string): T | undefined {
    const value = this.provider.get<T>(path);
    if (value === undefined) {
      return undefined;
    }
    
    const validationResult = validator(value);
    if (validationResult === true) {
      return value;
    }
    
    throw new Error(
      typeof validationResult === 'string' 
        ? validationResult 
        : `Validation failed for configuration: ${path}`
    );
  }

  /**
   * Get all configuration paths
   */
  getAllPaths(): string[] {
    const paths: string[] = [];
    const config = this.provider.getAll();
    
    const collectPaths = (obj: any, prefix: string = '') => {
      for (const key in obj) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (obj[key] && typeof obj[key] === 'object' && 'value' in obj[key]) {
          paths.push(path);
        } else if (obj[key] && typeof obj[key] === 'object') {
          collectPaths(obj[key], path);
        }
      }
    };
    
    collectPaths(config);
    return paths;
  }

  /**
   * Get configuration summary for logging
   */
  getSummary(): Record<string, any> {
    const summary: Record<string, any> = {};
    const config = this.provider.getAll();
    
    const collectSummary = (obj: any, prefix: string = '') => {
      for (const key in obj) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (obj[key] && typeof obj[key] === 'object' && 'value' in obj[key]) {
          const metadata = obj[key];
          summary[path] = {
            name: metadata.name,
            value: this.maskSensitiveValue(path, metadata.value),
            required: metadata.required,
            featureRing: metadata.featureRing
          };
        } else if (obj[key] && typeof obj[key] === 'object') {
          collectSummary(obj[key], path);
        }
      }
    };
    
    collectSummary(config);
    return summary;
  }

  /**
   * Mask sensitive configuration values for logging
   */
  private maskSensitiveValue(path: string, value: any): any {
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /key/i,
      /token/i,
      /credential/i
    ];
    
    if (sensitivePatterns.some(pattern => pattern.test(path))) {
      if (typeof value === 'string' && value.length > 0) {
        return '***REDACTED***';
      }
    }
    
    return value;
  }
}