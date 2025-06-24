// Re-export all instrumentation utilities from the telemetry package
export * from "@monorepo/telemetry";

// Also set up the logger for metrics
import { OperationMetrics } from "@monorepo/telemetry";
import { createLogger } from "../logger";

const logger = createLogger("Telemetry:Instrumentation");

// Initialize metrics with our logger
OperationMetrics.setLogger(logger);
