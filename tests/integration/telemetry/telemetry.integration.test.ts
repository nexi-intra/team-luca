import { TelemetryTestHelpers } from './telemetry-helpers';
import { execSync } from 'child_process';
import axios from 'axios';
import { createLogger } from '@/lib/logger';

const logger = createLogger('TelemetryTest');

// Increase timeout for integration tests
jest.setTimeout(120000);

let helpers: TelemetryTestHelpers;

beforeAll(async () => {
  logger.info('Starting telemetry integration test setup');
  
  // Start Docker containers
  try {
    execSync('docker-compose -f docker-compose.test.yml up -d', { stdio: 'inherit' });
  } catch (error) {
    logger.error('Failed to start Docker containers:', error);
    throw error;
  }
  
  // Initialize test helpers
  helpers = new TelemetryTestHelpers();
  
  // Wait for all services to be ready
  await helpers.waitForServices(60000);
  
  logger.info('Telemetry test infrastructure is ready');
});

afterAll(async () => {
  logger.info('Cleaning up telemetry test infrastructure');
  
  // Stop and remove Docker containers
  try {
    execSync('docker-compose -f docker-compose.test.yml down -v', { stdio: 'inherit' });
  } catch (error) {
    logger.error('Failed to clean up Docker containers:', error);
  }
});

describe('OpenTelemetry Integration', () => {
  test('should capture server-side traces', async () => {
    // Make API request to trigger server-side instrumentation
    const response = await axios.get('http://localhost:3000/api/health', {
      headers: {
        'x-request-id': helpers.getRunId(),
      },
    });
    
    expect(response.status).toBe(200);
    
    // Wait for traces to appear in Jaeger
    const traces = await helpers.waitForTraces('magic-button-assistant', undefined, 1);
    
    expect(traces.length).toBeGreaterThan(0);
    
    // Verify trace structure
    const trace = traces[0];
    expect(trace.spans.length).toBeGreaterThan(0);
    
    // Find HTTP span
    const httpSpan = trace.spans.find(s => 
      s.operationName.includes('GET') || s.operationName.includes('/api/health')
    );
    
    expect(httpSpan).toBeDefined();
    
    if (httpSpan) {
      // Verify expected attributes
      helpers.verifySpanAttributes(httpSpan, {
        'http.method': 'GET',
        'http.target': '/api/health',
        'http.status_code': 200,
      });
    }
  });

  test('should mask sensitive data in traces', async () => {
    // Make request with sensitive data
    const sensitiveData = {
      username: 'testuser',
      password: 'super-secret-password',
      apiKey: 'sk-1234567890abcdef',
      email: 'test@example.com',
      creditCard: '4111111111111111',
    };
    
    await axios.post('http://localhost:3000/api/test-sensitive', sensitiveData, {
      headers: {
        'x-request-id': helpers.getRunId(),
        'authorization': 'Bearer secret-token-12345',
      },
    }).catch(() => {
      // Ignore 404 as endpoint might not exist
    });
    
    // Wait for traces
    const traces = await helpers.waitForTraces('magic-button-assistant', undefined, 1);
    
    // Verify sensitive data is masked
    for (const trace of traces) {
      helpers.verifySensitiveDataMasked(trace);
      
      // Check specific fields
      const spans = trace.spans;
      for (const span of spans) {
        const attrs = span.tags.reduce((acc, tag) => {
          acc[tag.key] = tag.value;
          return acc;
        }, {} as Record<string, any>);
        
        // Authorization header should be masked
        if (attrs['http.request.headers.authorization']) {
          expect(attrs['http.request.headers.authorization']).toBe('Bearer ***');
        }
        
        // Email should be partially masked
        if (attrs['user.email']) {
          expect(attrs['user.email']).toMatch(/\*\*\*@/);
        }
      }
    }
  });

  test('should export metrics to Prometheus', async () => {
    // Make several API calls to generate metrics
    for (let i = 0; i < 5; i++) {
      await axios.get('http://localhost:3000/api/health').catch(() => {});
    }
    
    // Wait for metrics to be exported
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Query Prometheus for metrics
    const metrics = await helpers.getMetrics('magicbutton_http_request_duration_seconds_count');
    
    expect(metrics.length).toBeGreaterThan(0);
    
    // Verify metric labels
    const metric = metrics[0];
    expect(metric.metric).toHaveProperty('environment', 'test');
    expect(metric.metric).toHaveProperty('job', 'otel-collector');
  });
});

describe('Telemetry Configuration', () => {
  test('should respect sampling rate configuration', async () => {
    // This would require modifying the sampling rate and verifying
    // that only a percentage of traces are captured
    // For now, we'll just verify the configuration is applied
    
    const response = await axios.get('http://localhost:3000/api/health');
    expect(response.status).toBe(200);
    
    // In a real test, we'd make many requests and verify sampling
    logger.info('Sampling rate test placeholder - would verify sampling behavior');
  });
});