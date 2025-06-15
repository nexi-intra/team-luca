import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { getTelemetryConfig, getResourceAttributes } from './config';
import { createSanitizingSpanProcessor } from './processors';
// Import logger without alias for server-side
const { createLogger } = require('../logger');

const logger = createLogger('Telemetry:Server');

export function initializeServerTelemetry() {
  const config = getTelemetryConfig();
  
  if (!config.tracesEndpoint && !config.enableConsoleExporter) {
    logger.info('OpenTelemetry disabled - no endpoint configured');
    return;
  }
  
  // Enable diagnostics in development
  if (process.env.NODE_ENV === 'development') {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
  }
  
  logger.info('Initializing OpenTelemetry for server', {
    serviceName: config.serviceName,
    environment: config.environment,
  });
  
  // Create resource
  const resource = new Resource({
    ...getResourceAttributes(),
    [SemanticResourceAttributes.PROCESS_PID]: process.pid,
    [SemanticResourceAttributes.PROCESS_EXECUTABLE_NAME]: 'node',
    [SemanticResourceAttributes.PROCESS_RUNTIME_NAME]: 'nodejs',
    [SemanticResourceAttributes.PROCESS_RUNTIME_VERSION]: process.version,
  });
  
  // Create trace exporter
  const traceExporter = config.tracesEndpoint
    ? new OTLPTraceExporter({
        url: config.tracesEndpoint,
        headers: config.headers,
      })
    : new ConsoleSpanExporter();
  
  // Create metric exporter
  const metricExporter = config.metricsEndpoint
    ? new OTLPMetricExporter({
        url: config.metricsEndpoint,
        headers: config.headers,
      })
    : undefined;
  
  // Create SDK
  const sdk = new NodeSDK({
    resource,
    spanProcessor: createSanitizingSpanProcessor(
      new BatchSpanProcessor(traceExporter)
    ),
    metricReader: metricExporter
      ? new PeriodicExportingMetricReader({
          exporter: metricExporter,
          exportIntervalMillis: 60000, // Export every minute
        })
      : undefined,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
          enabled: false, // Disable fs to reduce noise
        },
        '@opentelemetry/instrumentation-http': {
          requestHook: (span, request) => {
            // Add custom attributes
            span.setAttributes({
              'http.request.body.size': request.headers['content-length'] || 0,
              'app.request.id': request.headers['x-request-id'] || 'unknown',
            });
          },
          responseHook: (span, response) => {
            // Add response attributes
            span.setAttributes({
              'http.response.body.size': response.headers['content-length'] || 0,
            });
          },
          ignoreIncomingPaths: [
            /^\/_next/,
            /^\/api\/health/,
            /^\/favicon/,
            /\.js$/,
            /\.css$/,
            /\.map$/,
          ],
          ignoreOutgoingUrls: [
            /localhost:9464/, // Metrics endpoint
            /localhost:14268/, // Traces endpoint
          ],
        },
      }),
    ],
  });
  
  // Initialize the SDK
  sdk.start();
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('Shutting down OpenTelemetry');
    sdk.shutdown()
      .then(() => logger.info('OpenTelemetry terminated'))
      .catch((error) => logger.error('Error terminating OpenTelemetry', error));
  });
  
  logger.info('OpenTelemetry initialized successfully');
}

// Initialize on module load if not in test environment
if (process.env.NODE_ENV !== 'test') {
  initializeServerTelemetry();
}