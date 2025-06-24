export interface EnvVariable {
  key: string;
  value?: string;
  description: string;
  required: boolean;
  category: 'auth' | 'api' | 'telemetry' | 'general';
  example?: string;
  validation?: {
    pattern?: string;
    message?: string;
  };
}

export interface EnvCheckResult {
  isDevMode: boolean;
  envFile: string | null;
  variables: Array<EnvVariable & { currentValue?: string; isValid: boolean; error?: string }>;
  canWrite: boolean;
}

// Define all environment variables with their metadata
export const ENV_VARIABLES: EnvVariable[] = [
  // Authentication
  {
    key: 'NEXT_PUBLIC_AUTH_CLIENT_ID',
    description: 'Microsoft Entra ID application (client) ID',
    required: true,
    category: 'auth',
    example: '9f441c8f-7365-43bc-bb37-a8075043d1b1',
    validation: {
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
      message: 'Must be a valid UUID'
    }
  },
  {
    key: 'NEXT_PUBLIC_AUTH_AUTHORITY',
    description: 'Microsoft identity platform authority URL',
    required: true,
    category: 'auth',
    example: 'https://login.microsoftonline.com/your-tenant-id',
    validation: {
      pattern: '^https://login\\.microsoftonline\\.com/[0-9a-f-]+$',
      message: 'Must be a valid Microsoft authority URL'
    }
  },
  {
    key: 'NEXT_PUBLIC_AUTH_REDIRECT_URI',
    description: 'OAuth redirect URI (defaults to NEXT_PUBLIC_APP_URL)',
    required: false,
    category: 'auth',
    example: 'http://localhost:2803'
  },
  {
    key: 'SESSION_SECRET',
    description: 'Secret key for session encryption (min 32 chars)',
    required: true,
    category: 'auth',
    example: 'your-super-secret-session-key-make-it-very-long',
    validation: {
      pattern: '.{32,}',
      message: 'Must be at least 32 characters long'
    }
  },
  
  // General
  {
    key: 'NEXT_PUBLIC_APP_URL',
    description: 'Base URL of your application',
    required: true,
    category: 'general',
    example: 'http://localhost:2803',
    validation: {
      pattern: '^https?://.+',
      message: 'Must be a valid URL'
    }
  },
  
  // API Keys
  {
    key: 'ANTHROPIC_API_KEY',
    description: 'Claude AI API key for AI features',
    required: false,
    category: 'api',
    example: 'sk-ant-api03-...'
  },
  
  // OpenTelemetry
  {
    key: 'OTEL_SERVICE_NAME',
    description: 'Service name for OpenTelemetry',
    required: false,
    category: 'telemetry',
    example: 'magic-button-assistant'
  },
  {
    key: 'OTEL_EXPORTER_OTLP_TRACES_ENDPOINT',
    description: 'OpenTelemetry traces endpoint',
    required: false,
    category: 'telemetry',
    example: 'http://localhost:14268/api/traces'
  },
  {
    key: 'OTEL_EXPORTER_OTLP_METRICS_ENDPOINT',
    description: 'OpenTelemetry metrics endpoint',
    required: false,
    category: 'telemetry',
    example: 'http://localhost:9464/v1/metrics'
  },
  {
    key: 'NEXT_PUBLIC_LOG_LEVEL',
    description: 'Client-side log level (VERBOSE, INFO, WARN, ERROR, NONE)',
    required: false,
    category: 'telemetry',
    example: 'INFO',
    validation: {
      pattern: '^(VERBOSE|INFO|WARN|ERROR|NONE)$',
      message: 'Must be one of: VERBOSE, INFO, WARN, ERROR, NONE'
    }
  },
  {
    key: 'LOG_LEVEL',
    description: 'Server-side log level (VERBOSE, INFO, WARN, ERROR, NONE)',
    required: false,
    category: 'telemetry',
    example: 'INFO',
    validation: {
      pattern: '^(VERBOSE|INFO|WARN|ERROR|NONE)$',
      message: 'Must be one of: VERBOSE, INFO, WARN, ERROR, NONE'
    }
  }
];