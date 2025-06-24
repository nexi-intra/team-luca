# Configuration Factory Pattern Documentation

This document explains the configuration factory pattern implemented in the Magic Button Assistant template, which provides a type-safe, validated, and feature-ring-aware configuration system.

## Overview

The configuration factory pattern provides a centralized, type-safe way to manage application configuration with the following benefits:

- **Type Safety**: Full TypeScript support with strongly-typed configuration values
- **Validation**: Built-in validation for configuration values
- **Feature Rings**: Gradual feature rollout support
- **Metadata**: Rich metadata for each configuration value
- **Multiple Providers**: Support for different configuration sources (environment variables, files, memory)
- **Developer Experience**: IntelliSense support and clear error messages

## Architecture

### Core Components

1. **ConfigFactory** (`/lib/config/factory.ts`)
   - Singleton factory for creating configuration providers
   - Supports multiple provider types (currently: env, with memory and file planned)
   - Caches provider instances for performance

2. **IConfigProvider Interface** (`/lib/config/types.ts`)
   - Defines the contract for configuration providers
   - Methods for getting values, validation, and filtering by feature ring/category

3. **EnvConfigProvider** (`/lib/config/providers/env-provider.ts`)
   - Default provider that reads from environment variables
   - Handles type conversion and validation
   - Maps configuration paths to environment variable names

4. **Configuration Schema** (`/lib/config/schema.ts`)
   - Defines all configuration values with metadata
   - Includes validation rules, defaults, and examples
   - Organized by categories: auth, api, general, telemetry, features, runtime, integrations

## Configuration Structure

### ConfigValue Type

Each configuration value includes:

```typescript
interface ConfigValue<T> {
  value: T; // The actual value
  name: string; // User-friendly name
  description: string; // Detailed description
  featureRing: FeatureRing; // When this becomes available
  required: boolean; // Is this required?
  defaultValue?: T; // Default if not provided
  example?: string; // Example for documentation
  validate?: (value: T) => boolean | string; // Validation function
}
```

### Feature Rings

Configuration values are associated with feature rings for gradual rollout:

- `Internal`: Internal testing only
- `Beta`: Early adopters and beta testers
- `GA`: General availability
- `Public`: Available to all users

### Configuration Categories

- `Authentication`: OAuth/MSAL settings
- `API`: External service keys
- `General`: App-wide settings
- `Telemetry`: Monitoring and logging
- `Features`: Feature flags
- `Runtime`: Runtime environment settings
- `Integrations`: External service URLs

## Usage

### Basic Usage

```typescript
import { config } from "@/lib/config";

// Get a value (returns undefined if not found)
const clientId = config.get<string>("auth.clientId");

// Get with default fallback
const port = config.getOrDefault("general.port", 3000);

// Get required value (throws if not found)
const apiKey = config.getRequired<string>("api.anthropicKey");

// Check if configuration exists
if (config.has("telemetry.tracesEndpoint")) {
  // Enable telemetry
}
```

### Advanced Usage

```typescript
// Get value with metadata
const authConfig = config.getWithMetadata("auth.clientId");
console.log(authConfig?.name); // "Client ID"
console.log(authConfig?.description); // "Microsoft Entra ID application..."
console.log(authConfig?.featureRing); // "GA"

// Validate all required configurations
const { valid, errors } = config.validate();
if (!valid) {
  console.error("Configuration errors:", errors);
}

// Get configurations by feature ring
const betaConfigs = config.getByFeatureRing(FeatureRing.Beta);

// Get configurations by category
const authConfigs = config.getByCategory(ConfigCategory.Authentication);
```

### Environment Variable Mapping

The system automatically maps configuration paths to environment variables:

| Config Path                | Environment Variable         |
| -------------------------- | ---------------------------- |
| `auth.clientId`            | `NEXT_PUBLIC_AUTH_CLIENT_ID` |
| `auth.sessionSecret`       | `SESSION_SECRET`             |
| `api.anthropicKey`         | `ANTHROPIC_API_KEY`          |
| `general.appUrl`           | `NEXT_PUBLIC_APP_URL`        |
| `telemetry.serviceName`    | `OTEL_SERVICE_NAME`          |
| `features.enableTelemetry` | `ENABLE_TELEMETRY`           |

