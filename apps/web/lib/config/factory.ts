import { createConfigFactory } from "@monorepo/config";
import { AppConfig } from "./types";
import { EnvConfigProvider } from "./providers/env-provider";
import { CONFIG_SCHEMA } from "./schema";
import { ENV_MAPPING } from "./env-mapping";

/**
 * Create the singleton configuration factory for the app
 */
export const configFactory = createConfigFactory<AppConfig>(
  CONFIG_SCHEMA as any,
  EnvConfigProvider,
  [CONFIG_SCHEMA, ENV_MAPPING],
);
