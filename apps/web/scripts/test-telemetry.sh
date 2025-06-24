#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Starting OpenTelemetry Integration Tests"
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Clean up any existing containers
echo "🧹 Cleaning up existing test containers..."
docker-compose -f docker-compose.test.yml down -v 2>/dev/null || true

# Start the telemetry infrastructure
echo "🚀 Starting telemetry infrastructure..."
docker-compose -f docker-compose.test.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
SERVICES=("jaeger:16686" "prometheus:9090" "otel-collector:13133")
ALL_HEALTHY=true

for SERVICE in "${SERVICES[@]}"; do
    IFS=':' read -ra ADDR <<< "$SERVICE"
    SERVICE_NAME=${ADDR[0]}
    PORT=${ADDR[1]}
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT | grep -q "200\|302"; then
        echo -e "${GREEN}✅ $SERVICE_NAME is healthy${NC}"
    else
        echo -e "${RED}❌ $SERVICE_NAME is not responding${NC}"
        ALL_HEALTHY=false
    fi
done

if [ "$ALL_HEALTHY" = false ]; then
    echo -e "${RED}Some services failed to start. Check Docker logs.${NC}"
    docker-compose -f docker-compose.test.yml logs
    exit 1
fi

# Set environment variables for tests
export OTEL_SERVICE_NAME=magic-button-assistant-test
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces
export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://localhost:4318/v1/metrics
export NEXT_PUBLIC_LOG_LEVEL=VERBOSE
export LOG_LEVEL=VERBOSE

# Run the integration tests
echo ""
echo "🧪 Running telemetry integration tests..."
echo "=========================================="

# Create test directory if it doesn't exist
mkdir -p tests/integration/telemetry

# Run tests with Playwright
npm run test:integration -- tests/integration/telemetry/telemetry.integration.test.ts

TEST_EXIT_CODE=$?

# Show Jaeger UI info
echo ""
echo "📊 Telemetry UIs Available:"
echo "  - Jaeger UI: http://localhost:16686"
echo "  - Prometheus: http://localhost:9090"
echo "  - OTel Collector zPages: http://localhost:55679/debug/tracez"

# Ask if user wants to keep services running
echo ""
read -p "Keep services running for manual inspection? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Cleaning up test infrastructure..."
    docker-compose -f docker-compose.test.yml down -v
fi

# Exit with test result code
exit $TEST_EXIT_CODE