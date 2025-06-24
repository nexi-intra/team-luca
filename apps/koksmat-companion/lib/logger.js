import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define custom level display
const levelDisplay = {
  error: "ERR",
  warn: "WRN",
  info: "INF",
  verbose: "VRB",
};

// Custom format for console output with colors
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "HH:mm:ss.SSS" }),
  winston.format.printf(
    ({ timestamp, level, message, source, ...metadata }) => {
      const shortLevel =
        levelDisplay[level] || level.toUpperCase().substring(0, 3);

      let log = `${timestamp} [${shortLevel}]`;
      if (source) log += ` [${source}]`;
      log += ` ${message}`;

      return log;
    },
  ),
  winston.format.colorize({ all: true }),
);

// Custom format for file output (no colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  winston.format.printf(
    ({ timestamp, level, message, source, ...metadata }) => {
      const log = {
        timestamp,
        level,
        source,
        message,
        ...metadata,
      };
      return JSON.stringify(log);
    },
  ),
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: { service: "koksmat-companion" },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // Daily rotating file for all logs
    new DailyRotateFile({
      filename: path.join(logsDir, "koksmat-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "3d", // Keep logs for 3 days
      format: fileFormat,
      level: "verbose",
    }),

    // Separate file for errors
    new DailyRotateFile({
      filename: path.join(logsDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "3d",
      format: fileFormat,
      level: "error",
    }),
  ],
});

// Create a logger factory for different sources
export function createLogger(source) {
  return {
    verbose: (message, metadata = {}) =>
      logger.verbose(message, { source, ...metadata }),
    info: (message, metadata = {}) =>
      logger.info(message, { source, ...metadata }),
    warn: (message, metadata = {}) =>
      logger.warn(message, { source, ...metadata }),
    error: (message, metadata = {}) =>
      logger.error(message, { source, ...metadata }),
  };
}

// Stream logs to WebSocket clients
let ioInstance = null;

export function setIOInstance(io) {
  ioInstance = io;

  // Add a custom transport that emits to WebSocket
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info) => {
          if (ioInstance) {
            const logEntry = {
              id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: info.timestamp,
              level: info.level,
              message: info.message,
              source: info.source || "system",
              metadata: Object.keys(info)
                .filter(
                  (key) =>
                    ![
                      "timestamp",
                      "level",
                      "message",
                      "source",
                      "service",
                    ].includes(key),
                )
                .reduce((acc, key) => ({ ...acc, [key]: info[key] }), {}),
            };

            // Emit to all connected clients
            ioInstance.emit("log:entry", logEntry);
          }
          return ""; // Return empty string as we don't want to log to console again
        }),
      ),
      silent: false, // Ensure this transport is active
    }),
  );
}

// Export default logger
export default createLogger("system");
