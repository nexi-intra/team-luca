#!/bin/bash

# Script to add Docker service environment variables to .env.local

ENV_FILE=".env.local"
ENV_EXAMPLE=".env.example"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up Docker environment variables...${NC}"

# Create .env.local if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}Creating $ENV_FILE...${NC}"
    
    # Copy from .env.example if it exists
    if [ -f "$ENV_EXAMPLE" ]; then
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        echo -e "${GREEN}Copied from $ENV_EXAMPLE${NC}"
    else
        touch "$ENV_FILE"
        echo -e "${GREEN}Created new $ENV_FILE${NC}"
    fi
fi

# Function to add or update environment variable
add_env_var() {
    local key=$1
    local value=$2
    local comment=$3
    
    if grep -q "^${key}=" "$ENV_FILE"; then
        echo -e "${YELLOW}Updating ${key}${NC}"
        sed -i.bak "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
    else
        echo -e "${GREEN}Adding ${key}${NC}"
        echo "" >> "$ENV_FILE"
        [ -n "$comment" ] && echo "# $comment" >> "$ENV_FILE"
        echo "${key}=${value}" >> "$ENV_FILE"
    fi
}

# Add PostgreSQL environment variables
echo -e "\n${GREEN}Adding PostgreSQL configuration...${NC}"
add_env_var "DATABASE_URL" "postgresql://postgres:postgres@localhost:5432/nextjs_template?schema=public" "PostgreSQL connection string"
add_env_var "POSTGRES_USER" "postgres" "PostgreSQL user"
add_env_var "POSTGRES_PASSWORD" "postgres" "PostgreSQL password"
add_env_var "POSTGRES_DB" "nextjs_template" "PostgreSQL database name"

# Add Redis environment variables
echo -e "\n${GREEN}Adding Redis configuration...${NC}"
add_env_var "REDIS_URL" "redis://localhost:6379" "Redis connection string"
add_env_var "REDIS_HOST" "localhost" "Redis host"
add_env_var "REDIS_PORT" "6379" "Redis port"

# Add OpenTelemetry environment variables
echo -e "\n${GREEN}Adding OpenTelemetry configuration...${NC}"
add_env_var "OTEL_SERVICE_NAME" "magic-button-assistant-xxx" "OpenTelemetry service name"
add_env_var "OTEL_SERVICE_VERSION" "1.0.0" "OpenTelemetry service version"
add_env_var "OTEL_EXPORTER_OTLP_TRACES_ENDPOINT" "http://localhost:14268/api/traces" "Jaeger OTLP traces endpoint"
add_env_var "OTEL_EXPORTER_OTLP_METRICS_ENDPOINT" "http://localhost:9464/v1/metrics" "Prometheus metrics endpoint"
add_env_var "OTEL_EXPORTER_OTLP_HEADERS" "{}" "Optional OTLP headers (JSON format)"
add_env_var "OTEL_SAMPLING_RATE" "1.0" "Sampling rate (0.0-1.0)"

# Add Grafana admin password
echo -e "\n${GREEN}Adding Grafana configuration...${NC}"
add_env_var "GRAFANA_ADMIN_PASSWORD" "admin" "Grafana admin password"

# Clean up backup files
rm -f "${ENV_FILE}.bak"

echo -e "\n${GREEN}✅ Environment variables have been added to $ENV_FILE${NC}"
echo -e "${YELLOW}⚠️  Please review and update the values as needed, especially:${NC}"
echo -e "  - PostgreSQL credentials"
echo -e "  - Redis configuration"
echo -e "  - OpenTelemetry service name"
echo -e "  - Grafana admin password"

echo -e "\n${GREEN}To start the Docker services, run:${NC}"
echo -e "  ${YELLOW}docker-compose up -d${NC}"

echo -e "\n${GREEN}Service URLs:${NC}"
echo -e "  - PostgreSQL: localhost:5432"
echo -e "  - Redis: localhost:6379"
echo -e "  - Jaeger UI: http://localhost:16686"
echo -e "  - Prometheus: http://localhost:9090"
echo -e "  - Grafana: http://localhost:3001 (admin/admin)"