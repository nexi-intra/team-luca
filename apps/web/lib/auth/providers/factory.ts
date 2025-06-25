import { IAuthProvider, AuthProviderConfig } from "./types";
import { NoAuthProvider } from "./no-auth-provider";
import { EntraIDAuthProvider } from "./entraid-provider";
import { SupabaseAuthProvider } from "./supabase-provider";
import { config } from "@/lib/config";
import { createLogger } from "@monorepo/logger";
import { getClientAuthConfig } from "../client-config";

const logger = createLogger("AuthProviderFactory");

/**
 * Factory for creating authentication providers based on configuration
 */
export class AuthProviderFactory {
  /**
   * Create an auth provider based on configuration
   */
  static create(): IAuthProvider {
    let providerConfig: AuthProviderConfig;
    let providerType: string;

    // On client side, use direct env var access
    if (typeof window !== "undefined") {
      const clientConfig = getClientAuthConfig();
      providerType = clientConfig.provider;

      logger.info("Creating auth provider (client)", {
        provider: providerType,
      });

      providerConfig = {
        provider: providerType as "none" | "entraid" | "supabase",
        clientId: clientConfig.clientId,
        authority: clientConfig.authority,
        redirectUri: clientConfig.redirectUri,
        postLogoutRedirectUri: clientConfig.postLogoutRedirectUri,
        scopes: ["openid", "profile", "email", "offline_access", "User.Read"], // Default scopes
        supabaseUrl: "", // Not needed for entraid
        supabaseAnonKey: "", // Not needed for entraid
      };

      console.log("[AuthProviderFactory] Client-side config values:", {
        provider: providerType,
        clientId: providerConfig.clientId,
        authority: providerConfig.authority,
        redirectUri: providerConfig.redirectUri,
      });
    } else {
      // On server side, use the config system
      providerType = (config.get("auth.provider") as string) || "entraid";

      logger.info("Creating auth provider (server)", {
        provider: providerType,
      });

      providerConfig = {
        provider: providerType as "none" | "entraid" | "supabase",
        clientId: config.get("auth.clientId"),
        authority: config.get("auth.authority"),
        redirectUri: config.get("auth.redirectUri"),
        postLogoutRedirectUri: config.get("auth.postLogoutRedirectUri"),
        scopes: config.get("auth.scopes"),
        supabaseUrl: config.get("auth.supabaseUrl"),
        supabaseAnonKey: config.get("auth.supabaseAnonKey"),
      };
    }

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
