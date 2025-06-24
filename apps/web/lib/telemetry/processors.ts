import { SpanProcessor } from "@opentelemetry/sdk-trace-base";
import { createSanitizingSpanProcessor as createBaseSanitizingSpanProcessor } from "@monorepo/telemetry";
import { createLogger } from "../logger";

const logger = createLogger("Telemetry:Processor");

// Re-export the base processor with our logger
export { SanitizingSpanProcessor } from "@monorepo/telemetry";

export function createSanitizingSpanProcessor(
  processor: SpanProcessor,
): SpanProcessor {
  return createBaseSanitizingSpanProcessor(processor as any, logger) as any;
}
