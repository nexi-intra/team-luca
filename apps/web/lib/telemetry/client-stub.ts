// Stub for client telemetry during build
export async function initializeClientTelemetry() {
  // No-op for build
}

export const tracer = {
  startActiveSpan: (name: string, options: any, fn: any) => {
    const span = {
      setStatus: () => {},
      recordException: () => {},
      end: () => {},
    };
    return fn(span);
  },
};

export function startSpan<T>(
  name: string,
  fn: (span: any) => T,
  attributes?: Record<string, any>,
): T {
  return fn({
    setStatus: () => {},
    recordException: () => {},
    end: () => {},
  });
}
