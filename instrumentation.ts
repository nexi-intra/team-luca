export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { NodeSDK } = await import('@opentelemetry/sdk-node');
      const { getNodeAutoInstrumentations } = await import('@opentelemetry/auto-instrumentations-node');
      const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
      const { OTLPMetricExporter } = await import('@opentelemetry/exporter-metrics-otlp-http');
      const { PeriodicExportingMetricReader } = await import('@opentelemetry/sdk-metrics');
      
      const serviceName = process.env.OTEL_SERVICE_NAME || 'magic-button-assistant';
      const serviceVersion = process.env.OTEL_SERVICE_VERSION || '1.0.0';
      
      const otelTraceEndpoint = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:14268/api/traces';
      const otelMetricsEndpoint = process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://localhost:9464/v1/metrics';

      const traceExporter = new OTLPTraceExporter({
        url: otelTraceEndpoint,
        headers: process.env.OTEL_EXPORTER_OTLP_HEADERS ? 
          JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS) : {},
      });

      const metricExporter = new OTLPMetricExporter({
        url: otelMetricsEndpoint,
        headers: process.env.OTEL_EXPORTER_OTLP_HEADERS ? 
          JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS) : {},
      });

      const sdk = new NodeSDK({
        serviceName,
        traceExporter,
        metricReader: new PeriodicExportingMetricReader({
          exporter: metricExporter,
          exportIntervalMillis: 10000,
        }),
        instrumentations: [
          getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-fs': {
              enabled: process.env.NODE_ENV === 'production',
            },
            '@opentelemetry/instrumentation-http': {
              enabled: true,
              requestHook: (span, request) => {
                if ('headers' in request && request.headers) {
                  span.setAttributes({
                    'http.request.header.user-agent': request.headers['user-agent'] || '',
                    'http.request.header.x-forwarded-for': request.headers['x-forwarded-for'] || '',
                  });
                }
              },
            },
            '@opentelemetry/instrumentation-express': {
              enabled: true,
            },
            '@opentelemetry/instrumentation-dns': {
              enabled: false,
            },
            '@opentelemetry/instrumentation-net': {
              enabled: false,
            },
          }),
        ],
      });

      sdk.start();

      console.log(`🔭 OpenTelemetry instrumentation initialized successfully`);
      console.log(`🔭 Service: ${serviceName} v${serviceVersion}`);
      console.log(`🔭 Traces endpoint: ${otelTraceEndpoint}`);
      console.log(`🔭 Metrics endpoint: ${otelMetricsEndpoint}`);

      const shutdown = async () => {
        try {
          await sdk.shutdown();
          console.log('🔭 OpenTelemetry terminated successfully');
        } catch (error) {
          console.error('🔭 Error terminating OpenTelemetry:', error);
        } finally {
          process.exit(0);
        }
      };

      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
    } catch (error) {
      console.warn('🔭 Failed to initialize OpenTelemetry:', error);
    }
  }
}