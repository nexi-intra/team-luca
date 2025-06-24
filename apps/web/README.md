# Next.js Enterprise Template

A production-ready Next.js template with authentication, feature flags, and comprehensive testing infrastructure.

## Features

- 🔐 **Azure AD Authentication** - Enterprise-ready authentication with MSAL
- 🚀 **Feature Flags** - Ring-based feature deployment (Ring 1-4)
- 🧪 **Testing Infrastructure** - Unit & E2E tests with factories and DI
- 📊 **OpenTelemetry** - Built-in observability and monitoring
- 🎨 **UI Components** - Shadcn/ui with Tailwind CSS
- 🌙 **Dark Mode** - Theme switching support
- 📝 **TypeScript** - Full type safety
- 🔧 **Developer Experience** - ESLint, Prettier, hot reload
- 🤖 **Claude AI Ready** - Anthropic integration prepared

## Quick Start

### Use this template

Click the "Use this template" button above or use the GitHub CLI:

```bash
gh repo create my-app --template magicbutton/nextjs-template
```

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/your-username/your-app.git
cd your-app
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Configure your Microsoft Entra ID application and update `.env.local`:

```env
NEXT_PUBLIC_AUTH_CLIENT_ID=your-client-id
NEXT_PUBLIC_AUTH_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
NEXT_PUBLIC_AUTH_REDIRECT_URI=http://localhost:2803
NEXT_PUBLIC_AUTH_POST_LOGOUT_URI=http://localhost:2803
NEXT_PUBLIC_APP_URL=http://localhost:2803
ANTHROPIC_API_KEY=your-api-key  # Optional
SESSION_SECRET=your-secret-key
```

5. Run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

### Optional: Koksmat Companion

The template includes a Koksmat Companion server for developer automation:

1. Install companion dependencies:

```bash
pnpm run koksmat:install
```

2. Start the companion server (in a separate terminal):

```bash
pnpm run koksmat:dev  # Development mode with hot reload
# or
pnpm run koksmat      # Production mode
```

The companion integrates with the DevPanel and provides script automation capabilities.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   └── features/         # Feature components
├── lib/                   # Core utilities
│   ├── auth/             # Authentication logic
│   ├── features/         # Feature flag system
│   ├── di/               # Dependency injection
│   └── demo/             # Demo mode utilities
├── hooks/                 # Custom React hooks
├── tests/                 # Test infrastructure
│   ├── factories/        # Test data factories
├── koksmat-companion/     # Developer automation server
│   ├── scripts/          # Automation scripts
│   ├── lib/              # Server utilities
│   └── routes/           # API routes
│   ├── e2e/              # Playwright E2E tests
│   └── utils/            # Test utilities
└── public/               # Static assets
```

## Feature Ring System

The template includes a ring-based feature deployment system:

- **Ring 1**: Experimental features (high risk)
- **Ring 2**: Preview features (medium risk)
- **Ring 3**: Beta features (low risk)
- **Ring 4**: Stable features (production ready)

### Using Feature Gates

```tsx
import { FeatureGate } from "@/components/features/FeatureGate";

<FeatureGate featureId="experimental-chat">
  <ExperimentalChat />
</FeatureGate>;
```

### Defining Features

Edit `lib/features/constants.ts`:

```typescript
export const FEATURES = {
  MY_FEATURE: {
    id: "my-feature",
    name: "My Feature",
    description: "Description of my feature",
    ring: 2, // Preview feature
    category: "UI",
  },
};
```

## Testing

### Unit Tests

```bash
npm run test:unit              # Run all unit tests
npm run test:unit:watch        # Watch mode
npm run test:unit:coverage     # Coverage report
```

### E2E Tests

```bash
npm run test:e2e              # Run all E2E tests
npm run test:e2e:ui           # Playwright UI mode
npm run test:e2e:headed       # Run in headed browser
```

### Test Factories

Create test data using factories:

```typescript
import { factories } from "@/tests/factories";

const user = await factories.user.admin().create();
const features = await factories.feature.experimental().createMany(5);
```

## Authentication

The template uses Azure AD for authentication. Users must authenticate to access the application.

### Demo Mode

For development without Azure AD:

1. Set `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local`
2. Use the demo login button on the homepage

## Deployment

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmagicbutton%2Fnextjs-template)

### Environment Variables

Configure these in your deployment platform:

- `NEXT_PUBLIC_AZURE_AD_CLIENT_ID`
- `NEXT_PUBLIC_AZURE_AD_TENANT_ID`
- `NEXT_PUBLIC_AZURE_AD_REDIRECT_URI`
- `NEXT_PUBLIC_APP_URL`
- `SESSION_SECRET`
- `ANTHROPIC_API_KEY` (optional)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type checking
- `npm test` - Run all tests

## Customization Guide

### 1. Update Branding

- Replace "XXX" placeholders in `package.json` and `app/layout.tsx`
- Update `public/` assets with your branding
- Customize theme in `app/globals.css`

### 2. Add Features

- Create new components in `/components`
- Add API routes in `/app/api`
- Implement business logic in `/lib`

### 3. Configure Authentication

- Set up your Azure AD application
- Update redirect URIs for your domains
- Configure authentication scopes as needed

## Contributing

This is a template repository. To contribute to the template itself:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: [docs.magicbutton.cloud](https://docs.magicbutton.cloud)
- Issues: [GitHub Issues](https://github.com/magicbutton/nextjs-template/issues)
- Discussions: [GitHub Discussions](https://github.com/magicbutton/nextjs-template/discussions)
