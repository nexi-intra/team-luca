import { EnvConfigProvider } from "./env-provider";
import { AppConfig } from "../types";

/**
 * Client-safe environment configuration provider for Next.js
 *
 * This provider handles the limitations of accessing environment variables
 * on the client side in Next.js, where dynamic access to process.env doesn't work.
 */
export class ClientEnvConfigProvider extends EnvConfigProvider {
  constructor(schema: any, envMapping: any) {
    super(schema, envMapping);
    console.log(
      "[ClientEnvConfigProvider] Initialized, isClient:",
      typeof window !== "undefined",
    );

    // On client side, we need to reload the config with our client-specific logic
    // because the parent constructor already loaded it with the base implementation
    if (typeof window !== "undefined") {
      console.log("[ClientEnvConfigProvider] Reloading config for client-side");
      // Clear the cache and reload the config
      this.clearCache();
      this.config = this.loadConfiguration();
    }
  }

  protected loadConfigSection(section: any, prefix: string) {
    // On the server, use the parent implementation
    if (typeof window === "undefined") {
      return super.loadConfigSection(section, prefix);
    }

    console.log(
      "[ClientEnvConfigProvider] Loading client config section:",
      prefix,
    );

    // On the client, we need to handle NEXT_PUBLIC_ variables differently
    // Since dynamic access doesn't work, we'll manually map the known variables
    const clientEnvVars: Record<string, string | undefined> = {
      // Auth variables
      NEXT_PUBLIC_AUTH_CLIENT_ID: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID,
      NEXT_PUBLIC_AUTH_AUTHORITY: process.env.NEXT_PUBLIC_AUTH_AUTHORITY,
      NEXT_PUBLIC_AUTH_REDIRECT_URI: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URI,
      NEXT_PUBLIC_AUTH_POST_LOGOUT_URI:
        process.env.NEXT_PUBLIC_AUTH_POST_LOGOUT_URI,

      // Entra ID specific variables (these take precedence when AUTH_PROVIDER=entraid)
      NEXT_PUBLIC_ENTRAID_CLIENT_ID: process.env.NEXT_PUBLIC_ENTRAID_CLIENT_ID,
      NEXT_PUBLIC_ENTRAID_AUTHORITY: process.env.NEXT_PUBLIC_ENTRAID_AUTHORITY,
      NEXT_PUBLIC_ENTRAID_REDIRECT_URI:
        process.env.NEXT_PUBLIC_ENTRAID_REDIRECT_URI,
      NEXT_PUBLIC_ENTRAID_POST_LOGOUT_URI:
        process.env.NEXT_PUBLIC_ENTRAID_POST_LOGOUT_URI,

      // App configuration
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,

      // Auth provider selection (fallback to hardcoded value since AUTH_PROVIDER isn't NEXT_PUBLIC)
      AUTH_PROVIDER: "entraid", // Hardcoded since AUTH_PROVIDER isn't available on client
    };

    for (const key in section) {
      const path = `${prefix}.${key}`;
      const mapping = this.envMapping[path];

      console.log(
        `[ClientEnvConfigProvider] Processing ${path}, mapping:`,
        mapping,
      );

      if (mapping) {
        const envValue = clientEnvVars[mapping.envVar];
        console.log(
          `[ClientEnvConfigProvider] Env var ${mapping.envVar} = ${envValue}`,
        );

        if (envValue !== undefined) {
          const value = mapping.transform
            ? mapping.transform(envValue)
            : this.parseEnvValue(envValue, section[key]);

          if (value !== undefined) {
            section[key].value = value;
            console.log(
              `[ClientEnvConfigProvider] Set ${path} = ${value} from ${mapping.envVar}`,
            );
          }
        } else if (section[key].defaultValue !== undefined) {
          section[key].value = section[key].defaultValue;
          console.log(
            `[ClientEnvConfigProvider] Set ${path} = ${section[key].defaultValue} (default)`,
          );
        }
      } else {
        console.log(`[ClientEnvConfigProvider] No mapping found for ${path}`);
      }

      // Recursively load nested sections
      if (
        section[key] &&
        typeof section[key] === "object" &&
        !Array.isArray(section[key]) &&
        !section[key].hasOwnProperty("value")
      ) {
        this.loadConfigSection(section[key], path);
      }
    }
  }
}
