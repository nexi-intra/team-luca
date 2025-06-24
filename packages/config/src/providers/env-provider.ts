import { ConfigValue, ConfigSchema, EnvMapping } from "../types";
import { BaseConfigProvider } from "./base-provider";

/**
 * Configuration provider that reads from environment variables
 */
export class EnvConfigProvider<
  TConfig = any,
> extends BaseConfigProvider<TConfig> {
  private envMapping: EnvMapping;

  constructor(schema: ConfigSchema, envMapping: EnvMapping) {
    super(schema);
    this.envMapping = envMapping;
    this.initialize();
  }

  protected loadConfiguration(): TConfig {
    // Deep clone the schema to create the config
    const config = JSON.parse(JSON.stringify(this.schema)) as TConfig;

    // Load values from environment for each section
    for (const sectionKey in this.schema) {
      if (config && typeof config === "object" && sectionKey in config) {
        this.loadConfigSection((config as any)[sectionKey], sectionKey);
      }
    }

    return config;
  }

  protected loadConfigSection(section: any, prefix: string) {
    for (const key in section) {
      const path = `${prefix}.${key}`;
      const mapping = this.envMapping[path];

      if (mapping) {
        const envValue = process.env[mapping.envVar];

        if (envValue !== undefined) {
          const value = mapping.transform
            ? mapping.transform(envValue)
            : this.parseEnvValue(envValue, section[key]);

          if (value !== undefined) {
            section[key].value = value;
          }
        } else if (section[key].defaultValue !== undefined) {
          section[key].value = section[key].defaultValue;
        }
      } else if (section[key].defaultValue !== undefined) {
        section[key].value = section[key].defaultValue;
      }
    }
  }

  protected parseEnvValue(
    envValue: string,
    configValue: ConfigValue<any>,
  ): any {
    // Handle special cases based on the expected type
    if (configValue.defaultValue !== undefined) {
      const defaultType = typeof configValue.defaultValue;

      switch (defaultType) {
        case "boolean":
          return envValue.toLowerCase() === "true" || envValue === "1";

        case "number":
          const num = parseFloat(envValue);
          return isNaN(num) ? undefined : num;

        case "object":
          if (Array.isArray(configValue.defaultValue)) {
            // Handle array values (e.g., scopes)
            return envValue
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
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

  /**
   * Override validate to support conditional validation
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Call base validation
    const baseResult = super.validate();
    errors.push(...baseResult.errors);

    // Apps can extend this class and override this method for custom validation

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
