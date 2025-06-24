import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { config } from "dotenv";
import { setupRoutes } from "./routes/index.js";
import { ScriptManager } from "./lib/ScriptManager.js";
import logger, { setIOInstance, createLogger } from "./lib/logger.js";

config();

const serverLogger = createLogger("server");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 2512;

// Set up WebSocket instance for logger
setIOInstance(io);

const scriptManager = new ScriptManager(createLogger("script-manager"), io);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

// Global state
const companionState = {
  status: "ready",
  connectedClients: 0,
  startTime: new Date(),
  scripts: {
    running: 0,
    completed: 0,
    failed: 0,
  },
};

// Socket.IO connection handling
io.on("connection", (socket) => {
  companionState.connectedClients++;
  serverLogger.info(`Client connected`, {
    socketId: socket.id,
    totalClients: companionState.connectedClients,
    clientAddress: socket.handshake.address,
  });

  // Send initial state
  socket.emit("companion:status", {
    status: companionState.status,
    uptime: Date.now() - companionState.startTime.getTime(),
    scripts: companionState.scripts,
  });

  // Handle script execution requests
  socket.on("script:execute", async (data) => {
    serverLogger.info(`Script execution requested`, {
      scriptName: data.name,
      scriptId: data.id,
      args: data.args,
    });

    companionState.scripts.running++;

    try {
      const result = await scriptManager.executeScript(data);
      companionState.scripts.completed++;
      companionState.scripts.running--;

      socket.emit("script:result", result);
    } catch (error) {
      companionState.scripts.failed++;
      companionState.scripts.running--;

      serverLogger.error(`Script execution failed`, {
        scriptId: data.id,
        scriptName: data.name,
        error: error.message,
        stack: error.stack,
      });

      socket.emit("script:error", {
        id: data.id,
        message: error.message,
      });
    }
  });

  socket.on("disconnect", () => {
    companionState.connectedClients--;
    serverLogger.info(`Client disconnected`, {
      socketId: socket.id,
      totalClients: companionState.connectedClients,
    });
  });
});

// Setup routes
setupRoutes(app, scriptManager);

// Start server
httpServer.listen(PORT, () => {
  serverLogger.info(`Koksmat Companion server started`, {
    port: PORT,
    endpoints: {
      http: `http://localhost:${PORT}`,
      websocket: `ws://localhost:${PORT}`,
    },
    environment: process.env.NODE_ENV || "development",
    logLevel: process.env.LOG_LEVEL || "info",
  });
});
