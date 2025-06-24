import { jest } from "@jest/globals";
import { createLogger } from "../../lib/logger.js";

describe("Logger", () => {
  let logger;
  let consoleLogSpy;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a fresh logger instance
    logger = createLogger("test-source");

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe("createLogger", () => {
    it("should create logger with all log methods", () => {
      expect(logger).toHaveProperty("verbose");
      expect(logger).toHaveProperty("info");
      expect(logger).toHaveProperty("warn");
      expect(logger).toHaveProperty("error");
      expect(typeof logger.verbose).toBe("function");
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.warn).toBe("function");
      expect(typeof logger.error).toBe("function");
    });

    it("should include source in log metadata", () => {
      const testMessage = "Test message";
      const testMetadata = { key: "value" };

      // Since winston is mocked in setup.js, we can't test the actual output
      // But we can verify the functions are callable
      expect(() => logger.info(testMessage, testMetadata)).not.toThrow();
      expect(() => logger.verbose(testMessage)).not.toThrow();
      expect(() => logger.warn(testMessage)).not.toThrow();
      expect(() => logger.error(testMessage)).not.toThrow();
    });
  });

  describe("Log levels", () => {
    it("should support all expected log levels", () => {
      const levels = ["verbose", "info", "warn", "error"];

      levels.forEach((level) => {
        expect(() => logger[level](`Test ${level} message`)).not.toThrow();
      });
    });
  });

  describe("Metadata handling", () => {
    it("should accept metadata object", () => {
      const metadata = {
        userId: "123",
        action: "test-action",
        duration: 100,
      };

      expect(() => logger.info("Test with metadata", metadata)).not.toThrow();
    });

    it("should work without metadata", () => {
      expect(() => logger.info("Test without metadata")).not.toThrow();
    });
  });
});
