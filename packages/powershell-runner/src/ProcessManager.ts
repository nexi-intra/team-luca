import { EventEmitter } from "eventemitter3";
import { PowerShellProcess } from "./utils/PowerShellProcess";
import { ProcessStorage } from "./storage/ProcessStorage";
import type {
  ProcessInfo,
  ProcessManagerOptions,
  ProcessStartOptions,
  ProcessEvent,
  ProcessOutput,
} from "./types";

export class ProcessManager extends EventEmitter {
  private processes: Map<string, PowerShellProcess> = new Map();
  private storage: ProcessStorage;
  private options: Required<ProcessManagerOptions>;

  constructor(options: ProcessManagerOptions = {}) {
    super();
    this.options = {
      maxProcesses: options.maxProcesses || 50,
      logRetentionDays: options.logRetentionDays || 7,
      tempStoragePath: options.tempStoragePath || process.env.TEMP || "/tmp",
    };
    this.storage = new ProcessStorage(this.options.tempStoragePath);
    this.storage.cleanOldLogs(this.options.logRetentionDays);
  }

  async startProcess(options: ProcessStartOptions): Promise<string> {
    if (this.processes.size >= this.options.maxProcesses) {
      throw new Error(
        `Maximum number of processes (${this.options.maxProcesses}) reached`,
      );
    }

    const process = new PowerShellProcess(options);
    this.processes.set(process.id, process);

    process.on("start", (info: ProcessInfo) => {
      this.emitEvent("process:start", process.id, info);
      this.storage.saveProcessInfo(info);
    });

    process.on("output", (output: ProcessOutput) => {
      this.emitEvent("process:output", process.id, output);
      this.storage.appendOutput(output);
    });

    process.on("error", (error: Error) => {
      this.emitEvent("process:error", process.id, { error: error.message });
      this.storage.updateProcessInfo(process.id, process.getInfo());
    });

    process.on("exit", (exitCode: { exitCode: number }) => {
      this.emitEvent("process:exit", process.id, exitCode);
      this.storage.updateProcessInfo(process.id, process.getInfo());
    });

    process.on("cancelled", () => {
      this.emitEvent("process:cancelled", process.id, {});
      this.storage.updateProcessInfo(process.id, process.getInfo());
    });

    await process.start();
    return process.id;
  }

  getProcess(processId: string): PowerShellProcess | undefined {
    return this.processes.get(processId);
  }

  getAllProcesses(): ProcessInfo[] {
    return Array.from(this.processes.values()).map((p) => p.getInfo());
  }

  async getProcessHistory(): Promise<ProcessInfo[]> {
    return this.storage.getAllProcesses();
  }

  async getProcessInfo(processId: string): Promise<ProcessInfo | null> {
    const runningProcess = this.processes.get(processId);
    if (runningProcess) {
      return runningProcess.getInfo();
    }
    return this.storage.getProcessInfo(processId);
  }

  async getProcessOutput(processId: string): Promise<ProcessOutput[]> {
    const runningProcess = this.processes.get(processId);
    if (runningProcess) {
      return runningProcess.getOutput();
    }
    return this.storage.getProcessOutput(processId);
  }

  writeToProcess(processId: string, data: string): void {
    const process = this.processes.get(processId);
    if (!process) {
      throw new Error(`Process ${processId} not found`);
    }
    process.write(data);
  }

  killProcess(processId: string): void {
    const process = this.processes.get(processId);
    if (!process) {
      throw new Error(`Process ${processId} not found`);
    }
    process.kill();
    this.processes.delete(processId);
  }

  killAllProcesses(): void {
    for (const [id, process] of this.processes) {
      process.kill();
      this.processes.delete(id);
    }
  }

  private emitEvent(
    type: ProcessEvent["type"],
    processId: string,
    data: any,
  ): void {
    const event: ProcessEvent = {
      type,
      processId,
      data,
      timestamp: new Date(),
    };
    this.emit(type, event);
    this.emit("event", event);
  }
}

let globalManager: ProcessManager | null = null;

export function getGlobalProcessManager(
  options?: ProcessManagerOptions,
): ProcessManager {
  if (!globalManager) {
    globalManager = new ProcessManager(options);
  }
  return globalManager;
}
