import { AuthConfig } from "./custom-auth-types";
import { config } from "@/lib/config";

export const customAuthConfig: AuthConfig = {
  clientId: config.getOrDefault("auth.clientId", ""),
  authority: config.getOrDefault(
    "auth.authority",
    "https://login.microsoftonline.com/common",
  ),
  redirectUri: config.getOrDefault(
    "auth.redirectUri",
    config.getOrDefault("general.appUrl", "http://localhost:3000"),
  ),
  postLogoutRedirectUri: config.getOrDefault(
    "auth.postLogoutRedirectUri",
    config.getOrDefault("general.appUrl", "http://localhost:3000"),
  ),
  scopes: config.getOrDefault("auth.scopes", [
    "openid",
    "profile",
    "email",
    "offline_access",
    "User.Read",
  ]),
  popup: {
    width: 500,
    height: 600,
  },
  persistence: {
    enabled: true,
    storageKey: "magic-button-auth",
  },
  silentAuth: {
    enabled: true,
    checkInterval: 5 * 60 * 1000, // 5 minutes
  },
};

// Helper function to check if auth is configured
export function isAuthConfigured(): boolean {
  const provider = config.get("auth.provider") as string;

  // If provider is 'none', auth is not configured
  if (provider === "none") {
    return false;
  }

  // For entraid, check required fields
  if (provider === "entraid") {
    return !!(
      customAuthConfig.clientId &&
      customAuthConfig.authority &&
      customAuthConfig.redirectUri
    );
  }

  // For supabase, check required fields
  if (provider === "supabase") {
    return !!(
      config.get("auth.supabaseUrl") && config.get("auth.supabaseAnonKey")
    );
  }

  // Default to checking entraid config for backward compatibility
  return !!(
    customAuthConfig.clientId &&
    customAuthConfig.authority &&
    customAuthConfig.redirectUri
  );
}
