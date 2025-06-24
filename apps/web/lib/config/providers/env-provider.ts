import {
  EnvConfigProvider as BaseEnvConfigProvider,
  ConfigCategory,
} from "@monorepo/config";
import { AppConfig } from "../types";

/**
 * Application-specific environment configuration provider
 */
export class EnvConfigProvider extends BaseEnvConfigProvider<AppConfig> {
  /**
   * Override validate to support conditional validation for auth fields
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Get base validation
    const baseResult = super.validate();
    errors.push(
      ...baseResult.errors.filter((error) => !error.includes("auth.")),
    );

    // Custom auth validation based on provider
    const provider = this.get<string>("auth.provider");

    if (provider === "entraid") {
      if (!this.get("auth.clientId")) {
        errors.push(
          "Microsoft Entra ID Client ID (auth.clientId) is required when using Entra ID authentication",
        );
      }
      if (!this.get("auth.authority")) {
        errors.push(
          "Microsoft Entra ID Authority (auth.authority) is required when using Entra ID authentication",
        );
      }
      if (!this.get("auth.sessionSecret")) {
        errors.push(
          "Session Secret (auth.sessionSecret) is required when using Entra ID authentication",
        );
      }
    }

    if (provider === "supabase") {
      if (!this.get("auth.supabaseUrl")) {
        errors.push(
          "Supabase URL (auth.supabaseUrl) is required when using Supabase authentication",
        );
      }
      if (!this.get("auth.supabaseAnonKey")) {
        errors.push(
          "Supabase Anon Key (auth.supabaseAnonKey) is required when using Supabase authentication",
        );
      }
      if (!this.get("auth.sessionSecret")) {
        errors.push(
          "Session Secret (auth.sessionSecret) is required when using Supabase authentication",
        );
      }
    }

    // Validate other required fields
    const authConfig = this.getByCategory(ConfigCategory.Authentication);
    for (const key in authConfig) {
      const configValue = authConfig[key];
      const path = `auth.${key}`;

      // Skip provider-specific validations already handled above
      if (
        [
          "clientId",
          "authority",
          "supabaseUrl",
          "supabaseAnonKey",
          "sessionSecret",
        ].includes(key)
      ) {
        continue;
      }

      if (configValue.required && !configValue.value) {
        errors.push(`${configValue.name} (${path}) is required but not set`);
      }

      if (configValue.value && configValue.validate) {
        const result = configValue.validate(configValue.value);
        if (result !== true) {
          errors.push(`${configValue.name} (${path}): ${result}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
