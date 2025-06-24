// Re-export all telemetry utilities
export * from './config';
export * from './instrumentation';

// Client telemetry exports - only load in browser
export const initializeClientTelemetry = () => {
  if (typeof window !== 'undefined') {
    import('./client').then(({ initializeClientTelemetry }) => {
      initializeClientTelemetry();
    });
  }
};

export const startSpan = async (name: string, fn: any, attributes?: any) => {
  if (typeof window !== 'undefined') {
    const { startSpan: clientStartSpan } = await import('./client');
    return clientStartSpan(name, fn, attributes);
  }
  // Server-side fallback - just execute the function
  return fn({
    setStatus: () => {},
    recordException: () => {},
    end: () => {},
  });
};