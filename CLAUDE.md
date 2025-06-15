# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this Magic Button Assistant template.

## Template Overview

This is a Magic Button Assistant template for creating specialized AI assistants using:
- **Framework**: Next.js 14 with App Router
- **UI**: React 18, TypeScript, Tailwind CSS, shadcn/ui components
- **Authentication**: Microsoft Authentication Library (MSAL) for Azure AD
- **AI**: Anthropic Claude API integration ready
- **Observability**: OpenTelemetry instrumentation included

## Commands

### Development
```bash
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

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
```

## Directory Structure
- `/app` - Next.js App Router pages and layouts
- `/components` - React components including shadcn/ui
- `/lib` - Core utilities (auth, utils)
- `/hooks` - Custom React hooks
- `/public` - Static assets

This template provides the foundation for building specialized Magic Button Assistants with consistent architecture and best practices.