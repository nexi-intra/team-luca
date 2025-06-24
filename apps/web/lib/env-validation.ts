import { createLogger } from '@monorepo/logger';
import chalk from 'chalk';

const logger = createLogger('EnvValidation');

interface EnvVariable {
  key: string;
  required: boolean;
  description: string;
  example?: string;
  validator?: (value: string) => boolean;
  category: string;
}

// Define all environment variables with their requirements
const ENV_SCHEMA: EnvVariable[] = [
  // Authentication
  {
    key: 'NEXT_PUBLIC_AUTH_CLIENT_ID',
    required: true,
    description: 'Microsoft Entra ID application (client) ID',
    example: '9f441c8f-7365-43bc-bb37-a8075043d1b1',
    category: 'Authentication',
    validator: (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value),
  },
  {
    key: 'NEXT_PUBLIC_AUTH_AUTHORITY',
    required: true,
    description: 'Microsoft identity platform authority URL',
    example: 'https://login.microsoftonline.com/your-tenant-id',
    category: 'Authentication',
    validator: (value) => value.startsWith('https://login.microsoftonline.com/'),
  },
  {
    key: 'SESSION_SECRET',
    required: true,
    description: 'Secret key for session encryption (min 32 chars)',
    category: 'Authentication',
    validator: (value) => value.length >= 32,
  },
  
  // App Configuration
  {
    key: 'NEXT_PUBLIC_APP_URL',
    required: true,
    description: 'Base URL of your application',
    example: 'http://localhost:2803',
    category: 'Application',
    validator: (value) => /^https?:\/\/.+/.test(value),
  },
  
  // API Keys
  {
    key: 'ANTHROPIC_API_KEY',
    required: false,
    description: 'Claude AI API key for AI features',
    example: 'sk-ant-api03-...',
    category: 'API Keys',
  },
  
  // Database
  {
    key: 'DATABASE_URL',
    required: false,
    description: 'PostgreSQL connection string',
    example: 'postgresql://user:password@localhost:5432/dbname',
    category: 'Database',
  },
  
  // Redis
  {
    key: 'REDIS_URL',
    required: false,
    description: 'Redis connection string for caching',
    example: 'redis://localhost:6379',
    category: 'Cache',
  },
  
  // OpenTelemetry
  {
    key: 'OTEL_SERVICE_NAME',
    required: false,
    description: 'Service name for OpenTelemetry',
    example: 'magic-button-assistant',
    category: 'Telemetry',
  },
  {
    key: 'OTEL_EXPORTER_OTLP_TRACES_ENDPOINT',
    required: false,
    description: 'OpenTelemetry traces endpoint',
    example: 'http://localhost:14268/api/traces',
    category: 'Telemetry',
  },
];

