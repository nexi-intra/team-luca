import { useState, useEffect, useCallback } from "react";
import type { ProcessInfo } from "../types";

export function useProcesses() {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProcesses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/scripts/processes");
      if (!response.ok) throw new Error("Failed to fetch processes");

      const data = await response.json();
      setProcesses(data.processes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const startProcess = useCallback(
    async (command: string, args?: string[], cwd?: string) => {
      try {
        const response = await fetch("/api/scripts/processes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command, args, cwd }),
        });

        if (!response.ok) throw new Error("Failed to start process");

        const data = await response.json();
        await fetchProcesses();
        return data.processId;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        throw err;
      }
    },
    [fetchProcesses],
  );

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  return {
    processes,
    loading,
    error,
    refresh: fetchProcesses,
    startProcess,
  };
}
