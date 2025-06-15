# Kubernetes Deployment Guide

This project includes automated Kubernetes deployment via GitHub Actions.

## Overview

The deployment system:
- Builds Docker images and pushes to GitHub Container Registry (ghcr.io)
- Deploys to Kubernetes with environment-specific configurations
- Manages secrets securely through GitHub Secrets
- Supports multiple environments and branch-based deployments

## Deployment Naming Convention

Deployments are named by combining:
- GitHub organization name
- Repository name
- Branch name (omitted for main branch)

Examples:
- `main` branch: `myorg-myrepo`
- `feature/auth` branch: `myorg-myrepo-feature-auth`

## Prerequisites

1. **Kubernetes Cluster**: Access to a K8s cluster with kubectl configured
2. **GitHub Repository**: With Actions enabled
3. **Container Registry**: Using GitHub Container Registry (ghcr.io)

## Setup

### 1. Configure GitHub Variables and Secrets

Run the setup script:
```bash
./scripts/k8s-env-setup.sh
```

Or manually set in GitHub repository settings:

**Variables** (Settings > Secrets and variables > Actions > Variables):
- `K8S_NAMESPACE`: Target Kubernetes namespace
- `REPLICAS`: Number of pod replicas (default: 2)
- `APP_URL`: Full application URL
- `INGRESS_HOST`: Hostname for ingress (optional)
- `NEXT_PUBLIC_AZURE_AD_CLIENT_ID`: Azure AD client ID
- `NEXT_PUBLIC_AZURE_AD_TENANT_ID`: Azure AD tenant ID
- `NEXT_PUBLIC_AZURE_AD_REDIRECT_URI`: OAuth redirect URI
- `NEXT_PUBLIC_LOG_LEVEL`: Client-side log level
- `LOG_LEVEL`: Server-side log level
- `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`: OpenTelemetry traces endpoint
- `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`: OpenTelemetry metrics endpoint
- `OTEL_SAMPLING_RATE`: Trace sampling rate (0.0-1.0)

**Secrets** (Settings > Secrets and variables > Actions > Secrets):
- `KUBECONFIG`: Base64-encoded kubeconfig file
- `ANTHROPIC_API_KEY`: Anthropic API key
- `SESSION_SECRET`: Session encryption secret (min 32 chars)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `OTEL_EXPORTER_OTLP_HEADERS`: Optional OTLP headers (JSON)

### 2. Prepare Kubeconfig

Encode your kubeconfig file:
```bash
cat ~/.kube/config | base64 | pbcopy  # macOS
cat ~/.kube/config | base64 | xclip -selection clipboard  # Linux
```

Add as `KUBECONFIG` secret in GitHub.

### 3. Configure Next.js for Standalone Output

Ensure `next.config.js` includes:
```javascript
module.exports = {
  output: 'standalone',
  // ... other config
}
```

## Deployment

### Automatic Deployment

Pushes to these branches trigger automatic deployment:
- `main`
- `develop`
- `feature/**`
- `release/**`

### Manual Deployment

Via GitHub CLI:
```bash
gh workflow run build-deploy-k8s.yml
```

Via GitHub UI:
Actions > Build and Deploy to Kubernetes > Run workflow

## Kubernetes Resources

The deployment creates:

1. **Secret**: Contains sensitive environment variables
2. **ConfigMap**: Contains non-sensitive configuration
3. **Deployment**: Manages pod replicas with health checks
4. **Service**: Internal load balancer
5. **Ingress**: External HTTPS access (if INGRESS_HOST is set)

## Health Checks

The application must implement `/api/health` endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok' }, { status: 200 })
}
```

## Monitoring

View deployment status:
```bash
kubectl get deployments -n YOUR_NAMESPACE
kubectl get pods -n YOUR_NAMESPACE
kubectl logs -n YOUR_NAMESPACE -l app=YOUR_DEPLOYMENT_NAME
```

## Troubleshooting

### Common Issues

1. **Image Pull Errors**: Check registry credentials
2. **Health Check Failures**: Verify `/api/health` endpoint
3. **Environment Variables**: Check ConfigMap and Secret values
4. **Resource Limits**: Adjust memory/CPU in deployment.yaml

### Debug Commands

```bash
# View pod events
kubectl describe pod POD_NAME -n NAMESPACE

# Check logs
kubectl logs POD_NAME -n NAMESPACE

# Get secret values (base64 encoded)
kubectl get secret DEPLOYMENT_NAME-secrets -n NAMESPACE -o yaml

# Port forward for local testing
kubectl port-forward deployment/DEPLOYMENT_NAME 3000:3000 -n NAMESPACE
```

## Rollback

To rollback a deployment:
```bash
kubectl rollout undo deployment/DEPLOYMENT_NAME -n NAMESPACE
```

## Cleanup

To remove all resources:
```bash
kubectl delete deployment,service,ingress,configmap,secret -l app=DEPLOYMENT_NAME -n NAMESPACE
```