import { jest } from "@jest/globals";
import request from "supertest";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import { io as ioClient } from "socket.io-client";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import server routes and setup
import { setupRoutes } from "../../routes/index.js";
import { ScriptManager } from "../../lib/ScriptManager.js";

// Mock the logger
jest.mock("../../lib/logger.js", () => ({
  createLogger: jest.fn(() => ({
    verbose: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
  setIOInstance: jest.fn(),
  default: {
    verbose: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe("Koksmat Companion Server Integration", () => {
  let app;
  let server;
  let io;
  let scriptManager;
  let serverPort;

  beforeAll((done) => {
    // Create Express app
    app = express();
    app.use(
      cors({
        origin: "*",
        credentials: true,
      }),
    );
    app.use(express.json());

    // Create HTTP server
    server = createServer(app);

    // Create Socket.IO server
    io = new SocketIOServer(server, {
      cors: { origin: "*" },
    });

    // Create script manager
    const mockLogger = {
      verbose: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    scriptManager = new ScriptManager(mockLogger, io);

    // Setup routes
    setupRoutes(app, scriptManager);

    // Setup Socket.IO handlers (copied from server.js)
    io.on("connection", (socket) => {
      socket.on("script:execute", async (data) => {
        try {
          const result = await scriptManager.executeScript(data);
          socket.emit("script:result", result);
        } catch (error) {
          socket.emit("script:error", {
            id: data.id,
            message: error.message,
          });
        }
      });
    });

    // Start server on random port
    server.listen(0, () => {
      serverPort = server.address().port;
      done();
    });
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  describe("GET /api/health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.body).toMatchObject({
        status: "healthy",
        service: "koksmat-companion",
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      });
    });
  });

  describe("GET /api/scripts", () => {
    it("should return list of available scripts", async () => {
      // Mock ScriptManager.listScripts
      scriptManager.listScripts = jest
        .fn()
        .mockResolvedValue(["script1.js", "script2.js", "script3.mjs"]);

      const response = await request(app).get("/api/scripts").expect(200);

      expect(response.body).toEqual({
        scripts: ["script1.js", "script2.js", "script3.mjs"],
      });
    });

    it("should handle errors gracefully", async () => {
      scriptManager.listScripts = jest
        .fn()
        .mockRejectedValue(new Error("Failed to list"));

      const response = await request(app).get("/api/scripts").expect(500);

      expect(response.body).toMatchObject({
        error: "Failed to list scripts",
      });
    });
  });

  describe("POST /api/scripts/execute", () => {
    it("should execute a script", async () => {
      const mockResult = {
        id: "test-123",
        name: "test-script.js",
        code: 0,
        duration: 1234,
        output: [],
        success: true,
      };

      scriptManager.executeScript = jest.fn().mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/api/scripts/execute")
        .send({
          id: "test-123",
          name: "test-script.js",
          args: ["arg1", "arg2"],
        })
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(scriptManager.executeScript).toHaveBeenCalledWith({
        id: "test-123",
        name: "test-script.js",
        args: ["arg1", "arg2"],
      });
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/scripts/execute")
        .send({ name: "test.js" }) // Missing id
        .expect(400);

      expect(response.body).toMatchObject({
        error: "Missing required fields: id and name",
      });
    });

    it("should handle execution errors", async () => {
      scriptManager.executeScript = jest
        .fn()
        .mockRejectedValue(new Error("Script failed"));

      const response = await request(app)
        .post("/api/scripts/execute")
        .send({
          id: "test-123",
          name: "failing-script.js",
        })
        .expect(500);

      expect(response.body).toMatchObject({
        error: "Script failed",
      });
    });
  });

  describe("POST /api/scripts/:id/stop", () => {
    it("should stop a running script", async () => {
      scriptManager.stopScript = jest.fn().mockReturnValue({
        id: "test-123",
        stopped: true,
      });

      const response = await request(app)
        .post("/api/scripts/test-123/stop")
        .expect(200);

      expect(response.body).toEqual({
        id: "test-123",
        stopped: true,
      });
    });

    it("should handle non-existent scripts", async () => {
      scriptManager.stopScript = jest.fn().mockImplementation(() => {
        throw new Error("Script not found");
      });

      const response = await request(app)
        .post("/api/scripts/non-existent/stop")
        .expect(500);

      expect(response.body).toMatchObject({
        error: "Script not found",
      });
    });
  });

  describe("GET /api/scripts/running", () => {
    it("should return list of running scripts", async () => {
      const mockRunning = [
        {
          id: "test-1",
          name: "script1.js",
          startTime: Date.now(),
          duration: 1000,
        },
        {
          id: "test-2",
          name: "script2.js",
          startTime: Date.now(),
          duration: 2000,
        },
      ];

      scriptManager.getRunningScripts = jest.fn().mockReturnValue(mockRunning);

      const response = await request(app)
        .get("/api/scripts/running")
        .expect(200);

      expect(response.body).toEqual({ scripts: mockRunning });
    });
  });

  describe("Socket.IO Integration", () => {
    let client;

    beforeEach((done) => {
      // Create Socket.IO client
      client = ioClient(`http://localhost:${serverPort}`, {
        transports: ["websocket"],
        autoConnect: true,
      });

      client.on("connect", done);
    });

    afterEach(() => {
      if (client.connected) {
        client.disconnect();
      }
    });

    it("should handle client connections", (done) => {
      expect(client.connected).toBe(true);
      done();
    });

    it("should handle script execution via socket", (done) => {
      const mockResult = {
        id: "socket-test",
        name: "test.js",
        code: 0,
        duration: 100,
        output: [],
        success: true,
      };

      scriptManager.executeScript = jest.fn().mockResolvedValue(mockResult);

      // Listen for the result first
      client.once("script:result", (result) => {
        expect(result).toEqual(mockResult);
        done();
      });

      // Then emit the execute command
      client.emit("script:execute", {
        id: "socket-test",
        name: "test.js",
      });
    });

    it("should handle errors via socket", (done) => {
      scriptManager.executeScript = jest
        .fn()
        .mockRejectedValue(new Error("Socket error"));

      // Listen for the error first
      client.once("script:error", (error) => {
        expect(error).toMatchObject({
          id: "error-test",
          message: "Socket error",
        });
        done();
      });

      // Then emit the execute command
      client.emit("script:execute", {
        id: "error-test",
        name: "error.js",
      });
    });
  });

  describe("CORS and Security", () => {
    it("should handle CORS headers", async () => {
      const response = await request(app)
        .get("/api/health")
        .set("Origin", "http://localhost:3000")
        .expect(200);

      expect(response.headers["access-control-allow-origin"]).toBeDefined();
      expect(response.headers["access-control-allow-credentials"]).toBe("true");
    });
  });
});
