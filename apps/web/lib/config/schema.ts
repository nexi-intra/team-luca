import { AppConfig, ConfigValue, FeatureRing } from "./types";

/**
 * Configuration schema with metadata for all application settings
 */
export const CONFIG_SCHEMA: AppConfig = {
  auth: {
    provider: {
      value: "entraid",
      name: "Authentication Provider",
      description: "Authentication provider to use (none, entraid, supabase)",
      featureRing: FeatureRing.GA,
      required: true,
      defaultValue: "entraid",
      example: "entraid",
      validate: (value) => {
        const validProviders = ["none", "entraid", "supabase"];
        return (
          validProviders.includes(value) ||
          `Must be one of: ${validProviders.join(", ")}`
        );
      },
    },
    clientId: {
      value: "",
      name: "Client ID",
      description:
        "Microsoft Entra ID application (client) ID for authentication",
      featureRing: FeatureRing.GA,
      required: false, // Now optional, only required for entraid
      example: "9f441c8f-7365-43bc-bb37-a8075043d1b1",
      validate: (value) => {
        if (!value) return true; // Allow empty for non-entraid providers
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value) || "Must be a valid UUID";
      },
    },
    authority: {
      value: "",
      name: "Authority URL",
      description:
        "Microsoft identity platform authority URL (tenant-specific or common)",
      featureRing: FeatureRing.GA,
      required: false, // Now optional, only required for entraid
      example: "https://login.microsoftonline.com/your-tenant-id",
      defaultValue: "https://login.microsoftonline.com/common",
      validate: (value) => {
        if (!value) return true; // Allow empty for non-entraid providers
        const urlRegex = /^https:\/\/login\.microsoftonline\.com\/.+$/;
        return (
          urlRegex.test(value) || "Must be a valid Microsoft authority URL"
        );
      },
    },
    redirectUri: {
      value: "",
      name: "Redirect URI",
      description: "OAuth redirect URI for authentication callbacks",
      featureRing: FeatureRing.GA,
      required: false,
      example: "http://localhost:2803",
      validate: (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return "Must be a valid URL";
        }
      },
    },
    postLogoutRedirectUri: {
      value: "",
      name: "Post-Logout Redirect URI",
      description: "Where to redirect users after logout",
      featureRing: FeatureRing.GA,
      required: false,
      example: "http://localhost:2803",
      validate: (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return "Must be a valid URL";
        }
      },
    },
    sessionSecret: {
      value: "",
      name: "Session Secret",
      description:
        "Secret key for encrypting session data (minimum 32 characters)",
      featureRing: FeatureRing.GA,
      required: true,
      example: "your-super-secret-session-key-make-it-very-long",
      validate: (value) =>
        value.length >= 32 || "Must be at least 32 characters long",
    },
    scopes: {
      value: [],
      name: "OAuth Scopes",
      description: "Permission scopes requested from Microsoft Graph",
      featureRing: FeatureRing.GA,
      required: false, // Now optional, only required for entraid
      defaultValue: [
        "openid",
        "profile",
        "email",
        "offline_access",
        "User.Read",
      ],
      example: "openid profile email User.Read",
    },
    supabaseUrl: {
      value: "",
      name: "Supabase URL",
      description: "Your Supabase project URL",
      featureRing: FeatureRing.GA,
      required: false, // Only required for supabase provider
      example: "https://your-project.supabase.co",
      validate: (value) => {
        if (!value) return true; // Allow empty for non-supabase providers
        try {
          new URL(value);
          return true;
        } catch {
          return "Must be a valid URL";
        }
      },
    },
    supabaseAnonKey: {
      value: "",
      name: "Supabase Anonymous Key",
      description: "Your Supabase project anonymous/public key",
      featureRing: FeatureRing.GA,
      required: false, // Only required for supabase provider
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      validate: (value) => {
        if (!value) return true; // Allow empty for non-supabase providers
        return value.length > 20 || "Must be a valid Supabase key";
      },
    },
  },

  api: {
    anthropicKey: {
      value: "",
      name: "Anthropic API Key",
      description: "API key for Claude AI integration",
      featureRing: FeatureRing.GA,
      required: true,
      example: "sk-ant-api03-...",
      validate: (value) =>
        value.startsWith("sk-ant-") || "Must start with sk-ant-",
    },
  },

  general: {
    appUrl: {
      value: "",
      name: "Application URL",
      description: "Public URL where your application is hosted",
      featureRing: FeatureRing.GA,
      required: true,
      defaultValue: "http://localhost:2803",
      example: "https://myapp.example.com",
      validate: (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return "Must be a valid URL";
        }
      },
    },
    environment: {
      value: "development",
      name: "Environment",
      description: "Current application environment",
      featureRing: FeatureRing.Internal,
      required: true,
      defaultValue: "development",
      validate: (value) =>
        ["development", "production", "test"].includes(value) ||
        "Must be development, production, or test",
    },
    port: {
      value: 2803,
      name: "Server Port",
      description: "Port number for the application server",
      featureRing: FeatureRing.Internal,
      required: false,
      defaultValue: 2803,
      example: "3000",
      validate: (value) =>
        (value > 0 && value <= 65535) ||
        "Must be a valid port number (1-65535)",
    },
  },

  telemetry: {
    serviceName: {
      value: "",
      name: "Service Name",
      description: "Name identifier for telemetry and monitoring",
      featureRing: FeatureRing.Beta,
      required: false,
      defaultValue: "magic-button-assistant",
      example: "my-assistant-app",
    },
    serviceVersion: {
      value: "",
      name: "Service Version",
      description: "Service version for telemetry and monitoring",
      featureRing: FeatureRing.Beta,
      required: false,
      defaultValue: "1.0.0",
      example: "1.0.0",
    },
    tracesEndpoint: {
      value: "",
      name: "Traces Endpoint",
      description: "OpenTelemetry traces collection endpoint",
      featureRing: FeatureRing.Beta,
      required: false,
      example: "http://localhost:14268/api/traces",
      validate: (value) => {
        if (!value) return true;
        try {
          new URL(value);
          return true;
        } catch {
          return "Must be a valid URL";
        }
      },
    },
    metricsEndpoint: {
      value: "",
      name: "Metrics Endpoint",
      description: "OpenTelemetry metrics collection endpoint",
      featureRing: FeatureRing.Beta,
      required: false,
      example: "http://localhost:9464/v1/metrics",
      validate: (value) => {
        if (!value) return true;
        try {
          new URL(value);
          return true;
        } catch {
          return "Must be a valid URL";
        }
      },
    },
    headers: {
      value: {},
      name: "Telemetry Headers",
      description: "Additional headers for telemetry endpoints",
      featureRing: FeatureRing.Beta,
      required: false,
      defaultValue: {},
      example: '{"Authorization": "Bearer token"}',
    },
    samplingRate: {
      value: 1.0,
      name: "Sampling Rate",
      description: "Telemetry sampling rate (0.0 to 1.0)",
      featureRing: FeatureRing.Beta,
      required: false,
      defaultValue: 1.0,
      example: "0.1",
      validate: (value) =>
        (value >= 0 && value <= 1) || "Must be between 0 and 1",
    },
    logLevel: {
      value: "INFO",
      name: "Server Log Level",
      description: "Logging verbosity for server-side code",
      featureRing: FeatureRing.GA,
      required: false,
      defaultValue: "INFO",
      validate: (value) =>
        ["VERBOSE", "INFO", "WARN", "ERROR", "NONE"].includes(value) ||
        "Must be VERBOSE, INFO, WARN, ERROR, or NONE",
    },
    clientLogLevel: {
      value: "INFO",
      name: "Client Log Level",
      description: "Logging verbosity for client-side code",
      featureRing: FeatureRing.GA,
      required: false,
      defaultValue: "INFO",
      validate: (value) =>
        ["VERBOSE", "INFO", "WARN", "ERROR", "NONE"].includes(value) ||
        "Must be VERBOSE, INFO, WARN, ERROR, or NONE",
    },
  },

  features: {
    enableTelemetry: {
      value: true,
      name: "Enable Telemetry",
      description: "Enable OpenTelemetry instrumentation and monitoring",
      featureRing: FeatureRing.Beta,
      required: false,
      defaultValue: true,
    },
    enableAuth: {
      value: true,
      name: "Enable Authentication",
      description: "Require authentication for application access",
      featureRing: FeatureRing.GA,
      required: false,
      defaultValue: true,
    },
    enableAI: {
      value: true,
      name: "Enable AI Features",
      description: "Enable Claude AI integration and features",
      featureRing: FeatureRing.GA,
      required: false,
      defaultValue: true,
    },
    enableDevPanel: {
      value: true,
      name: "Enable Dev Panel",
      description: "Show developer panel in development mode",
      featureRing: FeatureRing.Internal,
      required: false,
      defaultValue: true,
    },
  },

  runtime: {
    nextRuntime: {
      value: "",
      name: "Next.js Runtime",
      description: "Next.js runtime environment (nodejs or edge)",
      featureRing: FeatureRing.Internal,
      required: false,
      defaultValue: "nodejs",
    },
  },

  integrations: {
    koksmatCompanionUrl: {
      value: "",
      name: "Koksmat Companion URL",
      description: "URL for the Koksmat developer companion server",
      featureRing: FeatureRing.Internal,
      required: false,
      defaultValue: "http://localhost:2512",
      validate: (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return "Must be a valid URL";
        }
      },
    },
  },
};
