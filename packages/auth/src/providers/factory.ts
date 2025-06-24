import type { AuthProviderConfig } from "@monorepo/types";
import type { IAuthProvider } from "./types";
import { NoAuthProvider } from "./no-auth-provider";
import { createLogger } from "@monorepo/logger";

const logger = createLogger("auth-factory");

/**
 * Registry of authentication providers
 */
const providerRegistry = new Map<string, (config: any) => IAuthProvider>();

/**
 * Register a custom authentication provider
 */
export function registerAuthProvider(
  name: string,
  factory: (config: any) => IAuthProvider,
): void {
  providerRegistry.set(name, factory);
  logger.info(`Registered auth provider: ${name}`);
}

/**
 * Create an authentication provider based on configuration
 */
export function createAuthProvider(config: AuthProviderConfig): IAuthProvider {
  logger.info(`Creating auth provider: ${config.provider}`);

  // Check for custom registered providers first
  if (providerRegistry.has(config.provider)) {
    const factory = providerRegistry.get(config.provider)!;
    return factory(config);
  }

  // Built-in providers
  switch (config.provider) {
    case "none":
      return new NoAuthProvider();

    case "entraid":
      // EntraID provider would be imported here
      // For now, throw an error to indicate it needs to be implemented
      throw new Error("EntraID provider not yet implemented in auth package");

    case "supabase":
      // Supabase provider would be imported here
      // For now, throw an error to indicate it needs to be implemented
      throw new Error("Supabase provider not yet implemented in auth package");

    default:
      throw new Error(`Unknown auth provider: ${config.provider}`);
  }
}

/**
 * Initialize default providers
 */
export function initializeDefaultProviders(): void {
  // Register built-in providers
  registerAuthProvider("none", () => new NoAuthProvider());

  // Other providers would be registered here when implemented
  logger.info("Default auth providers initialized");
}
