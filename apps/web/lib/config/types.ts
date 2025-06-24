// Re-export types from the config package
export {
  FeatureRing,
  ConfigCategory,
  type ConfigValue,
} from "@monorepo/config";

// Import ConfigValue for local use
import type { ConfigValue } from "@monorepo/config";

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
    environment: ConfigValue<"development" | "production" | "test">;
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
    logLevel: ConfigValue<"VERBOSE" | "INFO" | "WARN" | "ERROR" | "NONE">;
    clientLogLevel: ConfigValue<"VERBOSE" | "INFO" | "WARN" | "ERROR" | "NONE">;
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
