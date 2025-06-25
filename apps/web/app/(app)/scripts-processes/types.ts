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

export interface ProcessEvent {
  type: string;
  processId: string;
  data: any;
  timestamp: Date;
}
