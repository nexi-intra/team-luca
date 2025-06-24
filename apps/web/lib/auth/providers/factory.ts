import { IAuthProvider, AuthProviderConfig } from "./types";
import { NoAuthProvider } from "./no-auth-provider";
import { EntraIDAuthProvider } from "./entraid-provider";
import { SupabaseAuthProvider } from "./supabase-provider";
import { config } from "@/lib/config";
import { createLogger } from "@monorepo/logger";

const logger = createLogger("AuthProviderFactory");

/**
 * Factory for creating authentication providers based on configuration
 */
export class AuthProviderFactory {
  /**
   * Create an auth provider based on configuration
   */
  static create(): IAuthProvider {
    const providerType = (config.get("auth.provider") as string) || "entraid";

    logger.info("Creating auth provider", { provider: providerType });

    const providerConfig: AuthProviderConfig = {
      provider: providerType as "none" | "entraid" | "supabase",
      clientId: config.get("auth.clientId"),
      authority: config.get("auth.authority"),
      redirectUri: config.get("auth.redirectUri"),
      postLogoutRedirectUri: config.get("auth.postLogoutRedirectUri"),
      scopes: config.get("auth.scopes"),
      supabaseUrl: config.get("auth.supabaseUrl"),
      supabaseAnonKey: config.get("auth.supabaseAnonKey"),
    };

    switch (providerType) {
      case "none":
        return new NoAuthProvider();

      case "entraid":
        return new EntraIDAuthProvider(providerConfig);

      case "supabase":
        return new SupabaseAuthProvider(providerConfig);

      default:
        logger.error("Unknown auth provider", { provider: providerType });
        throw new Error(`Unknown authentication provider: ${providerType}`);
    }
  }
}
