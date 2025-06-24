import { createLogger } from '@/lib/logger';

const logger = createLogger('SimpleTelemetryTest');

async function runTest() {
  logger.info('Starting simple telemetry test');
  
  // Set correct endpoints
  process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = 'http://localhost:4318/v1/traces';
  process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'http://localhost:4318/v1/metrics';
  
  try {
    // 1. Check services are running
    logger.info('Checking services...');
    
    const services = {
      'Next.js App': 'http://localhost:2803',
      'Jaeger': 'http://localhost:16686',
      'OTel Collector': 'http://localhost:13133',
      'Prometheus': 'http://localhost:9090/-/ready',
    };
    
    for (const [name, url] of Object.entries(services)) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
        logger.info(`✅ ${name} is healthy (${response.status})`);
      } catch (error: any) {
        logger.error(`❌ ${name} is not responding: ${error.message}`);
      }
    }
    
    // 2. Make test API calls
    logger.info('\nMaking test API calls...');
    
    // Health check
    const healthResponse = await fetch('http://localhost:2803/api/health', {
      headers: { 'x-request-id': `test-${Date.now()}` }
    });
    logger.info(`Health API response: ${healthResponse.status}`);
    
    // Sensitive data test
    const sensitiveResponse = await fetch('http://localhost:2803/api/test-sensitive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-request-id': `test-sensitive-${Date.now()}`,
        'authorization': 'Bearer test-token-12345'
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'secret123',
        email: 'test@example.com',
        apiKey: 'sk-1234567890',
      })
    });
    logger.info(`Sensitive API response: ${sensitiveResponse.status}`);
    
    // 3. Wait for traces to be processed
    logger.info('\nWaiting for traces to be processed...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 4. Query Jaeger for traces
    logger.info('\nQuerying Jaeger for traces...');
    const params = new URLSearchParams({
      service: 'magic-button-assistant',
      limit: '10',
      lookback: '1h',
    });
    const tracesResponse = await fetch(`http://localhost:16686/api/traces?${params}`);
    const tracesData = await tracesResponse.json();
    
    const traces = tracesData.data || [];
    logger.info(`Found ${traces.length} traces in Jaeger`);
    
    if (traces.length > 0) {
      logger.info('\n✅ Telemetry integration is working!');
      logger.info('You can view traces at: http://localhost:16686');
      logger.info('You can view metrics at: http://localhost:9090');
    } else {
      logger.warn('\n⚠️  No traces found yet. They may still be processing.');
    }
    
  } catch (error) {
    logger.error('Test failed:', error);
  }
}

// Run the test
runTest();