export interface ProcessInfo {
  id: string;
  pid: number | null;
  command: string;
  args: string[];
  status: "running" | "completed" | "error" | "cancelled";
  startTime: Date;
  endTime?: Date;
  exitCode?: number;
  error?: string;
  user?: string;
  cwd: string;
}

export interface ProcessOutput {
  processId: string;
  timestamp: Date;
  type: "stdout" | "stderr";
  data: string;
}

export interface ProcessManagerOptions {
  maxProcesses?: number;
  logRetentionDays?: number;
  tempStoragePath?: string;
}

export interface ProcessStartOptions {
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  user?: string;
}

export type ProcessEventType =
  | "process:start"
  | "process:output"
  | "process:error"
  | "process:exit"
  | "process:cancelled";

export interface ProcessEvent {
  type: ProcessEventType;
  processId: string;
  data: any;
  timestamp: Date;
}