export function validateEnvironment(): void {
  // Only run in development
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.log('\n' + chalk.blue('🔍 Validating environment variables...\n'));

  const missingRequired: EnvVariable[] = [];
  const missingOptional: EnvVariable[] = [];
  const invalidValues: Array<{ variable: EnvVariable; value: string; reason: string }> = [];
  const validCount = { required: 0, optional: 0 };

  // Group variables by category
  const byCategory = ENV_SCHEMA.reduce((acc, variable) => {
    if (!acc[variable.category]) {
      acc[variable.category] = [];
    }
    acc[variable.category].push(variable);
    return acc;
  }, {} as Record<string, EnvVariable[]>);

  // Check each category
  Object.entries(byCategory).forEach(([category, variables]) => {
    console.log(chalk.cyan(`${category}:`));
    
    variables.forEach((variable) => {
      const value = process.env[variable.key];
      const exists = value !== undefined && value !== '';
      
      if (!exists) {
        if (variable.required) {
          missingRequired.push(variable);
          console.log(chalk.red(`  ✗ ${variable.key} - Missing (Required)`));
        } else {
          missingOptional.push(variable);
          console.log(chalk.yellow(`  ⚠ ${variable.key} - Not set (Optional)`));
        }
      } else {
        // Validate the value if validator exists
        if (variable.validator && !variable.validator(value)) {
          invalidValues.push({
            variable,
            value: value.substring(0, 20) + (value.length > 20 ? '...' : ''),
            reason: 'Invalid format',
          });
          console.log(chalk.red(`  ✗ ${variable.key} - Invalid value`));
        } else {
          if (variable.required) {
            validCount.required++;
          } else {
            validCount.optional++;
          }
          console.log(chalk.green(`  ✓ ${variable.key} - Set`));
        }
      }
    });
    console.log('');
  });

  // Summary
  console.log(chalk.blue('Summary:'));
  console.log(`  Required: ${chalk.green(validCount.required)}/${ENV_SCHEMA.filter(v => v.required).length} set`);
  console.log(`  Optional: ${chalk.green(validCount.optional)}/${ENV_SCHEMA.filter(v => !v.required).length} set`);
  
  // Show detailed errors for missing required variables
  if (missingRequired.length > 0) {
    console.log('\n' + chalk.red('❌ Missing required environment variables:'));
    missingRequired.forEach((variable) => {
      console.log(chalk.red(`\n  ${variable.key}`));
      console.log(chalk.gray(`    Description: ${variable.description}`));
      if (variable.example) {
        console.log(chalk.gray(`    Example: ${variable.example}`));
      }
    });
  }

  // Show invalid values
  if (invalidValues.length > 0) {
    console.log('\n' + chalk.red('❌ Invalid environment variable values:'));
    invalidValues.forEach(({ variable, value, reason }) => {
      console.log(chalk.red(`\n  ${variable.key} = "${value}"`));
      console.log(chalk.gray(`    Reason: ${reason}`));
      if (variable.example) {
        console.log(chalk.gray(`    Example: ${variable.example}`));
      }
    });
  }

  // Show suggestions for optional variables
  if (missingOptional.length > 0) {
    console.log('\n' + chalk.yellow('💡 Optional environment variables not set:'));
    const categories = [...new Set(missingOptional.map(v => v.category))];
    
    categories.forEach((category) => {
      const categoryVars = missingOptional.filter(v => v.category === category);
      console.log(chalk.yellow(`\n  ${category}:`));
      categoryVars.forEach((variable) => {
        console.log(chalk.gray(`    - ${variable.key}: ${variable.description}`));
      });
    });
  }

  // Final status
  if (missingRequired.length > 0 || invalidValues.length > 0) {
    console.log('\n' + chalk.red('⚠️  Some required environment variables are missing or invalid.'));
    console.log(chalk.red('   Your application may not function correctly.\n'));
  } else {
    console.log('\n' + chalk.green('✅ All required environment variables are properly configured!\n'));
  }

  // Check for common issues
  checkCommonIssues();
}

function checkCommonIssues(): void {
  const issues: string[] = [];

  // Check for default/placeholder values
  if (process.env.SESSION_SECRET === 'your-super-secret-session-key-make-it-very-long-and-random-12345678') {
    issues.push('SESSION_SECRET is using the default value. Please generate a secure random string.');
  }

  if (process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    issues.push('ANTHROPIC_API_KEY is using a placeholder value. AI features will not work.');
  }

  // Check for localhost in production-like values
  if (process.env.NEXT_PUBLIC_APP_URL?.includes('localhost') && process.env.NODE_ENV === 'production') {
    issues.push('NEXT_PUBLIC_APP_URL contains "localhost" but NODE_ENV is "production".');
  }

  // Check auth provider mismatch
  if (process.env.AUTH_PROVIDER === 'none' && process.env.NEXT_PUBLIC_AUTH_CLIENT_ID) {
    issues.push('AUTH_PROVIDER is "none" but Microsoft auth credentials are configured. Consider setting AUTH_PROVIDER to "microsoft".');
  }

  if (issues.length > 0) {
    console.log(chalk.yellow('⚠️  Common configuration issues detected:'));
    issues.forEach((issue) => {
      console.log(chalk.yellow(`   - ${issue}`));
    });
    console.log('');
  }
}

// Export for use in other files
export function getMissingRequiredEnvVars(): string[] {
  return ENV_SCHEMA
    .filter(v => v.required && (!process.env[v.key] || process.env[v.key] === ''))
    .map(v => v.key);
}

export function hasAllRequiredEnvVars(): boolean {
  return getMissingRequiredEnvVars().length === 0;
}