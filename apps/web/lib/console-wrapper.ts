/* eslint-disable no-console */

// Store original console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
};

function formatMessage(level: string, args: any[]): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  
  // Handle different argument types
  const messages = args.map(arg => {
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (e) {
        return String(arg);
      }
    }
    return String(arg);
  });
  
  return `${prefix} ${messages.join(' ')}`;
}

export function initializeConsoleWrapper() {
  // Only wrap console in development
  const { config } = require('@/lib/config');
  if (config.getOrDefault('general.environment', 'development') !== 'development') {
    return;
  }

  console.log = (...args: any[]) => {
    originalConsole.log(formatMessage('LOG', args));
  };

  console.info = (...args: any[]) => {
    originalConsole.info(formatMessage('INFO', args));
  };

  console.warn = (...args: any[]) => {
    originalConsole.warn(formatMessage('WARN', args));
  };

  console.error = (...args: any[]) => {
    originalConsole.error(formatMessage('ERROR', args));
  };

  console.debug = (...args: any[]) => {
    originalConsole.debug(formatMessage('DEBUG', args));
  };

  // Add a method to restore original console
  (console as any).restore = () => {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.debug = originalConsole.debug;
  };

  // Log that console wrapper is active
  console.info('Console wrapper initialized - all logs will include timestamps and levels');
}