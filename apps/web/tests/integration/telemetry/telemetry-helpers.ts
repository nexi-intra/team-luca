import axios from 'axios';
import { createLogger } from '@monorepo/logger';

const logger = createLogger('TelemetryTest:Helpers');

const JAEGER_API_BASE = 'http://localhost:16686/api';
const PROMETHEUS_API_BASE = 'http://localhost:9090/api/v1';
const RETRY_DELAY = 1000;
const MAX_RETRIES = 30;

export interface JaegerTrace {
  traceID: string;
  spans: JaegerSpan[];
  processes: Record<string, JaegerProcess>;
}

export interface JaegerSpan {
  traceID: string;
  spanID: string;
  operationName: string;
  startTime: number;
  duration: number;
  tags: Array<{ key: string; value: any }>;
  logs: Array<{ timestamp: number; fields: Array<{ key: string; value: any }> }>;
  process: string;
}

export interface JaegerProcess {
  serviceName: string;
  tags: Array<{ key: string; value: any }>;
}

export interface PrometheusMetric {
  metric: Record<string, string>;
  values: Array<[number, string]>;
}

export class TelemetryTestHelpers {
  private runId: string;

  constructor() {
    this.runId = `test-run-${Date.now()}`;
  }

  async waitForServices(timeout = 60000): Promise<void> {
    const services = [
      { name: 'Jaeger', url: 'http://localhost:16686' },
      { name: 'Prometheus', url: 'http://localhost:9090/-/ready' },
      { name: 'OTEL Collector', url: 'http://localhost:13133' },
    ];

    const endTime = Date.now() + timeout;

    for (const service of services) {
      logger.info(`Waiting for ${service.name} to be ready...`);
      
      while (Date.now() < endTime) {
        try {
          await axios.get(service.url, { timeout: 1000 });
          logger.info(`${service.name} is ready`);
          break;
        } catch (error) {
          await this.sleep(1000);
        }
      }
      
      if (Date.now() >= endTime) {
        throw new Error(`${service.name} failed to start within ${timeout}ms`);
      }
    }
  }

  async waitForTraces(
    serviceName: string,
    operationName?: string,
    minCount = 1,
    timeout = 30000
  ): Promise<JaegerTrace[]> {
    const endTime = Date.now() + timeout;
    
    while (Date.now() < endTime) {
      const traces = await this.getTraces(serviceName, operationName);
      
      if (traces.length >= minCount) {
        logger.info(`Found ${traces.length} traces for ${serviceName}`);
        return traces;
      }
      
      logger.verbose(`Waiting for traces... Current count: ${traces.length}`);
      await this.sleep(RETRY_DELAY);
    }
    
    throw new Error(
      `Timeout waiting for ${minCount} traces. Service: ${serviceName}, Operation: ${operationName}`
    );
  }

  async getTraces(serviceName: string, operationName?: string): Promise<JaegerTrace[]> {
    try {
      const params: any = {
        service: serviceName,
        limit: 100,
        lookback: '1h',
      };
      
      if (operationName) {
        params.operation = operationName;
      }
      
      const response = await axios.get(`${JAEGER_API_BASE}/traces`, { params });
      return response.data.data || [];
    } catch (error) {
      logger.error('Failed to get traces:', error);
      return [];
    }
  }

  async getMetrics(metricName: string): Promise<PrometheusMetric[]> {
    try {
      const response = await axios.get(`${PROMETHEUS_API_BASE}/query`, {
        params: {
          query: metricName,
        },
      });
      
      if (response.data.status === 'success' && response.data.data.result) {
        return response.data.data.result;
      }
      
      return [];
    } catch (error) {
      logger.error('Failed to get metrics:', error);
      return [];
    }
  }

  verifySpanAttributes(span: JaegerSpan, expectedAttributes: Record<string, any>): void {
    const attributes = this.getSpanAttributes(span);
    
    for (const [key, value] of Object.entries(expectedAttributes)) {
      if (!(key in attributes)) {
        throw new Error(`Missing attribute: ${key}`);
      }
      
      if (attributes[key] !== value) {
        throw new Error(
          `Attribute mismatch for ${key}. Expected: ${value}, Got: ${attributes[key]}`
        );
      }
    }
  }

  verifySensitiveDataMasked(trace: JaegerTrace): void {
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /apikey/i,
      /authorization/i,
    ];
    
    for (const span of trace.spans) {
      const attributes = this.getSpanAttributes(span);
      
      for (const [key, value] of Object.entries(attributes)) {
        // Check if key contains sensitive pattern
        const isSensitiveKey = sensitivePatterns.some(pattern => pattern.test(key));
        
        if (isSensitiveKey && typeof value === 'string') {
          // Value should be masked
          if (!value.includes('***') && value !== 'REDACTED') {
            throw new Error(
              `Sensitive field '${key}' not properly masked. Value: ${value}`
            );
          }
        }
        
        // Check for exposed secrets in values
        if (typeof value === 'string' && value.length > 20) {
          const looksLikeSecret = /^[a-zA-Z0-9_-]{32,}$/.test(value);
          if (looksLikeSecret) {
            throw new Error(
              `Potential exposed secret in field '${key}'. Value: ${value.substring(0, 10)}...`
            );
          }
        }
      }
    }
  }

  verifyOperationKeys(trace: JaegerTrace, expectedKeys: string[]): void {
    const foundKeys = new Set<string>();
    
    for (const span of trace.spans) {
      const attributes = this.getSpanAttributes(span);
      const operationKey = attributes['operation.key'];
      
      if (operationKey) {
        foundKeys.add(operationKey);
      }
    }
    
    for (const expectedKey of expectedKeys) {
      if (!foundKeys.has(expectedKey)) {
        throw new Error(`Missing operation key: ${expectedKey}`);
      }
    }
  }

  private getSpanAttributes(span: JaegerSpan): Record<string, any> {
    const attributes: Record<string, any> = {};
    
    if (span.tags) {
      for (const tag of span.tags) {
        attributes[tag.key] = tag.value;
      }
    }
    
    return attributes;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getRunId(): string {
    return this.runId;
  }
}