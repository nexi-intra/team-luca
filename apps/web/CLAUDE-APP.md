# CLAUDE-APP.md

This file provides guidance to Claude Code (claude.ai/code) when working with the web app in this Magic Button Assistant monorepo template.

## Template Overview

This is a Magic Button Assistant template for creating specialized AI assistants using:

- **Framework**: Next.js 15 with App Router
- **UI**: React 19, TypeScript, Tailwind CSS, shadcn/ui components
- **Authentication**: Custom OAuth 2.0 + PKCE implementation for Microsoft Entra ID (supports popup and redirect flows)
- **AI**: Anthropic Claude API integration ready
- **Observability**: OpenTelemetry instrumentation included
- **Package Manager**: pnpm (required)

## Authentication Providers

The template supports multiple authentication providers configured via the `AUTH_PROVIDER` environment variable:

### 1. No Authentication (`AUTH_PROVIDER=none`)

- Disables authentication completely
- User menu in sidebar is hidden
- All users have access without sign-in
- Useful for internal tools or development

### 2. Microsoft Entra ID (`AUTH_PROVIDER=entraid`) - Default

- OAuth 2.0 + PKCE flow with Microsoft identity platform
- Supports both popup and redirect flows
- Automatic token refresh
- Requires: `NEXT_PUBLIC_AUTH_CLIENT_ID`, `NEXT_PUBLIC_AUTH_AUTHORITY`, `SESSION_SECRET`

### 3. Supabase (`AUTH_PROVIDER=supabase`)

- Uses Supabase Auth for authentication
- Supports multiple identity providers via Supabase
- Real-time auth state synchronization
- Requires: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SESSION_SECRET`

## Commands

### Development

```bash
pnpm run dev          # Start development server on http://localhost:2803
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
import logger from "@/lib/logger";
// or create a namespaced logger
import { createLogger } from "@/lib/logger";
const logger = createLogger("MyComponent");

// Log messages
logger.verbose("Detailed debug info");
logger.info("General information");
logger.warn("Warning message");
logger.error("Error occurred", error);
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
import {
  trackOperation,
  trackApiCall,
  trackFeatureAccess,
  OPERATION_KEYS,
} from "@/lib/telemetry";

// Track custom operations
await trackOperation(
  OPERATION_KEYS.API_REQUEST,
  "user.profile.fetch",
  async () => {
    return await fetchUserProfile();
  },
  { userId: user.id },
);

// Track API calls
await trackApiCall(
  "POST",
  "/api/users",
  async () => {
    return await createUser(data);
  },
  { userId: currentUser.id },
);

