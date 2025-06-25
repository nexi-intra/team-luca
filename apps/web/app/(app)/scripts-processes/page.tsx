"use client";

import { useState, useEffect, useCallback } from "react";
import { ProcessList } from "./components/ProcessList";
import { ProcessDetails } from "./components/ProcessDetails";
import { NewProcessForm } from "./components/NewProcessForm";
import { useProcesses } from "./hooks/useProcesses";
import { useSSE } from "./hooks/useSSE";

export default function ScriptsPage() {
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(
    null,
  );
  const { processes, loading, error, refresh, startProcess } = useProcesses();

  // Add a regular polling interval as a fallback
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [refresh]);

  // SSE for real-time updates
  const handleSSEMessage = useCallback(
    (event: any) => {
      // Only refresh if it's a relevant event
      if (
        event.type === "process-started" ||
        event.type === "process-ended" ||
        event.type === "process-output"
      ) {
        refresh();
      }
    },
    [refresh],
  );

  useSSE("/api/scripts/events", handleSSEMessage);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">PowerShell Process Manager</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <NewProcessForm onSubmit={startProcess} />
          <ProcessList
            processes={processes}
            selectedId={selectedProcessId}
            onSelect={setSelectedProcessId}
            loading={loading}
            error={error}
          />
        </div>

        <div className="lg:col-span-2">
          {selectedProcessId && (
            <ProcessDetails
              processId={selectedProcessId}
              onClose={() => setSelectedProcessId(null)}
              onRefresh={refresh}
            />
          )}
        </div>
      </div>
    </div>
  );
}
