import * as pty from "node-pty";
import { EventEmitter } from "eventemitter3";
import { v4 as uuidv4 } from "uuid";
import type { ProcessInfo, ProcessOutput, ProcessStartOptions } from "../types";

export class PowerShellProcess extends EventEmitter {
  private ptyProcess: pty.IPty | null = null;
  public readonly id: string;
  public readonly info: ProcessInfo;
  private outputBuffer: ProcessOutput[] = [];

  constructor(options: ProcessStartOptions) {
    super();
    this.id = uuidv4();
    this.info = {
      id: this.id,
      pid: null,
      command: options.command,
      args: options.args || [],
      status: "running",
      startTime: new Date(),
      user: options.user || process.env.USER || "unknown",
      cwd: options.cwd || process.cwd(),
    };
  }

  async start(): Promise<void> {
    try {
      const shell = process.platform === "win32" ? "powershell.exe" : "pwsh";
      const args = [
        "-NoProfile",
        "-Command",
        this.info.command,
        ...this.info.args,
      ];

      this.ptyProcess = pty.spawn(shell, args, {
        name: "xterm-color",
        cols: 80,
        rows: 30,
        cwd: this.info.cwd,
        env: process.env as Record<string, string>,
      });

      this.info.pid = this.ptyProcess.pid;

      this.ptyProcess.onData((data) => {
        const output: ProcessOutput = {
          processId: this.id,
          timestamp: new Date(),
          type: "stdout",
          data,
        };
        this.outputBuffer.push(output);
        this.emit("output", output);
      });

      this.ptyProcess.onExit((exitCode) => {
        this.info.status = exitCode.exitCode === 0 ? "completed" : "error";
        this.info.exitCode = exitCode.exitCode;
        this.info.endTime = new Date();
        this.emit("exit", exitCode);
      });

      this.emit("start", this.info);
    } catch (error) {
      this.info.status = "error";
      this.info.error = error instanceof Error ? error.message : String(error);
      this.info.endTime = new Date();
      this.emit("error", error);
      throw error;
    }
  }

  write(data: string): void {
    if (this.ptyProcess && this.info.status === "running") {
      this.ptyProcess.write(data);
    } else {
      throw new Error(`Process ${this.id} is not running`);
    }
  }

  kill(): void {
    if (this.ptyProcess) {
      this.ptyProcess.kill();
      this.info.status = "cancelled";
      this.info.endTime = new Date();
      this.emit("cancelled");
    }
  }

  resize(cols: number, rows: number): void {
    if (this.ptyProcess) {
      this.ptyProcess.resize(cols, rows);
    }
  }

  getOutput(): ProcessOutput[] {
    return [...this.outputBuffer];
  }

  getInfo(): ProcessInfo {
    return { ...this.info };
  }
}
