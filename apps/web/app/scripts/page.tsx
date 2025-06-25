"use client";

import { useState, useEffect } from "react";
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

  useSSE("/api/scripts/events", (event) => {
    refresh();
  });

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