// Track feature access
trackFeatureAccess("dark-mode", hasAccess, {
  userRing: currentRing,
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

## Context Providers

The template uses a comprehensive provider hierarchy to manage global state and features. All providers are configured in `/app/providers.tsx`:

### Provider Hierarchy (Order Matters)

1. **WhitelabelProvider** - Provides white-label configuration across the app
2. **AuthProviderWrapper** - Wraps authentication logic for Microsoft Entra ID
3. **SessionProvider** - Manages user session state
4. **FeatureRingProvider** - Controls feature flags and gradual rollouts (default ring: 4)
5. **DemoProvider** - Manages demo mode state
6. **ThemeProvider** - Next.js themes for dark/light mode support
7. **AccessibilityProvider** - Accessibility preferences and settings
8. **AnnounceProvider** - Screen reader announcements
9. **LanguageProvider** - Internationalization support
10. **BreadcrumbProvider** - Navigation breadcrumb state
11. **CommandPaletteProvider** - Command palette (Cmd+K) functionality
12. **AuthCallbackHandler** - Handles OAuth callbacks

### Using Context Providers

#### Authentication Context

```typescript
import { useAuth } from "@/lib/auth/custom-auth-context";

const { user, isAuthenticated, signIn, signOut } = useAuth();
```

#### Session Context

```typescript
import { useSession } from "@/lib/auth/session-context";

const { session, checkSession } = useSession();
```

#### Feature Flags

```typescript
import { useFeatureRing } from "@/lib/features";

const { currentRing, hasFeatureAccess } = useFeatureRing();
const canUseFeature = hasFeatureAccess("new-feature", 3); // Ring 3 and above
```

#### Theme

```typescript
import { useTheme } from "next-themes";

const { theme, setTheme } = useTheme();
```

#### Demo Mode

```typescript
import { useDemo } from "@/lib/demo/context";

const { isDemoMode, toggleDemoMode } = useDemo();
```

#### Language/i18n

```typescript
import { useLanguage } from "@/lib/i18n";

const { language, setLanguage, t } = useLanguage();
```

#### Command Palette

```typescript
import { useCommandPalette } from "@/lib/command/context";

const { isOpen, setIsOpen, registerCommand } = useCommandPalette();
```

#### Accessibility

```typescript
import { useAccessibility } from "@/lib/accessibility/context";

const { reducedMotion, highContrast, fontSize } = useAccessibility();
```

#### Breadcrumbs

```typescript
import { useBreadcrumb } from "@/lib/breadcrumb/context";

const { breadcrumbs, addBreadcrumb } = useBreadcrumb();
```

### Global Components

The following components are rendered globally through the provider hierarchy:

- **CommandPalette** - Global command palette (Cmd+K)
- **ReauthNotification** - Shows when re-authentication is needed
- **AccessibilityToolbar** - Accessibility settings toolbar
- **Toaster** - Toast notifications (via sonner)
- **DevPanel** - Development tools panel (dev mode only)

## Customization Instructions

When creating a new Magic Button Assistant from this template:

### 1. Use the White-label Configuration

- Edit `/config/whitelabel.ts` with your branding and settings
- Add your logos and assets to `/public`
- The configuration automatically updates throughout the app
- See `WHITELABEL.md` for detailed customization guide

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

## Component Organization Strategy

Components are organized based on their scope and usage:

### 1. Shared UI Components (`/components/ui`)

- **Location**: `/components/ui`
- **Content**: shadcn/ui components and other shared UI primitives
- **Rule**: Keep all shadcn/ui components here, do NOT move to route groups

### 2. Route Group Components

- **Location**: `/app/(app)/components` and `/app/(magicbutton)/components`
- **Content**: Components specific to each route group
- **Rule**: Components used only within a route group should live in that group's components folder
- **Examples**:
  - Components used only in (app) routes → `/app/(app)/components`
  - Components used only in (magicbutton) routes → `/app/(magicbutton)/components`

### 3. Global Components (`/components`)

- **Location**: `/components`
- **Content**: Components used across multiple route groups or globally
- **Examples**: `theme-toggle`, `language-selector`, `cookie-consent`, `auth/*`, `accessibility/*`

### When Adding New Components

1. **First ask**: Is this a shadcn/ui component? → Keep in `/components/ui`
2. **Second ask**: Is this specific to one route group? → Place in `/app/(route-group)/components`
3. **Otherwise**: Place in `/components` for global usage

### Import Paths

- Route group components: `@/app/(route-group)/components/ComponentName`
- Global components: `@/components/ComponentName`
- UI components: `@/components/ui/component-name`

## Configuration Factory

The template uses a type-safe configuration factory pattern for managing all application settings:

### Key Features

- **Type Safety**: Full TypeScript support with auto-completion
- **Validation**: Built-in validation for all configuration values
- **Feature Rings**: Gradual rollout support (Internal → Beta → GA → Public)
- **Metadata**: Each config includes name, description, and examples
- **Categories**: Organized into Authentication, API, Telemetry, General, Features

### Usage

```typescript
import { config } from "@/lib/config";

// Get configuration values
const clientId = config.get("auth.clientId");
const apiKey = config.getRequired("api.anthropicKey");
const scopes = config.getOrDefault("auth.scopes", ["openid"]);

// Get with metadata
const { value, name, description } = config.getWithMetadata("auth.clientId");

// Check if config exists
if (config.has("telemetry.enabled")) {
  // ...
}

// Get configs by feature ring
const betaConfigs = config.getByFeatureRing("beta");

// Validate all required configs
const validationErrors = config.validate();
```

### Configuration Categories

- **Authentication** (`auth.*`): OAuth, session, and security settings
- **API** (`api.*`): External service keys and endpoints
- **Telemetry** (`telemetry.*`): Observability and monitoring
- **General** (`general.*`): App-wide settings like URLs and names
- **Features** (`features.*`): Feature flags and toggles

### Adding New Configuration

1. Update `/lib/config/schema.ts` with your new config
2. Add corresponding environment variable mapping in `/lib/config/providers/env-provider.ts`
3. Use the config throughout the app with full type safety

Example:

```typescript
// In schema.ts
myFeature: {
  enabled: {
    value: false,
    name: 'My Feature Toggle',
    description: 'Enables the new experimental feature',
    featureRing: FeatureRing.Beta,
    required: false,
    defaultValue: false
  }
}
```

## Environment Variables Required

```
# Authentication Provider (Required)
AUTH_PROVIDER                  # Authentication provider: none, entraid, or supabase (default: entraid)

# Microsoft Entra ID Authentication (Required when AUTH_PROVIDER=entraid)
NEXT_PUBLIC_AUTH_CLIENT_ID      # Microsoft Entra ID client ID
NEXT_PUBLIC_AUTH_AUTHORITY      # Authority URL (tenant-specific or common)
SESSION_SECRET                  # Session encryption key (min 32 chars)

# Microsoft Entra ID Authentication (Optional)
NEXT_PUBLIC_AUTH_REDIRECT_URI   # OAuth redirect URI
NEXT_PUBLIC_AUTH_POST_LOGOUT_REDIRECT_URI  # Post-logout redirect

# Supabase Authentication (Required when AUTH_PROVIDER=supabase)
NEXT_PUBLIC_SUPABASE_URL       # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Your Supabase anonymous/public key
SESSION_SECRET                  # Session encryption key (min 32 chars)

# API Keys (Required)
ANTHROPIC_API_KEY              # Claude AI API key

# General (Required)
NEXT_PUBLIC_APP_URL            # Application base URL

# Telemetry (Optional)
OTEL_SERVICE_NAME              # Service name for tracing
OTEL_SERVICE_VERSION           # Service version
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT  # Traces endpoint
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT # Metrics endpoint
OTEL_SAMPLING_RATE             # Sampling rate (0.0-1.0)

# Development (Optional)
NEXT_PUBLIC_KOKSMAT_COMPANION_URL  # Companion server URL (default: http://localhost:2512)
LOG_LEVEL                      # Server-side log level
NEXT_PUBLIC_LOG_LEVEL          # Client-side log level
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
