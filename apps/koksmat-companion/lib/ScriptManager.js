import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ScriptManager {
  constructor(logger, io) {
    this.logger = logger;
    this.io = io;
    this.runningScripts = new Map();
    this.scriptDirectory = path.join(__dirname, "..", "scripts");
  }

  async executeScript({ id, name, args = [], env = {} }) {
    if (this.runningScripts.has(id)) {
      this.logger.warn("Script already running", { id, name });
      throw new Error(`Script ${id} is already running`);
    }

    this.logger.info("Starting script execution", { id, name, args });

    const scriptPath = path.join(this.scriptDirectory, name);

    // Check if script exists
    try {
      await fs.access(scriptPath);
      this.logger.verbose("Script found", { scriptPath });
    } catch {
      this.logger.error("Script not found", { name, scriptPath });
      throw new Error(`Script not found: ${name}`);
    }

    return new Promise((resolve, reject) => {
      const scriptProcess = spawn("node", [scriptPath, ...args], {
        env: { ...process.env, ...env },
      });

      const scriptInfo = {
        id,
        name,
        process: scriptProcess,
        startTime: Date.now(),
        output: [],
      };

      this.runningScripts.set(id, scriptInfo);

      // Emit script started event
      this.io.emit("script:started", {
        id,
        name,
        timestamp: new Date(),
      });

      scriptProcess.stdout.on("data", (data) => {
        const output = data.toString().trim();
        if (!output) return; // Skip empty lines

        scriptInfo.output.push({
          type: "stdout",
          data: output,
          timestamp: Date.now(),
        });

        // Log each line separately for cleaner output
        output.split("\n").forEach((line) => {
          if (line.trim()) {
            this.logger.verbose(`[${name}] ${line.trim()}`);
          }
        });

        this.io.emit("script:output", {
          id,
          type: "stdout",
          data: data.toString(), // Send original with newlines
        });
      });

      scriptProcess.stderr.on("data", (data) => {
        const output = data.toString().trim();
        if (!output) return; // Skip empty lines

        scriptInfo.output.push({
          type: "stderr",
          data: output,
          timestamp: Date.now(),
        });

        // Log each line separately for cleaner output
        output.split("\n").forEach((line) => {
          if (line.trim()) {
            this.logger.warn(`[${name}] ${line.trim()}`);
          }
        });

        this.io.emit("script:output", {
          id,
          type: "stderr",
          data: data.toString(), // Send original with newlines
        });
      });

      scriptProcess.on("close", (code) => {
        const duration = Date.now() - scriptInfo.startTime;
        this.runningScripts.delete(id);

        const result = {
          id,
          name,
          code,
          duration,
          output: scriptInfo.output,
          success: code === 0,
        };

        this.io.emit("script:completed", result);

        if (code === 0) {
          this.logger.info("Script completed successfully", {
            id,
            name,
            duration,
          });
          resolve(result);
        } else {
          this.logger.error("Script failed", { id, name, code, duration });
          reject(new Error(`Script exited with code ${code}`));
        }
      });

      scriptProcess.on("error", (error) => {
        this.runningScripts.delete(id);
        this.logger.error("Script process error", {
          id,
          name,
          error: error.message,
          stack: error.stack,
        });
        this.io.emit("script:error", {
          id,
          error: error.message,
        });
        reject(error);
      });
    });
  }

  async listScripts() {
    try {
      const files = await fs.readdir(this.scriptDirectory);
      const scripts = files.filter(
        (file) => file.endsWith(".js") || file.endsWith(".mjs"),
      );
      this.logger.verbose("Listed scripts", { count: scripts.length, scripts });
      return scripts;
    } catch (error) {
      this.logger.error("Failed to list scripts", {
        error: error.message,
        directory: this.scriptDirectory,
      });
      return [];
    }
  }

  stopScript(id) {
    const scriptInfo = this.runningScripts.get(id);
    if (!scriptInfo) {
      this.logger.warn("Attempted to stop non-running script", { id });
      throw new Error(`Script ${id} is not running`);
    }

    this.logger.info("Stopping script", { id, name: scriptInfo.name });
    scriptInfo.process.kill("SIGTERM");
    this.runningScripts.delete(id);

    this.io.emit("script:stopped", { id });
    return { id, stopped: true };
  }

  getRunningScripts() {
    return Array.from(this.runningScripts.values()).map(
      ({ id, name, startTime }) => ({
        id,
        name,
        startTime,
        duration: Date.now() - startTime,
      }),
    );
  }
}
