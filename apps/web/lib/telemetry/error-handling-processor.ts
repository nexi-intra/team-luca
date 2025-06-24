import { Context } from '@opentelemetry/api';
import { SpanProcessor, ReadableSpan, Span } from '@opentelemetry/sdk-trace-base';
// Import logger without alias
const { createLogger } = require('../logger');

const logger = createLogger('Telemetry:ErrorHandler');

export class ErrorHandlingSpanProcessor implements SpanProcessor {
  private errorCount = 0;
  private lastErrorTime = 0;
  private readonly maxErrorsPerMinute = 5;
  
  constructor(private readonly processor: SpanProcessor) {}

  forceFlush(): Promise<void> {
    return this.handleErrors(() => this.processor.forceFlush());
  }

  onStart(span: Span, parentContext: Context): void {
    try {
      this.processor.onStart(span, parentContext);
    } catch (error) {
      this.logError('Error in onStart', error);
    }
  }

  onEnd(span: ReadableSpan): void {
    try {
      this.processor.onEnd(span);
    } catch (error) {
      this.logError('Error in onEnd', error);
    }
  }

  shutdown(): Promise<void> {
    return this.handleErrors(() => this.processor.shutdown());
  }

  private async handleErrors<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.logError('Error in span processor', error);
      // Return resolved promise to prevent cascading failures
      return Promise.resolve() as any;
    }
  }

  private logError(message: string, error: any): void {
    const now = Date.now();
    
    // Reset counter if more than a minute has passed
    if (now - this.lastErrorTime > 60000) {
      this.errorCount = 0;
    }
    
    this.errorCount++;
    this.lastErrorTime = now;
    
    // Only log first few errors per minute to avoid spam
    if (this.errorCount <= this.maxErrorsPerMinute) {
      if (error?.code === 'ECONNREFUSED') {
        if (this.errorCount === 1) {
          logger.warn(`OpenTelemetry collector not available at ${error.address || 'configured endpoint'}. Traces will be dropped.`);
        }
      } else {
        logger.error(message, error);
      }
      
      if (this.errorCount === this.maxErrorsPerMinute) {
        logger.warn('Suppressing further telemetry errors for the next minute');
      }
    }
  }
}

export function createErrorHandlingProcessor(processor: SpanProcessor): SpanProcessor {
  return new ErrorHandlingSpanProcessor(processor);
}