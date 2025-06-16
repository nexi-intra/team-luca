export enum LogLevel {
  VERBOSE = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LoggerConfig {
  level: LogLevel;
  prefix?: string;
  timestamp?: boolean;
  colors?: boolean;
}

class Logger {
  private level: LogLevel;
  private prefix: string;
  private timestamp: boolean;
  private colors: boolean;
  private namespace?: string;

  constructor(config?: Partial<LoggerConfig>, namespace?: string) {
    // Get log level from environment variable or default to INFO
    const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || process.env.LOG_LEVEL || 'INFO';
    this.level = this.parseLogLevel(envLevel);
    
    this.prefix = config?.prefix || '[Magic Button]';
    this.timestamp = config?.timestamp ?? true;
    this.colors = config?.colors ?? true;
    this.namespace = namespace;
  }

  private parseLogLevel(level: string): LogLevel {
    switch (level.toUpperCase()) {
      case 'VERBOSE':
        return LogLevel.VERBOSE;
      case 'INFO':
        return LogLevel.INFO;
      case 'WARN':
        return LogLevel.WARN;
      case 'ERROR':
        return LogLevel.ERROR;
      case 'NONE':
        return LogLevel.NONE;
      default:
        return LogLevel.INFO;
    }
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const parts: string[] = [];
    
    if (this.timestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }
    
    parts.push(this.prefix);
    
    if (this.namespace) {
      parts.push(`[${this.namespace}]`);
    }
    
    parts.push(`[${level}]`);
    parts.push(message);
    
    return parts.join(' ');
  }

  private getConsoleMethod(level: LogLevel): keyof Console {
    switch (level) {
      case LogLevel.VERBOSE:
        return 'debug';
      case LogLevel.INFO:
        return 'info';
      case LogLevel.WARN:
        return 'warn';
      case LogLevel.ERROR:
        return 'error';
      default:
        return 'log';
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level && this.level !== LogLevel.NONE;
  }

  verbose(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.VERBOSE)) {
      console.debug(this.formatMessage('VERBOSE', message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message), ...args);
    }
  }

  // Create a child logger with a namespace
  child(namespace: string): Logger {
    const childNamespace = this.namespace 
      ? `${this.namespace}:${namespace}` 
      : namespace;
    return new Logger({
      level: this.level,
      prefix: this.prefix,
      timestamp: this.timestamp,
      colors: this.colors,
    }, childNamespace);
  }

  // Set log level dynamically
  setLevel(level: LogLevel | string): void {
    if (typeof level === 'string') {
      this.level = this.parseLogLevel(level);
    } else {
      this.level = level;
    }
  }

  // Get current log level
  getLevel(): LogLevel {
    return this.level;
  }
}

// Create and export default logger instance
const logger = new Logger();

// Export factory function for creating namespaced loggers
export function createLogger(namespace: string, config?: Partial<LoggerConfig>): Logger {
  return new Logger(config, namespace);
}

// Export default logger
export default logger;

// Re-export Logger class for type usage
export { Logger };