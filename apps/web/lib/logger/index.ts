// Re-export everything from the logger package except default
export * from "@monorepo/logger";

// Import the necessary types and functions
import { createLoggerWithConfig, LogLevelConfig } from "@monorepo/logger";

// Create a config adapter for the app's config system
class AppLogLevelConfig implements LogLevelConfig {
  getLogLevel(): string {
    // Import config dynamically to avoid circular dependency
    const { config } = require("@/lib/config");

    const isClient = typeof window !== "undefined";
    return isClient
      ? config.getOrDefault("telemetry.clientLogLevel", "INFO")
      : config.getOrDefault("telemetry.logLevel", "INFO");
  }
}

// Create and export a logger instance with app config
const appLogger = createLoggerWithConfig(new AppLogLevelConfig());

// Export the configured logger as default
export default appLogger;
