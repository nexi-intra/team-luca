import { headers } from 'next/headers';
import { SessionPayload } from './session';

/**
 * Get the current user session from request headers in server components.
 * This is populated by the middleware for protected routes.
 */
export function getCurrentUser(): SessionPayload | null {
  const headersList = headers();
  
  const userId = headersList.get('x-user-id');
  const email = headersList.get('x-user-email');
  const name = headersList.get('x-user-name');

  if (!userId || !email || !name) {
    return null;
  }

  return {
    userId,
    email,
    name,
  };
}

/**
 * Check if the current request has an authenticated session.
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}