/**
 * Common utility types used across the application
 */

/**
 * Make all properties in T optional recursively
 */
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * Make all properties in T required recursively
 */
export type DeepRequired<T> = T extends object ? {
  [P in keyof T]-?: DeepRequired<T[P]>;
} : T;

/**
 * Extract the type of array elements
 */
export type ArrayElement<ArrayType extends readonly unknown[]> = 
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

/**
 * Make specified keys required while keeping others optional
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specified keys optional while keeping others required
 */
export type PartialKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Exclude null and undefined from T
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Create a type with a set of properties K of type T
 */
export type Record<K extends keyof any, T> = {
  [P in K]: T;
};

/**
 * Async function type
 */
export type AsyncFunction<T extends any[] = any[], R = any> = (...args: T) => Promise<R>;

/**
 * JSON-serializable types
 */
export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/**
 * Environment types
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';

/**
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * Status types
 */
export type Status = 'idle' | 'loading' | 'success' | 'error';

/**
 * Sort order types
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Date range types
 */
export interface DateRange {
  start: Date | string;
  end: Date | string;
}

/**
 * Key-value pair type
 */
export interface KeyValue<T = string> {
  key: string;
  value: T;
}

/**
 * Option type for select inputs
 */
export interface Option<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  group?: string;
}

/**
 * Tree node type for hierarchical data
 */
export interface TreeNode<T = any> {
  id: string;
  label: string;
  data?: T;
  children?: TreeNode<T>[];
  expanded?: boolean;
  selected?: boolean;
}

/**
 * Metadata type
 */
export interface Metadata {
  [key: string]: JsonValue;
}

/**
 * Error with code
 */
export interface CodedError extends Error {
  code: string;
  details?: any;
}

/**
 * Feature flag type
 */
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
  metadata?: Metadata;
}