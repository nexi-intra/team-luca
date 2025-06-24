import { EnvMapping } from '@monorepo/config';

/**
 * Environment variable mapping for configuration keys
 */
export const ENV_MAPPING: EnvMapping = {
  // Authentication
  'auth.provider': { envVar: 'AUTH_PROVIDER' },
  'auth.clientId': { envVar: 'NEXT_PUBLIC_AUTH_CLIENT_ID' },
  'auth.authority': { envVar: 'NEXT_PUBLIC_AUTH_AUTHORITY' },
  'auth.redirectUri': { envVar: 'NEXT_PUBLIC_AUTH_REDIRECT_URI' },
  'auth.postLogoutRedirectUri': { envVar: 'NEXT_PUBLIC_AUTH_POST_LOGOUT_URI' },
  'auth.sessionSecret': { envVar: 'SESSION_SECRET' },
  'auth.supabaseUrl': { envVar: 'NEXT_PUBLIC_SUPABASE_URL' },
  'auth.supabaseAnonKey': { envVar: 'NEXT_PUBLIC_SUPABASE_ANON_KEY' },
  
  // API
  'api.anthropicKey': { envVar: 'ANTHROPIC_API_KEY' },
  
  // General
  'general.appUrl': { envVar: 'NEXT_PUBLIC_APP_URL' },
  'general.environment': { envVar: 'NODE_ENV' },
  'general.port': { envVar: 'PORT' },
  
  // Telemetry
  'telemetry.serviceName': { envVar: 'OTEL_SERVICE_NAME' },
  'telemetry.serviceVersion': { envVar: 'OTEL_SERVICE_VERSION' },
  'telemetry.tracesEndpoint': { envVar: 'OTEL_EXPORTER_OTLP_TRACES_ENDPOINT' },
  'telemetry.metricsEndpoint': { envVar: 'OTEL_EXPORTER_OTLP_METRICS_ENDPOINT' },
  'telemetry.headers': { envVar: 'OTEL_EXPORTER_OTLP_HEADERS' },
  'telemetry.samplingRate': { envVar: 'OTEL_SAMPLING_RATE' },
  'telemetry.logLevel': { envVar: 'LOG_LEVEL' },
  'telemetry.clientLogLevel': { envVar: 'NEXT_PUBLIC_LOG_LEVEL' },
  
  // Features (these could be env vars or computed)
  'features.enableTelemetry': { envVar: 'ENABLE_TELEMETRY' },
  'features.enableAuth': { envVar: 'ENABLE_AUTH' },
  'features.enableAI': { envVar: 'ENABLE_AI' },
  'features.enableDevPanel': { envVar: 'ENABLE_DEV_PANEL' },
  
  // Runtime
  'runtime.nextRuntime': { envVar: 'NEXT_RUNTIME' },
  
  // Integrations
  'integrations.koksmatCompanionUrl': { envVar: 'NEXT_PUBLIC_KOKSMAT_COMPANION_URL' }
};