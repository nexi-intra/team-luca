import { SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { createErrorHandlingProcessor as createBaseErrorHandlingProcessor } from '@monorepo/telemetry';
import { createLogger } from '../logger';

const logger = createLogger('Telemetry:ErrorHandler');

// Re-export the base processor with our logger
export { ErrorHandlingSpanProcessor } from '@monorepo/telemetry';

export function createErrorHandlingProcessor(processor: SpanProcessor): SpanProcessor {
  return createBaseErrorHandlingProcessor(processor as any, logger) as any;
}