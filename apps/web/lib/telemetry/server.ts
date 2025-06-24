import { NodeSDK } from "@opentelemetry/sdk-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from "@opentelemetry/sdk-trace-base";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { getTelemetryConfig, getResourceAttributes } from "./config";
import { createSanitizingSpanProcessor } from "./processors";
import { createErrorHandlingProcessor } from "./error-handling-processor";
// Import logger without alias for server-side
const { createLogger } = require("../logger");

const logger = createLogger("Telemetry:Server");

// Global flag to prevent duplicate initialization
let isInitialized = false;

export function initializeServerTelemetry() {
  // Prevent duplicate initialization
  if (isInitialized) {
    logger.debug("OpenTelemetry already initialized, skipping");
    return;
  }

  const config = getTelemetryConfig();

  if (!config.tracesEndpoint && !config.enableConsoleExporter) {
    logger.info("OpenTelemetry disabled - no endpoint configured");
    return;
  }

  // Mark as initialized early to prevent race conditions
  isInitialized = true;

  // Enable diagnostics in development
  if (config.environment === "development") {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);
  }

  logger.info("Initializing OpenTelemetry for server", {
    serviceName: config.serviceName,
    environment: config.environment,
  });

  // Create resource
  const resource = resourceFromAttributes({
    ...getResourceAttributes(),
    [SemanticResourceAttributes.PROCESS_PID]: process.pid,
    [SemanticResourceAttributes.PROCESS_EXECUTABLE_NAME]: "node",
    [SemanticResourceAttributes.PROCESS_RUNTIME_NAME]: "nodejs",
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
    spanProcessors: [
      createErrorHandlingProcessor(
        createSanitizingSpanProcessor(new BatchSpanProcessor(traceExporter)),
      ),
    ],
    metricReader: metricExporter
      ? new PeriodicExportingMetricReader({
          exporter: metricExporter,
          exportIntervalMillis: 60000, // Export every minute
        })
      : undefined,
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": {
          enabled: false, // Disable fs to reduce noise
        },
        "@opentelemetry/instrumentation-winston": {
          enabled: false, // Disable winston as it's not installed
        },
        "@opentelemetry/instrumentation-http": {
          requestHook: (span, request) => {
            // Add custom attributes for incoming messages
            if ("headers" in request && request.headers) {
              span.setAttributes({
                "http.request.body.size":
                  request.headers["content-length"] || 0,
                "app.request.id": request.headers["x-request-id"] || "unknown",
              });
            }
          },
          responseHook: (span, response) => {
            // Add response attributes
            if ("headers" in response && response.headers) {
              span.setAttributes({
                "http.response.body.size":
                  response.headers["content-length"] || 0,
              });
            }
          },
          ignoreIncomingRequestHook: (request) => {
            const url = request.url || "";
            return (
              url.startsWith("/_next") ||
              url.startsWith("/api/health") ||
              url.startsWith("/favicon") ||
              url.endsWith(".js") ||
              url.endsWith(".css") ||
              url.endsWith(".map")
            );
          },
          ignoreOutgoingRequestHook: (options) => {
            const hostname = options.hostname || "";
            const port = options.port || "";
            return (
              hostname === "localhost" && (port === 9464 || port === 14268)
            );
          },
        },
      }),
    ],
  });

  // Initialize the SDK
  try {
    sdk.start();

    // Graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("Shutting down OpenTelemetry");
      sdk
        .shutdown()
        .then(() => logger.info("OpenTelemetry terminated"))
        .catch((error) =>
          logger.error("Error terminating OpenTelemetry", error),
        );
    });

    logger.info("OpenTelemetry initialized successfully");
  } catch (error) {
    // Handle duplicate registration errors gracefully
    if (
      error instanceof Error &&
      error.message.includes("duplicate registration")
    ) {
      logger.debug("OpenTelemetry already registered, continuing normally");
    } else {
      logger.error("Failed to start OpenTelemetry SDK", error);
      // Reset initialization flag on failure
      isInitialized = false;
    }
  }
}
