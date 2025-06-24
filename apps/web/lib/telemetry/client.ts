"use client";

import { context, trace, SpanStatusCode } from "@opentelemetry/api";
import { getTelemetryConfig, getResourceAttributes } from "./config";
import { createLogger } from "@monorepo/logger";

const logger = createLogger("Telemetry:Client");

let isInitialized = false;

export async function initializeClientTelemetry() {
  if (typeof window === "undefined" || isInitialized) {
    return;
  }

  const config = getTelemetryConfig();

  if (!config.tracesEndpoint) {
    logger.info("Client telemetry disabled - no endpoint configured");
    return;
  }

  try {
    // Dynamic imports for client-side only
    const [
      traceWeb,
      resources,
      traceBase,
      exporterHttp,
      contextZone,
      instrumentation,
      autoInstrumentationsWeb,
    ] = await Promise.all([
      import("@opentelemetry/sdk-trace-web"),
      import("@opentelemetry/resources"),
      import("@opentelemetry/sdk-trace-base"),
      import("@opentelemetry/exporter-trace-otlp-http"),
      import("@opentelemetry/context-zone"),
      import("@opentelemetry/instrumentation"),
      import("@opentelemetry/auto-instrumentations-web"),
    ]);

    const WebTracerProvider = traceWeb.WebTracerProvider;
    const BatchSpanProcessor = traceBase.BatchSpanProcessor;
    const OTLPTraceExporter = exporterHttp.OTLPTraceExporter;
    const ZoneContextManager = contextZone.ZoneContextManager;
    const registerInstrumentations = instrumentation.registerInstrumentations;
    const getWebAutoInstrumentations =
      autoInstrumentationsWeb.getWebAutoInstrumentations;

    logger.info("Initializing OpenTelemetry for client", {
      serviceName: config.serviceName,
      environment: config.environment,
    });

    // Create resource using resourceFromAttributes
    const resource = resources.resourceFromAttributes({
      ...getResourceAttributes(),
      "browser.user_agent": navigator.userAgent,
      "browser.language": navigator.language,
      "browser.mobile": /Mobile|Android|iPhone/i.test(navigator.userAgent),
    });

    // Create exporter
    const exporter = new OTLPTraceExporter({
      url: config.tracesEndpoint,
      headers: config.headers,
    });

    // Create span processor
    const processor = new BatchSpanProcessor(exporter, {
      maxQueueSize: 100,
      maxExportBatchSize: 50,
      scheduledDelayMillis: 500,
    });

    // Create provider with processor
    const provider = new WebTracerProvider({
      resource,
      sampler: {
        shouldSample: () => ({
          decision: Math.random() < (config.samplingRate || 1.0) ? 1 : 0,
          attributes: {},
        }),
        toString: () => "ProbabilitySampler",
      },
      spanProcessors: [processor],
    });

    // Register provider with context manager
    provider.register({
      contextManager: new ZoneContextManager(),
    });

    // Register instrumentations
    registerInstrumentations({
      instrumentations: [
        ...getWebAutoInstrumentations({
          "@opentelemetry/instrumentation-document-load": {
            enabled: true,
          },
          "@opentelemetry/instrumentation-user-interaction": {
            enabled: true,
            eventNames: ["click", "submit", "change"],
          },
          "@opentelemetry/instrumentation-fetch": {
            enabled: true,
            propagateTraceHeaderCorsUrls: /.*/,
            clearTimingResources: true,
          },
          "@opentelemetry/instrumentation-xml-http-request": {
            enabled: true,
            propagateTraceHeaderCorsUrls: /.*/,
          },
        }),
      ],
    });

    isInitialized = true;
    logger.info("Client telemetry initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize client telemetry:", error);
  }
}

// Manual tracing helpers
export const tracer = trace.getTracer("magic-button-client");

export function startSpan<T>(
  name: string,
  fn: (span: any) => T,
  attributes?: Record<string, any>,
): T {
  // Type assertion to handle the Promise case properly
  return tracer.startActiveSpan(name, { attributes }, (span) => {
    try {
      const result = fn(span);
      if (result instanceof Promise) {
        return result
          .then((res) => {
            span.setStatus({ code: SpanStatusCode.OK });
            return res;
          })
          .catch((error) => {
            span.recordException(error);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error.message,
            });
            throw error;
          })
          .finally(() => {
            span.end();
          }) as T;
      }
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
      return result;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      });
      span.end();
      throw error;
    }
  }) as T;
}
