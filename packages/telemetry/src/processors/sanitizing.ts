import { Context } from '@opentelemetry/api';
import { SpanProcessor, ReadableSpan, Span } from '@opentelemetry/sdk-trace-base';
import { maskSensitiveData, sanitizeHeaders, sanitizeUrl } from '../masking';
import { TelemetryLogger } from '../interfaces/logger';

export class SanitizingSpanProcessor implements SpanProcessor {
  constructor(
    private readonly processor: SpanProcessor,
    private readonly logger?: TelemetryLogger
  ) {}

  forceFlush(): Promise<void> {
    return this.processor.forceFlush();
  }

  onStart(span: Span, parentContext: Context): void {
    // Sanitize span attributes on start
    const attributes = span.attributes;
    if (attributes) {
      const sanitized = maskSensitiveData(attributes);
      span.setAttributes(sanitized);
    }
    
    this.processor.onStart(span, parentContext);
  }

  onEnd(span: ReadableSpan): void {
    // Create a sanitized copy of the span
    const sanitizedSpan = this.sanitizeSpan(span);
    this.processor.onEnd(sanitizedSpan);
  }

  shutdown(): Promise<void> {
    return this.processor.shutdown();
  }

  private sanitizeSpan(span: ReadableSpan): ReadableSpan {
    const sanitized = Object.create(span);
    
    // Sanitize attributes
    if (span.attributes) {
      sanitized.attributes = maskSensitiveData(span.attributes);
      
      // Special handling for URLs
      if (sanitized.attributes['http.url']) {
        sanitized.attributes['http.url'] = sanitizeUrl(
          String(sanitized.attributes['http.url'])
        );
      }
      
      // Special handling for headers
      if (sanitized.attributes['http.request.headers']) {
        sanitized.attributes['http.request.headers'] = sanitizeHeaders(
          sanitized.attributes['http.request.headers'] as Record<string, string>
        );
      }
      
      if (sanitized.attributes['http.response.headers']) {
        sanitized.attributes['http.response.headers'] = sanitizeHeaders(
          sanitized.attributes['http.response.headers'] as Record<string, string>
        );
      }
    }
    
    // Sanitize events
    if (span.events && span.events.length > 0) {
      sanitized.events = span.events.map(event => ({
        ...event,
        attributes: event.attributes ? maskSensitiveData(event.attributes) : {},
      }));
    }
    
    return sanitized;
  }
}

export function createSanitizingSpanProcessor(
  processor: SpanProcessor,
  logger?: TelemetryLogger
): SpanProcessor {
  return new SanitizingSpanProcessor(processor, logger);
}