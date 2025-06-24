import { OperationKey } from '../types';
import { TelemetryLogger } from '../interfaces/logger';

// Metrics helper for aggregate data
export class OperationMetrics {
  private static counters = new Map<string, number>();
  private static logger?: TelemetryLogger;
  
  static setLogger(logger: TelemetryLogger): void {
    this.logger = logger;
  }
  
  static increment(operationKey: OperationKey, attributes?: Record<string, any>): void {
    const key = `${operationKey}:${JSON.stringify(attributes || {})}`;
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + 1);
    
    this.logger?.verbose('Operation metric incremented', {
      operation: operationKey,
      count: current + 1,
      attributes,
    });
  }
  
  static getCount(operationKey: OperationKey, attributes?: Record<string, any>): number {
    const key = `${operationKey}:${JSON.stringify(attributes || {})}`;
    return this.counters.get(key) || 0;
  }
  
  static reset(): void {
    this.counters.clear();
  }
  
  static getAll(): Map<string, number> {
    return new Map(this.counters);
  }
}