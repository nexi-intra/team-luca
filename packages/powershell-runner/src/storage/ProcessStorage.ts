import * as fs from "fs/promises";
import * as path from "path";
import type { ProcessInfo, ProcessOutput } from "../types";

export class ProcessStorage {
  private storagePath: string;

  constructor(basePath: string) {
    this.storagePath = path.join(basePath, "powershell-runner");
    this.ensureStorageDir();
  }

  private async ensureStorageDir(): Promise<void> {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
    } catch (error) {
      console.error("Failed to create storage directory:", error);
    }
  }

  private getProcessDir(processId: string): string {
    return path.join(this.storagePath, processId);
  }

  async saveProcessInfo(info: ProcessInfo): Promise<void> {
    const processDir = this.getProcessDir(info.id);
    await fs.mkdir(processDir, { recursive: true });

    const infoPath = path.join(processDir, "info.json");
    await fs.writeFile(infoPath, JSON.stringify(info, null, 2));
  }

  async updateProcessInfo(processId: string, info: ProcessInfo): Promise<void> {
    const infoPath = path.join(this.getProcessDir(processId), "info.json");
    await fs.writeFile(infoPath, JSON.stringify(info, null, 2));
  }

  async getProcessInfo(processId: string): Promise<ProcessInfo | null> {
    try {
      const infoPath = path.join(this.getProcessDir(processId), "info.json");
      const data = await fs.readFile(infoPath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  async appendOutput(output: ProcessOutput): Promise<void> {
    const outputPath = path.join(
      this.getProcessDir(output.processId),
      "output.jsonl",
    );
    const line = JSON.stringify(output) + "\n";
    await fs.appendFile(outputPath, line);
  }

  async getProcessOutput(processId: string): Promise<ProcessOutput[]> {
    try {
      const outputPath = path.join(
        this.getProcessDir(processId),
        "output.jsonl",
      );
      const data = await fs.readFile(outputPath, "utf-8");
      return data
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }

  async getAllProcesses(): Promise<ProcessInfo[]> {
    try {
      const dirs = await fs.readdir(this.storagePath);
      const processes: ProcessInfo[] = [];

      for (const dir of dirs) {
        const info = await this.getProcessInfo(dir);
        if (info) {
          processes.push(info);
        }
      }

      return processes.sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      );
    } catch (error) {
      return [];
    }
  }

  async cleanOldLogs(retentionDays: number): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const processes = await this.getAllProcesses();

      for (const process of processes) {
        if (new Date(process.startTime) < cutoffDate) {
          const processDir = this.getProcessDir(process.id);
          await fs.rm(processDir, { recursive: true, force: true });
        }
      }
    } catch (error) {
      console.error("Failed to clean old logs:", error);
    }
  }
}
