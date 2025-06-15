# Docker Development Environment

This project includes a comprehensive Docker Compose setup with the following services:

## Services

### 🗄️ PostgreSQL
- **Port**: 5432
- **Database**: nextjs_template
- **Credentials**: postgres/postgres (configurable)

### 🚀 Redis
- **Port**: 6379
- **Purpose**: Caching and session storage

### 📊 OpenTelemetry Stack
- **Jaeger**: Distributed tracing UI at http://localhost:16686
- **OpenTelemetry Collector**: Receives and processes telemetry data
- **Prometheus**: Metrics storage at http://localhost:9090
- **Grafana**: Visualization dashboards at http://localhost:3001 (admin/admin)

## Quick Start

1. **Set up environment variables**:
   ```bash
   ./scripts/setup-docker-env.sh
   ```

2. **Start all services**:
   ```bash
   docker-compose up -d
   ```

3. **Verify services are running**:
   ```bash
   docker-compose ps
   ```

4. **View logs**:
   ```bash
   docker-compose logs -f [service-name]
   ```

## Service URLs

- **PostgreSQL**: `postgresql://postgres:postgres@localhost:5432/nextjs_template`
- **Redis**: `redis://localhost:6379`
- **Jaeger UI**: http://localhost:16686
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **OTEL Collector Health**: http://localhost:13133

## Useful Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# View specific service logs
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f jaeger

# Access PostgreSQL shell
docker-compose exec postgres psql -U postgres -d nextjs_template

# Access Redis CLI
docker-compose exec redis redis-cli

# Restart a specific service
docker-compose restart [service-name]
```

## Troubleshooting

### Port conflicts
If you get port conflict errors, you can change the exposed ports in `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Change left number to use different host port
```

### Memory issues
The OpenTelemetry collector has a memory limiter configured. If you need more memory, adjust in `otel-collector-config.yaml`:
```yaml
memory_limiter:
  limit_mib: 1024  # Increase this value
```

### Connection issues
Make sure your application uses `localhost` when connecting from the host machine, or use service names (e.g., `postgres`, `redis`) when connecting from within Docker containers.