# CLAUDE.md - Magic Button Assistant Monorepo Template

This file provides guidance to Claude Code (claude.ai/code) when working with this **Magic Button Assistant monorepo template**.

## Template Overview

This is a **template repository** for creating Magic Button Assistant applications. When using this template:

- **Replace placeholder content** with your specific application logic
- **Keep the monorepo structure** for scalability and code organization
- **Follow the established patterns** for consistency

## Monorepo Structure

This template is organized as a pnpm monorepo with clear separation of concerns:

```
/
├── apps/                    # APPLICATION CODE GOES HERE
│   ├── web/                 # Main Next.js web application (YOUR FRONTEND)
│   │   ├── src/            # Replace with your app components
│   │   ├── public/         # Your static assets
│   │   └── ...             # Your app-specific config
│   └── koksmat-companion/   # Developer automation server (BACKEND TOOLS)
│       ├── src/            # Your automation scripts
│       └── ...             # Your tool configurations
├── packages/                # SHARED CODE GOES HERE
│   ├── logger/             # Shared logging utilities
│   ├── telemetry/          # OpenTelemetry configuration
│   ├── config/             # Configuration management
│   ├── types/              # Shared TypeScript types (ADD YOUR TYPES)
│   └── utils/              # Common utilities (ADD YOUR UTILS)
├── pnpm-workspace.yaml     # Workspace configuration (DO NOT MODIFY)
├── package.json            # Root package with monorepo scripts
└── tsconfig.base.json      # Base TypeScript configuration
```

### Where to Put Your Code

| Code Type | Location | Example |
|-----------|----------|---------|
| Frontend components | `/apps/web/src/components/` | `Button.tsx`, `Dashboard.tsx` |
| API routes | `/apps/web/src/app/api/` | `route.ts` files |
| Backend automation | `/apps/koksmat-companion/src/` | Scripts, tools, automations |
| Shared types | `/packages/types/src/` | `user.ts`, `api.ts` |
| Shared utilities | `/packages/utils/src/` | `formatters.ts`, `validators.ts` |
| Configuration | `/packages/config/src/` | Environment-specific configs |
| New shared package | `/packages/[name]/` | Create new package as needed |

## Monorepo Commands

From the root directory:

```bash
# Install all dependencies
pnpm install

# Development
pnpm dev                    # Run all apps in parallel
pnpm dev:web               # Run only the web app
pnpm dev:companion         # Run only koksmat-companion

# Building
pnpm build                 # Build all apps
pnpm build:web            # Build only the web app
pnpm build:packages       # Build all packages

# Testing
pnpm test                  # Run all tests
pnpm test:unit            # Run unit tests
pnpm test:e2e             # Run e2e tests (web app only)

# Code Quality
pnpm lint                  # Lint all code
pnpm typecheck            # Type check all code
pnpm format               # Format all code
pnpm format:check         # Check code formatting
```

## Working with Workspaces

### Adding Dependencies

To add a dependency to a specific workspace:

```bash
# Add to web app
pnpm --filter @monorepo/web add <package>

# Add to koksmat-companion
pnpm --filter @monorepo/koksmat-companion add <package>

# Add to a shared package
pnpm --filter @monorepo/logger add <package>

# Add dev dependency
pnpm --filter @monorepo/web add -D <package>
```

### Using Shared Packages

In any app, you can import from shared packages:

```typescript
import { logger } from "@monorepo/logger";
import { trackOperation } from "@monorepo/telemetry";
import { config } from "@monorepo/config";
import type { User } from "@monorepo/types";
```

## Package Development

When creating new shared packages:

1. Create the package directory: `mkdir packages/my-package`
2. Add a `package.json` with:
   - `"name": "@monorepo/my-package"`
   - `"main": "./src/index.ts"`
   - `"types": "./src/index.ts"`
3. Create `tsconfig.json` extending the base config
4. Create `src/index.ts` as the entry point
5. Add the package to consuming apps' dependencies using workspace protocol:
   ```json
   "@monorepo/my-package": "workspace:*"
   ```

## Important Notes

1. **Always run commands from the root** unless specifically working on a single app
2. **Use workspace protocol** (`workspace:*`) for internal dependencies
3. **Shared packages use TypeScript source** directly (no build step required for development)
4. **The web app has its own CLAUDE-APP.md** with app-specific guidance
5. **Git worktrees** are configured as requested - use `git worktree add -b <branchname> ../<branchname>` for new branches

## Using This Template

### Quick Start

1. **Clone/fork this template** for your new project
2. **Update package names** in all `package.json` files to match your project
3. **Replace template content** in `/apps/web` with your application
4. **Add your shared code** to appropriate packages
5. **Customize koksmat-companion** for your automation needs

### Best Practices

- **Apps contain application logic** - Put UI, API routes, and app-specific code here
- **Packages contain shared code** - Extract reusable logic, types, and utilities
- **Use TypeScript everywhere** - The template is fully typed for better DX
- **Follow the monorepo patterns** - Consistency makes maintenance easier

### Template Customization Points

| What to Customize | Where | Notes |
|-------------------|--------|-------|
| App name/branding | `/apps/web/package.json`, app metadata | Update name, description |
| API endpoints | `/apps/web/src/app/api/` | Add your routes |
| UI components | `/apps/web/src/components/` | Replace with your UI |
| Automation tools | `/apps/koksmat-companion/` | Add your scripts |
| Shared types | `/packages/types/src/` | Define your domain types |
| Environment config | `/packages/config/` | Add your env variables |
