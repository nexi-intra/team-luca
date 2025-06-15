# Magic Button Assistant Template

A Next.js template for creating specialized Magic Button Assistant applications.

## Features

- **Next.js 14** with App Router
- **OpenTelemetry** instrumentation for observability
- **shadcn/ui** components for beautiful UI
- **Azure AD authentication** with MSAL
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Claude AI** integration ready

## Getting Started

### 1. Clone and Setup

```bash
# Copy this template to your new project
cp -r assistants/template assistants/your-project-name
cd assistants/your-project-name

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env.local
```

Fill in your environment variables:

- `NEXT_PUBLIC_AZURE_AD_CLIENT_ID`: Your Azure AD app registration client ID
- `NEXT_PUBLIC_AZURE_AD_TENANT_ID`: Your Azure AD tenant ID
- `ANTHROPIC_API_KEY`: Your Anthropic Claude API key
- `SESSION_SECRET`: A random string for session security

### 3. Customize for Your Use Case

Replace "XXX" throughout the codebase with your specific use case:

1. **Update package.json**: Change the name field
2. **Update app/layout.tsx**: Modify title and description
3. **Update app/page.tsx**: Customize the homepage content
4. **Add your specific components**: Create specialized UI for your domain

### 4. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Homepage
│   └── providers.tsx     # Context providers
├── components/
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── auth/             # Authentication logic
│   └── utils.ts          # Utility functions
├── hooks/                # Custom React hooks
├── public/               # Static assets
├── instrumentation.ts    # OpenTelemetry setup
└── package.json
```

## Customization Guide

### Adding Domain-Specific Features

1. **Create specialized components** in `/components`
2. **Add API routes** in `/app/api`
3. **Implement custom hooks** in `/hooks`
4. **Add domain logic** in `/lib`

### Integrating with Claude AI

The template is ready for Claude integration. Add your API routes and streaming logic:

```typescript
// app/api/chat/route.ts
import { anthropic } from '@anthropic-ai/sdk';

export async function POST(req: Request) {
  // Your Claude integration here
}
```

### Authentication

The template includes Azure AD authentication via MSAL. Users must authenticate before accessing the application.

### Observability

OpenTelemetry is pre-configured for:
- **Traces**: HTTP requests, database calls
- **Metrics**: Custom application metrics
- **Logs**: Structured logging

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type checking

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

1. Make changes specific to your use case
2. Test thoroughly
3. Update documentation as needed

## License

This template is part of the Magic Button Cloud project.