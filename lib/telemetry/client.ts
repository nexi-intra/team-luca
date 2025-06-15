'use client';

import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { Resource } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { context, trace, SpanStatusCode } from '@opentelemetry/api';
import { getTelemetryConfig, getResourceAttributes } from './config';
import { createSanitizingSpanProcessor } from './processors';
import { createLogger } from '@/lib/logger';

const logger = createLogger('Telemetry:Client');

let isInitialized = false;

export function initializeClientTelemetry() {
  if (typeof window === 'undefined' || isInitialized) {
    return;
  }
  
  const config = getTelemetryConfig();
  
  if (!config.tracesEndpoint) {
    logger.info('Client telemetry disabled - no endpoint configured');
    return;
  }
  
  logger.info('Initializing OpenTelemetry for client', {
    serviceName: config.serviceName,
    environment: config.environment,
  });
  
  // Create resource
  const resource = new Resource({
    ...getResourceAttributes(),
    'browser.user_agent': navigator.userAgent,
    'browser.language': navigator.language,
    'browser.mobile': /Mobile|Android|iPhone/i.test(navigator.userAgent),
  });
  
  // Create provider
  const provider = new WebTracerProvider({
    resource,
    sampler: {
      shouldSample: () => ({
        decision: Math.random() < config.samplingRate ? 1 : 0,
        attributes: {},
      }),
      toString: () => 'ProbabilitySampler',
    },
  });
  
  // Create exporter
  const exporter = new OTLPTraceExporter({
    url: config.tracesEndpoint,
    headers: config.headers,
  });
  
  // Add span processor with sanitization
  provider.addSpanProcessor(
    createSanitizingSpanProcessor(
      new BatchSpanProcessor(exporter, {
        maxQueueSize: 100,
        maxExportBatchSize: 50,
        scheduledDelayMillis: 500,
      })
    )
  );
  
  // Set up context manager
  provider.register({
    contextManager: new ZoneContextManager(),
  });
  
  // Register instrumentations
  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: /.*/,
        clearTimingResources: true,
        applyCustomAttributesOnSpan: (span, request, response) => {
          // Add custom attributes
          span.setAttributes({
            'http.request.method': request.method,
            'http.response.status_code': response?.status,
            'app.request.type': 'fetch',
          });
          
          // Don't trace certain URLs
          const url = request.url || request.toString();
          if (
            url.includes('_next') ||
            url.includes('.js') ||
            url.includes('.css') ||
            url.includes('favicon')
          ) {
            span.setStatus({ code: SpanStatusCode.OK });
            span.end();
          }
        },
      }),
      new XMLHttpRequestInstrumentation({
        propagateTraceHeaderCorsUrls: /.*/,
        clearTimingResources: true,
      }),
      new DocumentLoadInstrumentation(),
      new UserInteractionInstrumentation({
        eventNames: ['click', 'submit', 'change'],
        shouldPreventSpanCreation: (eventType, element) => {
          // Don't create spans for certain elements
          const tagName = element.tagName?.toLowerCase();
          return tagName === 'html' || tagName === 'body';
        },
      }),
    ],
  });
  
  isInitialized = true;
  logger.info('Client telemetry initialized successfully');
}

// Manual tracing helpers
export const tracer = trace.getTracer('magic-button-client');

export function startSpan<T>(
  name: string,
  fn: (span: any) => T,
  attributes?: Record<string, any>
): T {
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
          });
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
  });
}