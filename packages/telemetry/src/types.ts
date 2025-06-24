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

export interface TelemetryLogger {
  verbose(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export interface TelemetryConfigProvider {
  getTelemetryConfig(): TelemetryConfig;
  getResourceAttributes(): Attributes;
}

export type OperationKey = string;

export interface OperationOptions {
  attributes?: Record<string, any>;
  recordException?: boolean;
}

export interface ApiCallOptions extends OperationOptions {
  statusCode?: number;
  requestBody?: any;
  responseBody?: any;
}