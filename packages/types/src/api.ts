/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

/**
 * API error response
 */
export interface ApiError {
  error: string;
  status: number;
  details?: any;
}

/**
 * Session API types
 */
export interface CreateSessionRequest {
  userId: string;
  email: string;
  name: string;
}

export interface SessionResponse {
  success: boolean;
  message: string;
  session?: {
    userId: string;
    email: string;
    name: string;
  };
}

/**
 * Magic link authentication types
 */
export interface MagicLinkRequest {
  token: string;
  route?: string;
}

export interface MagicLinkResponse {
  magicLink?: string;
  valid?: boolean;
  user?: any; // Will use AuthUser from auth.ts
}

/**
 * Health check types
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  service: string;
  requestId: string;
}

/**
 * Environment variable check types
 */
export interface EnvVariable {
  name: string;
  value: string | undefined;
  required: boolean;
  sensitive?: boolean;
  description?: string;
  example?: string;
}

export interface EnvCheckResult {
  valid: boolean;
  missing: string[];
  configured: string[];
  environment?: string;
}

/**
 * Pagination types
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Filter and sort types
 */
export interface FilterParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * WebSocket message types
 */
export interface WebSocketMessage<T = any> {
  type: string;
  payload?: T;
  timestamp?: string;
  id?: string;
}