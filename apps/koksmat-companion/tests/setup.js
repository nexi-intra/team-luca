// Test setup file
import { jest } from "@jest/globals";

// Set test environment
process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "error"; // Only show errors during tests
process.env.PORT = "0"; // Use random port for tests

// Mock winston to reduce noise in tests
jest.mock("winston", () => {
  const originalModule = jest.requireActual("winston");
  return {
    ...originalModule,
    createLogger: jest.fn(() => ({
      verbose: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      add: jest.fn(),
    })),
  };
});

// Global test utilities
global.testPort = null;
global.testServer = null;

// Cleanup after tests
afterAll(async () => {
  if (global.testServer) {
    await new Promise((resolve) => {
      global.testServer.close(resolve);
    });
  }
});
