import { config } from '@/lib/config';

/**
 * Check if the application is running in development mode
 */
export function isDevMode(): boolean {
  return config.getOrDefault('general.environment', 'development') === 'development';
}

/**
 * Guard function that throws if not in development mode
 */
export function requireDevMode(context: string = 'This feature'): void {
  if (!isDevMode()) {
    throw new Error(`${context} is only available in development mode`);
  }
}