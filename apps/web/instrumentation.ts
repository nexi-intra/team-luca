export async function register() {
  // Only run instrumentation on the server side
  if (typeof window === 'undefined' && process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      // Initialize console wrapper
      const { initializeConsoleWrapper } = await import('./lib/console-wrapper');
      initializeConsoleWrapper();
      
      // Validate environment variables in development
      if (process.env.NODE_ENV === 'development') {
        const { validateEnvironment } = await import('./lib/env-validation');
        validateEnvironment();
      }
      
      // Initialize OpenTelemetry
      const { initializeServerTelemetry } = await import('./lib/telemetry/server');
      initializeServerTelemetry();
    } catch (error) {
      console.warn('🔭 Failed to initialize instrumentation:', error);
    }
  }
}