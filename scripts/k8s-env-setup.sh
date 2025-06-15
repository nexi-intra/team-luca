#!/bin/bash

# Script to help set up GitHub Variables and Secrets for Kubernetes deployment

set -e

echo "=== GitHub Kubernetes Deployment Setup ==="
echo
echo "This script will guide you through setting up the required GitHub Variables and Secrets"
echo "for deploying to Kubernetes."
echo

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Required GitHub Variables (non-sensitive):${NC}"
echo "  - K8S_NAMESPACE: Kubernetes namespace (e.g., 'production', 'staging')"
echo "  - REPLICAS: Number of pod replicas (default: 2)"
echo "  - APP_URL: Full application URL (e.g., https://app.example.com)"
echo "  - INGRESS_HOST: Hostname for ingress (e.g., app.example.com)"
echo "  - NEXT_PUBLIC_AZURE_AD_CLIENT_ID: Azure AD application client ID"
echo "  - NEXT_PUBLIC_AZURE_AD_TENANT_ID: Azure AD tenant ID"
echo "  - NEXT_PUBLIC_AZURE_AD_REDIRECT_URI: OAuth redirect URI"
echo "  - NEXT_PUBLIC_LOG_LEVEL: Client-side log level (default: INFO)"
echo "  - LOG_LEVEL: Server-side log level (default: INFO)"
echo "  - OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: OpenTelemetry traces endpoint"
echo "  - OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: OpenTelemetry metrics endpoint"
echo "  - OTEL_SAMPLING_RATE: Trace sampling rate (0.0-1.0, default: 1.0)"
echo

echo -e "${YELLOW}Required GitHub Secrets (sensitive):${NC}"
echo "  - KUBECONFIG: Base64-encoded kubeconfig file for cluster access"
echo "  - ANTHROPIC_API_KEY: Anthropic API key for Claude"
echo "  - SESSION_SECRET: Secret for session encryption (min 32 chars)"
echo "  - DATABASE_URL: PostgreSQL connection string"
echo "  - REDIS_URL: Redis connection string"
echo "  - OTEL_EXPORTER_OTLP_HEADERS: Optional OTLP headers as JSON (default: {})"
echo

echo -e "${GREEN}Setting up via GitHub CLI:${NC}"
echo

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}GitHub CLI (gh) is not installed.${NC}"
    echo "Install it from: https://cli.github.com/"
    echo
    echo "Or set these manually in your repository settings:"
    echo "Settings > Secrets and variables > Actions"
    exit 1
fi

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
if [ -z "$REPO" ]; then
    echo -e "${YELLOW}Not in a GitHub repository or not authenticated.${NC}"
    echo "Run 'gh auth login' first, or set variables manually."
    exit 1
fi

echo -e "Repository: ${GREEN}$REPO${NC}"
echo

# Function to set GitHub variable
set_github_var() {
    local name=$1
    local prompt=$2
    local default=$3
    
    echo -e "${BLUE}$name${NC}"
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " value
        value=${value:-$default}
    else
        read -p "$prompt: " value
    fi
    
    if [ -n "$value" ]; then
        gh variable set "$name" --body "$value" --repo "$REPO"
        echo -e "${GREEN}✓ Set $name${NC}"
    else
        echo -e "${YELLOW}⚠ Skipped $name${NC}"
    fi
    echo
}

# Function to set GitHub secret
set_github_secret() {
    local name=$1
    local prompt=$2
    
    echo -e "${YELLOW}$name${NC}"
    read -s -p "$prompt: " value
    echo
    
    if [ -n "$value" ]; then
        echo "$value" | gh secret set "$name" --repo "$REPO"
        echo -e "${GREEN}✓ Set $name${NC}"
    else
        echo -e "${YELLOW}⚠ Skipped $name${NC}"
    fi
    echo
}

# Ask if user wants to proceed
read -p "Do you want to set up GitHub Variables and Secrets now? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo
echo -e "${BLUE}=== Setting GitHub Variables ===${NC}"
echo

set_github_var "K8S_NAMESPACE" "Kubernetes namespace" "default"
set_github_var "REPLICAS" "Number of replicas" "2"
set_github_var "APP_URL" "Full application URL (e.g., https://app.example.com)" ""
set_github_var "INGRESS_HOST" "Ingress hostname (e.g., app.example.com)" ""
set_github_var "NEXT_PUBLIC_AZURE_AD_CLIENT_ID" "Azure AD Client ID" ""
set_github_var "NEXT_PUBLIC_AZURE_AD_TENANT_ID" "Azure AD Tenant ID" ""
set_github_var "NEXT_PUBLIC_AZURE_AD_REDIRECT_URI" "OAuth Redirect URI" ""
set_github_var "NEXT_PUBLIC_LOG_LEVEL" "Client-side log level" "INFO"
set_github_var "LOG_LEVEL" "Server-side log level" "INFO"
set_github_var "OTEL_EXPORTER_OTLP_TRACES_ENDPOINT" "OTLP Traces endpoint" ""
set_github_var "OTEL_EXPORTER_OTLP_METRICS_ENDPOINT" "OTLP Metrics endpoint" ""
set_github_var "OTEL_SAMPLING_RATE" "Sampling rate (0.0-1.0)" "1.0"

echo -e "${YELLOW}=== Setting GitHub Secrets ===${NC}"
echo

# Special handling for KUBECONFIG
echo -e "${YELLOW}KUBECONFIG${NC}"
read -p "Path to kubeconfig file: " kubeconfig_path
if [ -f "$kubeconfig_path" ]; then
    cat "$kubeconfig_path" | base64 | tr -d '\n' | gh secret set KUBECONFIG --repo "$REPO"
    echo -e "${GREEN}✓ Set KUBECONFIG${NC}"
else
    echo -e "${YELLOW}⚠ Skipped KUBECONFIG - file not found${NC}"
fi
echo

set_github_secret "ANTHROPIC_API_KEY" "Anthropic API Key"
set_github_secret "SESSION_SECRET" "Session secret (min 32 chars)"
set_github_secret "DATABASE_URL" "PostgreSQL connection string"
set_github_secret "REDIS_URL" "Redis connection string"
set_github_secret "OTEL_EXPORTER_OTLP_HEADERS" "OTLP Headers JSON (optional, press Enter to skip)"

echo
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo
echo "You can now trigger the deployment workflow:"
echo "  1. Push to main/develop branch for automatic deployment"
echo "  2. Manual trigger: gh workflow run build-deploy-k8s.yml"
echo
echo "To view your settings:"
echo "  Variables: gh variable list --repo $REPO"
echo "  Secrets: gh secret list --repo $REPO"
echo