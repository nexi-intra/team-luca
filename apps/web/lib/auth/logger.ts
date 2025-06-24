export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export class AuthLogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${this.context}]`;

    // Handle error objects specially
    let logData = data;
    if (data instanceof Error) {
      logData = {
        error_message: data.message,
        stack: data.stack,
        name: data.name,
        type: "error",
      };
    }

    switch (level) {
      case LogLevel.ERROR:
        console.error(`${prefix} ${message}`, logData || "");
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${message}`, logData || "");
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${message}`, logData || "");
        break;
      case LogLevel.DEBUG:
      default:
        console.log(`${prefix} ${message}`, logData || "");
        break;
    }
  }

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any) {
    this.log(LogLevel.ERROR, message, data);
  }
}
