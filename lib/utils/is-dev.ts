/**
 * Client-safe development mode check
 * This avoids importing the config module which may have server-side dependencies
 */
export function isDev(): boolean {
  // In client-side code, we can check process.env directly
  // as Next.js inlines NEXT_PUBLIC_ variables at build time
  if (typeof window !== 'undefined') {
    // Client-side check
    return process.env.NODE_ENV === 'development';
  }
  
  // Server-side check
  return process.env.NODE_ENV === 'development';
}