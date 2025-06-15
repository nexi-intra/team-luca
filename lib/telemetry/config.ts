import { Attributes } from '@opentelemetry/api';

export interface TelemetryConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  tracesEndpoint?: string;
  metricsEndpoint?: string;
  headers?: Record<string, string>;
  enableConsoleExporter?: boolean;
  samplingRate?: number;
}

export function getTelemetryConfig(): TelemetryConfig {
  return {
    serviceName: process.env.OTEL_SERVICE_NAME || 'magic-button-assistant',
    serviceVersion: process.env.OTEL_SERVICE_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    tracesEndpoint: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    metricsEndpoint: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT,
    headers: process.env.OTEL_EXPORTER_OTLP_HEADERS 
      ? JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS)
      : {},
    enableConsoleExporter: process.env.NODE_ENV === 'development',
    samplingRate: parseFloat(process.env.OTEL_SAMPLING_RATE || '1.0'),
  };
}

// Common resource attributes
export function getResourceAttributes(): Attributes {
  const config = getTelemetryConfig();
  return {
    'service.name': config.serviceName,
    'service.version': config.serviceVersion,
    'deployment.environment': config.environment,
    'telemetry.sdk.language': 'javascript',
    'telemetry.sdk.name': '@opentelemetry/sdk-node',
  };
}

// Sensitive field patterns to mask
export const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /apikey/i,
  /api_key/i,
  /authorization/i,
  /cookie/i,
  /session/i,
  /credit/i,
  /ssn/i,
  /email/i,
  /phone/i,
  /address/i,
];

// Fields that should be completely removed
export const FORBIDDEN_FIELDS = [
  'authorization',
  'cookie',
  'x-api-key',
  'x-auth-token',
  'session_secret',
  'anthropic_api_key',
];

// Aggregate operation keys for metrics
export const OPERATION_KEYS = {
  // API operations
  API_REQUEST: 'api.request',
  API_RESPONSE: 'api.response',
  API_ERROR: 'api.error',
  
  // Auth operations
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_REFRESH: 'auth.refresh',
  AUTH_VALIDATE: 'auth.validate',
  
  // Feature operations
  FEATURE_ACCESS: 'feature.access',
  FEATURE_TOGGLE: 'feature.toggle',
  
  // UI operations
  UI_INTERACTION: 'ui.interaction',
  UI_NAVIGATION: 'ui.navigation',
  UI_RENDER: 'ui.render',
  
  // Data operations
  DB_QUERY: 'db.query',
  CACHE_HIT: 'cache.hit',
  CACHE_MISS: 'cache.miss',
  
  // System operations
  SYSTEM_HEALTH: 'system.health',
  SYSTEM_ERROR: 'system.error',
} as const;

export type OperationKey = typeof OPERATION_KEYS[keyof typeof OPERATION_KEYS];