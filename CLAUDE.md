# CLAUDE.md - Monorepo Guide

This file provides guidance to Claude Code (claude.ai/code) when working with this Magic Button Assistant monorepo template.

## Monorepo Structure

This project is organized as a pnpm monorepo with the following structure:

```
/
├── apps/
│   ├── web/                 # Main Next.js web application
│   └── koksmat-companion/   # Developer automation server
├── packages/
│   ├── logger/             # Shared logging utilities
│   ├── telemetry/          # OpenTelemetry configuration
│   ├── config/             # Configuration management
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Common utilities
├── pnpm-workspace.yaml     # Workspace configuration
├── package.json            # Root package with monorepo scripts
└── tsconfig.base.json      # Base TypeScript configuration
```

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

## Migration from Single Repo

This monorepo was migrated from a single repository structure. Key changes:

- Main app moved to `/apps/web`
- Koksmat companion moved to `/apps/koksmat-companion`
- Shared code can be extracted to `/packages/*` as needed
- All dependencies managed centrally through pnpm workspaces
