# OpenTelemetry Integration Tests

This directory contains integration tests for the OpenTelemetry instrumentation system.

## Overview

The integration tests verify that:
- Traces are properly captured and sent to Jaeger
- Sensitive data is masked in all traces
- Operation keys are correctly applied for aggregation
- Both client-side and server-side telemetry work correctly
- Metrics are exported to Prometheus

## Prerequisites

- Docker and Docker Compose installed
- Node.js and npm installed
- Ports 16686, 14268, 4318, 9090, and 8888 available

## Running Tests

### Quick Start

```bash
# Run all telemetry integration tests
npm run test:telemetry

# Or use the shell script directly
./scripts/test-telemetry.sh
```

### Manual Setup

1. Start the telemetry infrastructure:
```bash
docker-compose -f docker-compose.test.yml up -d
```

2. Run the tests:
```bash
npm run test:integration -- tests/integration/telemetry/telemetry.integration.test.ts
```

3. Clean up:
```bash
docker-compose -f docker-compose.test.yml down -v
```

## Test Infrastructure

The test setup includes:

- **Jaeger**: Distributed tracing backend
  - UI: http://localhost:16686
  - Collector: http://localhost:14268

- **OpenTelemetry Collector**: Receives and processes telemetry data
  - OTLP HTTP: http://localhost:4318
  - Health check: http://localhost:13133
  - zPages: http://localhost:55679

- **Prometheus**: Metrics backend
  - UI: http://localhost:9090

## Test Structure

### `telemetry-helpers.ts`
Helper utilities for:
- Waiting for services to be ready
- Querying Jaeger for traces
- Querying Prometheus for metrics
- Verifying trace attributes
- Checking sensitive data masking

### `telemetry.integration.test.ts`
Integration tests covering:
- Server-side trace capture
- Client-side browser telemetry
- Sensitive data masking
- Operation key tracking
- Metrics export
- Error handling

## Debugging

### View Traces in Jaeger

1. Open http://localhost:16686
2. Select service: `magic-button-assistant`
3. Click "Find Traces"

### View Metrics in Prometheus

1. Open http://localhost:9090
2. Try queries like:
   - `magicbutton_http_request_duration_seconds_count`
   - `up{job="otel-collector"}`

### Check Collector Status

1. Open http://localhost:55679/debug/tracez
2. View active and completed spans

## Environment Variables

The tests use these environment variables:

```bash
OTEL_SERVICE_NAME=magic-button-assistant-test
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://localhost:4318/v1/metrics
OTEL_SAMPLING_RATE=1.0
```

## Troubleshooting

### Services not starting
- Check Docker is running: `docker info`
- Check port conflicts: `lsof -i :16686`
- View logs: `docker-compose -f docker-compose.test.yml logs`

### No traces appearing
- Wait 5-10 seconds for traces to be processed
- Check collector logs: `docker logs nextjs-template_otel-collector_1`
- Verify endpoint configuration in environment variables

### Tests timing out
- Increase timeout in test file: `test.setTimeout(120000)`
- Check network connectivity to Docker containers
- Ensure services are healthy before running tests