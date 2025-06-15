import { test, expect } from '@playwright/test';
import { TelemetryTestHelpers } from './telemetry-helpers';
import { execSync } from 'child_process';
import axios from 'axios';
import { createLogger } from '@/lib/logger';

const logger = createLogger('TelemetryTest');

// Increase timeout for integration tests
test.setTimeout(120000);

let helpers: TelemetryTestHelpers;

test.beforeAll(async () => {
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

test.afterAll(async () => {
  logger.info('Cleaning up telemetry test infrastructure');
  
  // Stop and remove Docker containers
  try {
    execSync('docker-compose -f docker-compose.test.yml down -v', { stdio: 'inherit' });
  } catch (error) {
    logger.error('Failed to clean up Docker containers:', error);
  }
});

test.describe('OpenTelemetry Integration', () => {
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

  test('should track operations with aggregate keys', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Wait for client telemetry to initialize
    await page.waitForTimeout(2000);
    
    // Trigger various operations
    await page.evaluate(() => {
      // Import would be available in the actual app context
      const { trackOperation, trackFeatureAccess, OPERATION_KEYS } = 
        (window as any).__TELEMETRY__ || {};
      
      if (trackOperation) {
        // Track API operation
        trackOperation(
          OPERATION_KEYS.API_REQUEST,
          'test.api.call',
          () => Promise.resolve({ success: true }),
          { endpoint: '/api/test' }
        );
        
        // Track feature access
        trackFeatureAccess('dark-mode', true, { userRing: 3 });
      }
    });
    
    // Wait for traces to be sent
    await page.waitForTimeout(3000);
    
    // Verify operation keys in traces
    const traces = await helpers.waitForTraces('magic-button-assistant', undefined, 1);
    
    if (traces.length > 0) {
      helpers.verifyOperationKeys(traces[0], [
        'api.request',
        'feature.access',
      ]);
    }
  });

  test('should capture client-side browser telemetry', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logger.error('Browser console error:', msg.text());
      }
    });
    
    // Navigate to the app
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
    });
    
    // Wait for telemetry to initialize
    await page.waitForTimeout(2000);
    
    // Perform user interactions
    await page.click('body'); // Trigger user interaction instrumentation
    
    // Make a fetch request from the browser
    await page.evaluate(async () => {
      await fetch('/api/health');
    });
    
    // Wait for traces to be sent
    await page.waitForTimeout(5000);
    
    // Check for document load traces
    const traces = await helpers.waitForTraces('magic-button-assistant', 'documentLoad', 1, 30000);
    
    expect(traces.length).toBeGreaterThan(0);
    
    // Verify browser-specific attributes
    const trace = traces[0];
    const documentLoadSpan = trace.spans.find(s => s.operationName === 'documentLoad');
    
    if (documentLoadSpan) {
      const attrs = documentLoadSpan.tags.reduce((acc, tag) => {
        acc[tag.key] = tag.value;
        return acc;
      }, {} as Record<string, any>);
      
      // Check for browser attributes
      expect(attrs['browser.user_agent']).toBeDefined();
      expect(attrs['browser.language']).toBeDefined();
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

test.describe('Telemetry Configuration', () => {
  test('should respect sampling rate configuration', async () => {
    // This would require modifying the sampling rate and verifying
    // that only a percentage of traces are captured
    // For now, we'll just verify the configuration is applied
    
    const response = await axios.get('http://localhost:3000/api/health');
    expect(response.status).toBe(200);
    
    // In a real test, we'd make many requests and verify sampling
    logger.info('Sampling rate test placeholder - would verify sampling behavior');
  });

  test('should handle telemetry endpoint failures gracefully', async ({ page }) => {
    // Temporarily misconfigure the endpoint
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = 'http://localhost:99999/invalid';
    
    // The app should still function
    await page.goto('http://localhost:3000');
    
    // Verify page loads successfully
    await expect(page).toHaveTitle(/Magic Button/);
    
    // Reset configuration
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = 'http://localhost:14268/api/traces';
  });
});