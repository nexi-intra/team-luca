// Re-export all telemetry utilities
export * from './config';
export * from './instrumentation';
export { initializeClientTelemetry, startSpan } from './client';

// Initialize client telemetry if in browser
if (typeof window !== 'undefined') {
  import('./client').then(({ initializeClientTelemetry }) => {
    initializeClientTelemetry();
  });
}