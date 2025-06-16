import { trace, context, Span, SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { OPERATION_KEYS, OperationKey } from './config';
import { maskSensitiveData } from './masking';
// Import logger without alias
const { createLogger } = require('../logger');

const logger = createLogger('Telemetry:Instrumentation');

// Get tracer based on environment
export function getTracer(name: string) {
  return trace.getTracer(name);
}

// Track operations with aggregate keys
export function trackOperation<T>(
  operationKey: OperationKey,
  operationName: string,
  fn: () => T | Promise<T>,
  attributes?: Record<string, any>
): T | Promise<T> {
  const tracer = getTracer('magic-button-operations');
  
  return tracer.startActiveSpan(
    operationName,
    {
      kind: SpanKind.INTERNAL,
      attributes: {
        'operation.key': operationKey,
        'operation.name': operationName,
        ...maskSensitiveData(attributes || {}),
      },
    },
    async (span) => {
      const startTime = Date.now();
      try {
        const result = await fn();
        
        // Add success metrics
        span.setAttributes({
          'operation.status': 'success',
          'operation.duration_ms': Date.now() - startTime,
        });
        
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        // Add error metrics
        span.setAttributes({
          'operation.status': 'error',
          'operation.error.type': error?.constructor?.name || 'Unknown',
          'operation.error.message': (error as Error)?.message || 'Unknown error',
          'operation.duration_ms': Date.now() - startTime,
        });
        
        span.recordException(error as Error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: (error as Error)?.message,
        });
        
        throw error;
      } finally {
        span.end();
      }
    }
  );
}

// Track API operations
export function trackApiCall<T>(
  method: string,
  endpoint: string,
  fn: () => T | Promise<T>,
  metadata?: {
    userId?: string;
    requestId?: string;
    [key: string]: any;
  }
): T | Promise<T> {
  return trackOperation(
    OPERATION_KEYS.API_REQUEST,
    `${method} ${endpoint}`,
    fn,
    {
      'http.method': method,
      'http.target': endpoint,
      'user.id': metadata?.userId || 'anonymous',
      'request.id': metadata?.requestId,
      ...metadata,
    }
  );
}

// Track feature access
export function trackFeatureAccess(
  featureId: string,
  allowed: boolean,
  metadata?: Record<string, any>
): void {
  const tracer = getTracer('magic-button-features');
  
  tracer.startActiveSpan(
    'feature.access.check',
    {
      kind: SpanKind.INTERNAL,
      attributes: {
        'operation.key': OPERATION_KEYS.FEATURE_ACCESS,
        'feature.id': featureId,
        'feature.access.allowed': allowed,
        ...maskSensitiveData(metadata || {}),
      },
    },
    (span) => {
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
    }
  );
}

// Track UI interactions
export function trackUiInteraction(
  action: string,
  component: string,
  metadata?: Record<string, any>
): void {
  const tracer = getTracer('magic-button-ui');
  
  tracer.startActiveSpan(
    `ui.${action}`,
    {
      kind: SpanKind.INTERNAL,
      attributes: {
        'operation.key': OPERATION_KEYS.UI_INTERACTION,
        'ui.action': action,
        'ui.component': component,
        ...maskSensitiveData(metadata || {}),
      },
    },
    (span) => {
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
    }
  );
}

// Track auth operations
export function trackAuthOperation<T>(
  operation: 'login' | 'logout' | 'refresh' | 'validate',
  fn: () => T | Promise<T>,
  metadata?: {
    authMethod?: string;
    userId?: string;
    [key: string]: any;
  }
): T | Promise<T> {
  const operationKey = {
    login: OPERATION_KEYS.AUTH_LOGIN,
    logout: OPERATION_KEYS.AUTH_LOGOUT,
    refresh: OPERATION_KEYS.AUTH_REFRESH,
    validate: OPERATION_KEYS.AUTH_VALIDATE,
  }[operation];
  
  return trackOperation(
    operationKey,
    `auth.${operation}`,
    fn,
    {
      'auth.method': metadata?.authMethod || 'unknown',
      'user.id': metadata?.userId || 'anonymous',
      ...metadata,
    }
  );
}

// Create a traced version of a function
export function traced<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    name: string;
    operationKey?: OperationKey;
    extractAttributes?: (...args: Parameters<T>) => Record<string, any>;
  }
): T {
  return ((...args: Parameters<T>) => {
    const attributes = options.extractAttributes
      ? options.extractAttributes(...args)
      : {};
    
    if (options.operationKey) {
      return trackOperation(
        options.operationKey,
        options.name,
        () => fn(...args),
        attributes
      );
    }
    
    const tracer = getTracer('magic-button-traced');
    return tracer.startActiveSpan(
      options.name,
      { attributes: maskSensitiveData(attributes) },
      (span) => {
        try {
          const result = fn(...args);
          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.recordException(error as Error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: (error as Error)?.message,
          });
          throw error;
        } finally {
          span.end();
        }
      }
    );
  }) as T;
}

// Metrics helper for aggregate data
export class OperationMetrics {
  private static counters = new Map<string, number>();
  
  static increment(operationKey: OperationKey, attributes?: Record<string, any>): void {
    const key = `${operationKey}:${JSON.stringify(attributes || {})}`;
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + 1);
    
    logger.verbose('Operation metric incremented', {
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
}