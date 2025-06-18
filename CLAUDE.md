# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this Magic Button Assistant template.

## Template Overview

This is a Magic Button Assistant template for creating specialized AI assistants using:
- **Framework**: Next.js 14 with App Router
- **UI**: React 18, TypeScript, Tailwind CSS, shadcn/ui components
- **Authentication**: Microsoft Authentication Library (MSAL) for Azure AD
- **AI**: Anthropic Claude API integration ready
- **Observability**: OpenTelemetry instrumentation included
- **Package Manager**: pnpm (required)

## Commands

### Development
```bash
pnpm run dev          # Start development server on http://localhost:3000
pnpm run build        # Build for production
pnpm run start        # Start production server
pnpm run lint         # Run ESLint
pnpm run typecheck    # TypeScript type checking
```

### Koksmat Companion (Developer Automation)
```bash
pnpm run koksmat:install   # Install companion dependencies
pnpm run koksmat:dev       # Start companion in dev mode (with hot reload)
pnpm run koksmat           # Start companion in production mode
```

## Logging

The template includes a comprehensive logging system with configurable levels:

### Log Levels
- **VERBOSE**: Detailed debug information (level 0)
- **INFO**: General information (level 1, default)
- **WARN**: Warning messages (level 2)
- **ERROR**: Error messages only (level 3)
- **NONE**: Disable all logging (level 4)

### Configuration
Set log levels via environment variables:
```bash
# Client-side logging
NEXT_PUBLIC_LOG_LEVEL=INFO

# Server-side logging
LOG_LEVEL=INFO
```

### Usage
```typescript
import logger from '@/lib/logger';
// or create a namespaced logger
import { createLogger } from '@/lib/logger';
const logger = createLogger('MyComponent');

// Log messages
logger.verbose('Detailed debug info');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error occurred', error);
```

## OpenTelemetry Instrumentation

The template includes comprehensive OpenTelemetry instrumentation for both client and server-side tracing:

### Features
- **Automatic instrumentation** for HTTP requests, database queries, and more
- **Sensitive data masking** to prevent leaking secrets in traces
- **Operation tracking** with aggregate keys for metrics
- **Client-side tracing** for user interactions and page loads
- **Server-side tracing** for API calls and backend operations

### Configuration
Configure via environment variables:
```bash
OTEL_SERVICE_NAME=magic-button-assistant-xxx
OTEL_SERVICE_VERSION=1.0.0
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:14268/api/traces
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://localhost:9464/v1/metrics
OTEL_EXPORTER_OTLP_HEADERS={}
OTEL_SAMPLING_RATE=1.0  # Sample rate (0.0-1.0)
```

### Usage
```typescript
import { trackOperation, trackApiCall, trackFeatureAccess, OPERATION_KEYS } from '@/lib/telemetry';

// Track custom operations
await trackOperation(
  OPERATION_KEYS.API_REQUEST,
  'user.profile.fetch',
  async () => {
    return await fetchUserProfile();
  },
  { userId: user.id }
);

// Track API calls
await trackApiCall('POST', '/api/users', async () => {
  return await createUser(data);
}, { userId: currentUser.id });

// Track feature access
trackFeatureAccess('dark-mode', hasAccess, { 
  userRing: currentRing 
});
```

### Operation Keys
Pre-defined aggregate keys for common operations:
- `api.request`, `api.response`, `api.error`
- `auth.login`, `auth.logout`, `auth.refresh`, `auth.validate`
- `feature.access`, `feature.toggle`
- `ui.interaction`, `ui.navigation`, `ui.render`
- `db.query`, `cache.hit`, `cache.miss`
- `system.health`, `system.error`

### Data Protection
The telemetry system automatically:
- Masks sensitive fields (passwords, tokens, API keys)
- Sanitizes URLs to remove sensitive query parameters
- Removes forbidden headers (authorization, cookies)
- Redacts email addresses and phone numbers

## Customization Instructions

When creating a new Magic Button Assistant from this template:

### 1. Replace "XXX" placeholder
- Update `package.json` name field
- Modify `app/layout.tsx` title and description
- Customize `app/page.tsx` content
- Update environment variable `OTEL_SERVICE_NAME`

### 2. Add domain-specific features
- Create specialized components in `/components`
- Add API routes in `/app/api` for Claude integration
- Implement custom hooks in `/hooks`
- Add domain logic in `/lib`

### 3. Configure for specific use case
- Set up domain-specific prompts
- Add specialized UI components
- Configure authentication scopes if needed
- Add custom middleware or API routes

## Key Design Decisions
1. **Template-based**: Easy to clone and customize for different use cases
2. **OpenTelemetry Ready**: Full observability stack included
3. **Authentication Required**: MSAL integration for secure access
4. **AI-Ready**: Structured for easy Claude API integration
5. **Scalable**: Built on Next.js App Router for performance

## Environment Variables Required
```
NEXT_PUBLIC_AZURE_AD_CLIENT_ID
NEXT_PUBLIC_AZURE_AD_TENANT_ID
NEXT_PUBLIC_AZURE_AD_REDIRECT_URI
ANTHROPIC_API_KEY
SESSION_SECRET
NEXT_PUBLIC_APP_URL
OTEL_SERVICE_NAME (optional)
NEXT_PUBLIC_KOKSMAT_COMPANION_URL (optional, defaults to http://localhost:2512)
```

## Directory Structure
- `/app` - Next.js App Router pages and layouts
- `/components` - React components including shadcn/ui
- `/lib` - Core utilities (auth, utils)
- `/hooks` - Custom React hooks
- `/public` - Static assets
- `/koksmat-companion` - Developer automation server (optional)

## Koksmat Companion

The template includes an optional Koksmat Companion server for developer automation:

- **Purpose**: Provides script execution and automation capabilities
- **Integration**: Automatically integrates with DevPanel when running
- **Port**: Runs on port 2512 by default
- **Features**: 
  - Real-time script execution with WebSocket support
  - Script output streaming
  - Connection status monitoring in DevPanel
  - HTTP REST API and Socket.IO communication

To use the companion:
1. Install dependencies: `pnpm run koksmat:install`
2. Start the server: `pnpm run koksmat:dev` (development) or `pnpm run koksmat` (production)
3. View status in DevPanel (floating Magic Button icon in development mode)

This template provides the foundation for building specialized Magic Button Assistants with consistent architecture and best practices.