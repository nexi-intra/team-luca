"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, FileCode, Play, Terminal } from "lucide-react";
import { ProcessList } from "../../scripts-processes/components/ProcessList";
import { ProcessDetails } from "../../scripts-processes/components/ProcessDetails";
import { useProcesses } from "../../scripts-processes/hooks/useProcesses";
import { useSSE } from "../../scripts-processes/hooks/useSSE";
import { ScriptRunner } from "./components/ScriptRunner";

interface Script {
  id: string;
  name: string;
  description: string;
  folder: string;
  path: string;
  parameters?: Array<{
    name: string;
    type: string;
    description?: string;
    required?: boolean;
    default?: any;
  }>;
}

export default function ScriptsFolderPage() {
  const params = useParams();
  const folder = params.folder as string;

  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(
    null,
  );
  const {
    processes,
    loading: processesLoading,
    error: processesError,
    refresh,
    startProcess,
  } = useProcesses();

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

  const fetchScripts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/scripts/folders/${folder}`);
      if (!response.ok) throw new Error("Failed to fetch scripts");

      const data = await response.json();
      setScripts(data.scripts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    fetchScripts();
  }, [folder, fetchScripts]);

  const runScript = async (
    scriptId: string,
    parameters?: Record<string, any>,
  ) => {
    try {
      const args: string[] = [];

      // Convert parameters to PowerShell arguments
      if (parameters) {
        Object.entries(parameters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            args.push(`-${key}`);
            args.push(String(value));
          }
        });
      }

      const processId = await startProcess("pwsh", [
        "-File",
        scriptId,
        ...args,
      ]);
      setSelectedProcessId(processId);
      setSelectedScript(null);
    } catch (err) {
      console.error("Failed to start script:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/scripts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scripts
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold capitalize">{folder} Scripts</h1>
            <p className="text-muted-foreground">Loading scripts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/scripts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scripts
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold capitalize">{folder} Scripts</h1>
          <p className="text-muted-foreground">
            {scripts.length} scripts available
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Scripts</CardTitle>
              <CardDescription>
                Select a script to view details and run
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {scripts.map((script) => (
                <Button
                  key={script.id}
                  variant={
                    selectedScript?.id === script.id ? "default" : "outline"
                  }
                  className="w-full justify-start"
                  onClick={() => setSelectedScript(script)}
                >
                  <FileCode className="h-4 w-4 mr-2" />
                  {script.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          <ProcessList
            processes={processes.filter((p) => p.command.includes(folder))}
            selectedId={selectedProcessId}
            onSelect={setSelectedProcessId}
            loading={processesLoading}
            error={processesError}
          />
        </div>

        <div className="lg:col-span-2">
          {selectedScript ? (
            <ScriptRunner
              script={selectedScript}
              onRun={runScript}
              onClose={() => setSelectedScript(null)}
            />
          ) : selectedProcessId ? (
            <ProcessDetails
              processId={selectedProcessId}
              onClose={() => setSelectedProcessId(null)}
              onRefresh={refresh}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Terminal className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a script to view details or a process to see output
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