## Adding New Configuration

### 1. Update the TypeScript Types

Add to `/lib/config/types.ts`:

```typescript
export interface AppConfig {
  // ... existing sections ...

  mySection: {
    myNewConfig: ConfigValue<string>;
  };
}
```

### 2. Define the Schema

Add to `/lib/config/schema.ts`:

```typescript
export const CONFIG_SCHEMA: AppConfig = {
  // ... existing config ...

  mySection: {
    myNewConfig: {
      value: "",
      name: "My New Configuration",
      description: "Description of what this does",
      featureRing: FeatureRing.GA,
      required: true,
      example: "example-value",
      validate: (value) => value.length > 0 || "Cannot be empty",
    },
  },
};
```

### 3. Map Environment Variable

Add to `/lib/config/providers/env-provider.ts`:

```typescript
const ENV_MAPPING: Record<string, string> = {
  // ... existing mappings ...
  "mySection.myNewConfig": "MY_NEW_CONFIG_ENV_VAR",
};
```

### 4. Update Provider Loading

Ensure the provider loads your section in `loadConfiguration()`:

```typescript
this.loadConfigSection(config.mySection, "mySection");
```

## Validation

The configuration system includes built-in validation:

```typescript
// In schema definition
validate: (value) => {
  // Return true for valid
  if (isValid(value)) return true;

  // Return error message for invalid
  return "Error message explaining the issue";
};
```

Common validation patterns:

```typescript
// UUID validation
validate: (value) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value) || "Must be a valid UUID";
};

// URL validation
validate: (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return "Must be a valid URL";
  }
};

// Range validation
validate: (value) => (value >= 0 && value <= 1) || "Must be between 0 and 1";
```

## Testing

The template includes test factories for creating test data:

### Base Factory Pattern

```typescript
// /tests/factories/base.factory.ts
export abstract class BaseFactory<T, P = Partial<T>> {
  protected abstract getDefaults(): T;

  async create(overrides?: P): Promise<T>;
  build(overrides?: P): T;
  async createMany(count: number, overrides?: P): Promise<T[]>;
  buildMany(count: number, overrides?: P): T[];

  // Create named states for common variations
  state(name: string, overrides: P): this;
}
```

### Example Test Factory

```typescript
// /tests/factories/user.factory.ts
export class UserFactory extends BaseFactory<User> {
  protected getDefaults(): User {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      role: "user",
      // ... other defaults
    };
  }

  // Named states for common variations
  admin(): this {
    return this.state("admin", { role: "admin" });
  }
}

// Usage in tests
const user = await userFactory.create();
const admin = await userFactory.admin().create();
const users = await userFactory.createMany(5);
```

## Best Practices

1. **Always Use Type Parameters**: Specify the expected type when getting values

   ```typescript
   config.get<string>("auth.clientId"); // ✓ Good
   config.get("auth.clientId"); // ✗ Avoid
   ```

2. **Handle Missing Values**: Use appropriate methods based on requirements

   ```typescript
   // Optional value
   const endpoint = config.get("telemetry.endpoint");

   // With fallback
   const port = config.getOrDefault("general.port", 3000);

   // Required (will throw)
   const apiKey = config.getRequired("api.anthropicKey");
   ```

3. **Validate Early**: Run validation during application startup

   ```typescript
   const { valid, errors } = config.validate();
   if (!valid) {
     throw new Error(`Configuration errors: ${errors.join(", ")}`);
   }
   ```

4. **Use Feature Rings**: Associate new features with appropriate rings

   ```typescript
   featureRing: FeatureRing.Beta; // Start in beta
   ```

5. **Provide Good Defaults**: Include sensible defaults where possible

   ```typescript
   defaultValue: "http://localhost:3000";
   ```

6. **Write Clear Descriptions**: Help developers understand each setting
   ```typescript
   description: "OAuth redirect URI for authentication callbacks";
   ```

## Future Enhancements

The factory pattern is designed to support additional providers:

- **Memory Provider**: For testing and dynamic configuration
- **File Provider**: For JSON/YAML configuration files
- **Remote Provider**: For configuration servers
- **Composite Provider**: Combining multiple sources with precedence

These can be added without changing the existing API, maintaining backward compatibility.
