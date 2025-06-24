// Sensitive field patterns to mask
export const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /apikey/i,
  /api_key/i,
  /authorization/i,
  /cookie/i,
  /session/i,
  /credit/i,
  /ssn/i,
  /email/i,
  /phone/i,
  /address/i,
] as const;

// Fields that should be completely removed
export const FORBIDDEN_FIELDS = [
  'authorization',
  'cookie',
  'x-api-key',
  'x-auth-token',
  'session_secret',
  'anthropic_api_key',
] as const;

// Aggregate operation keys for metrics
export const OPERATION_KEYS = {
  // API operations
  API_REQUEST: 'api.request',
  API_RESPONSE: 'api.response',
  API_ERROR: 'api.error',
  
  // Auth operations
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_REFRESH: 'auth.refresh',
  AUTH_VALIDATE: 'auth.validate',
  
  // Feature operations
  FEATURE_ACCESS: 'feature.access',
  FEATURE_TOGGLE: 'feature.toggle',
  
  // UI operations
  UI_INTERACTION: 'ui.interaction',
  UI_NAVIGATION: 'ui.navigation',
  UI_RENDER: 'ui.render',
  
  // Data operations
  DB_QUERY: 'db.query',
  CACHE_HIT: 'cache.hit',
  CACHE_MISS: 'cache.miss',
  
  // System operations
  SYSTEM_HEALTH: 'system.health',
  SYSTEM_ERROR: 'system.error',
} as const;

export type OperationKeyType = typeof OPERATION_KEYS[keyof typeof OPERATION_KEYS];