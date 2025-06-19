# White-labeling Guide

This template is designed to be easily white-labeled while maintaining the ability to pull updates from the upstream repository. All customization is centralized in the `/config/whitelabel.ts` file.

## Quick Start

1. **Fork this repository**
2. **Edit `/config/whitelabel.ts`** with your branding and configuration
3. **Add your assets** to the `/public` directory (logos, favicons, etc.)
4. **Build and deploy** your customized application

## Configuration Structure

### Branding
```typescript
branding: {
  appName: 'Your App Name',
  appNameShort: 'Short Name',
  companyName: 'Your Company',
  tagline: 'Your tagline here',
  logo: {
    light: '/your-logo-light.svg',
    dark: '/your-logo-dark.svg',
    favicon: '/favicon.ico',
  },
  colors: {
    primary: '#yourcolor',
    primaryDark: '#darker',
    primaryLight: '#lighter',
    accent: '#accent',
  },
}
```

### Features
Control which features are enabled:
```typescript
features: {
  auth: {
    azure: true,    // Azure AD authentication
    google: false,  // Coming soon
    github: false,  // Coming soon
  },
  ai: {
    provider: 'anthropic',
    modelName: 'Claude 3 Opus',
  },
  telemetry: {
    enabled: true,
    serviceName: 'your-service-name',
  },
}
```

### Routes
Enable/disable specific routes:
```typescript
routes: {
  home: true,
  dashboard: true,
  docs: true,
  settings: true,
  accessibility: true,
  magicbutton: false, // Disable demo section in production
}
```

### Content
Customize landing page and footer content:
```typescript
content: {
  landing: {
    hero: {
      title: 'Welcome to {appName}',
      subtitle: '{tagline}',
    },
    features: [
      // Your custom features
    ],
  },
  footer: {
    copyright: '© {year} {companyName}',
    links: [
      // Your footer links
    ],
  },
}
```

## Template Variables

The following variables can be used in content strings and will be automatically replaced:
- `{appName}` - Your application name
- `{appNameShort}` - Short version of app name
- `{companyName}` - Your company name
- `{tagline}` - Your tagline
- `{year}` - Current year

## Pulling Updates

To pull updates from the upstream repository while keeping your customizations:

```bash
# Add upstream remote (one time only)
git remote add upstream https://github.com/magicbutton/nextjs-template.git

# Fetch and merge updates
git fetch upstream
git merge upstream/main

# Resolve conflicts (usually only in whitelabel.ts)
# Your customizations in whitelabel.ts should be preserved
```

## Best Practices

1. **Keep customizations in whitelabel.ts** - This makes merging updates easier
2. **Use the template variables** - They automatically update throughout the app
3. **Add custom components in separate directories** - Avoid modifying core components
4. **Document your customizations** - Add comments in whitelabel.ts for your team

## Advanced Customization

### Adding Custom Pages
Create new pages in the `/app` directory. They will automatically use your whitelabel configuration.

### Custom Components
Create custom components that use the whitelabel configuration:

```typescript
import { useBranding } from '@/components/providers/WhitelabelProvider';

export function MyComponent() {
  const branding = useBranding();
  
  return (
    <div>
      <h1>{branding.appName}</h1>
      <p style={{ color: branding.colors.primary }}>
        Custom content
      </p>
    </div>
  );
}
```

### Environment-Specific Configuration
You can extend the whitelabel configuration to support different environments:

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

export const whitelabel = {
  branding: {
    appName: isDevelopment ? 'Dev - My App' : 'My App',
    // ...
  },
  // ...
};
```

## Troubleshooting

### Merge Conflicts
Most merge conflicts will occur in `/config/whitelabel.ts`. To resolve:
1. Keep your custom configuration
2. Add any new configuration options from upstream
3. Test thoroughly after merging

### Missing Features
If a new feature from upstream isn't working:
1. Check if it requires new configuration in `whitelabel.ts`
2. Ensure all required dependencies are installed
3. Check the upstream changelog for breaking changes

## Support

For issues with the template itself, please check the [upstream repository](https://github.com/magicbutton/nextjs-template).

For issues with your white-labeled version, refer to your internal documentation.