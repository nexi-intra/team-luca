# Configuration Directory

This directory contains the white-label configuration for the application.

## Files

### `whitelabel.ts`
The main configuration file that controls:
- **Branding**: App name, logos, colors, tagline
- **Features**: Which features are enabled (auth providers, AI settings, telemetry)
- **Routes**: Which routes/sections are available
- **Content**: Landing page content, footer links
- **Metadata**: SEO and social media settings

## Usage

1. **For Initial Setup**:
   - Edit `whitelabel.ts` with your branding
   - Add your logo files to `/public`
   - Build and deploy

2. **For Updates**:
   - When pulling updates from upstream, most conflicts will be in this file
   - Keep your customizations and merge any new configuration options

3. **In Components**:
   ```typescript
   import { useBranding } from '@/components/providers/WhitelabelProvider';
   
   const branding = useBranding();
   // Use branding.appName, branding.colors.primary, etc.
   ```

## Best Practices

- Keep all customization in this file to minimize merge conflicts
- Use template variables ({appName}, {tagline}, etc.) in content strings
- Test thoroughly after merging upstream changes
- Document any custom additions to the configuration

## Environment-Specific Config

You can extend the configuration for different environments:

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging';

export const whitelabel = {
  branding: {
    appName: isDevelopment ? 'Dev - My App' : 
             isStaging ? 'Staging - My App' : 
             'My App',
    // ...
  },
};
```