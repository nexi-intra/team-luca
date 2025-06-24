import { Attributes } from '@opentelemetry/api';
import type { TelemetryConfig } from '@monorepo/telemetry';

// Re-export constants from the telemetry package
export { SENSITIVE_PATTERNS, FORBIDDEN_FIELDS, OPERATION_KEYS } from '@monorepo/telemetry';
export type { OperationKey } from '@monorepo/telemetry';

export function getTelemetryConfig(): TelemetryConfig {
  // Import config dynamically to avoid circular dependency
  const { config } = require('@/lib/config');
  
  // Allow disabling telemetry entirely
  const isDisabled = process.env.OTEL_DISABLED === 'true' || process.env.DISABLE_TELEMETRY === 'true';
  
  return {
    serviceName: config.getOrDefault('telemetry.serviceName', 'magic-button-assistant'),
    serviceVersion: '1.0.0', // TODO: Move to config if needed
    environment: config.getOrDefault('general.environment', 'development'),
    tracesEndpoint: isDisabled ? undefined : config.get('telemetry.tracesEndpoint'),
    metricsEndpoint: isDisabled ? undefined : config.get('telemetry.metricsEndpoint'),
    headers: config.getOrDefault('telemetry.headers', {}),
    enableConsoleExporter: config.getOrDefault('general.environment', 'development') === 'development',
    samplingRate: config.getOrDefault('telemetry.samplingRate', 1.0),
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