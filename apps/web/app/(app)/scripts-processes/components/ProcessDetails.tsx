import { useState, useEffect, useRef } from "react";
import { ProcessInfo, ProcessOutput } from "../types";
import { format } from "date-fns";
import { Terminal } from "./Terminal";

interface ProcessDetailsProps {
  processId: string;
  onClose: () => void;
  onRefresh: () => void;
}

export function ProcessDetails({
  processId,
  onClose,
  onRefresh,
}: ProcessDetailsProps) {
  const [process, setProcess] = useState<ProcessInfo | null>(null);
  const [output, setOutput] = useState<ProcessOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    fetchProcess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processId]);

  const fetchProcess = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/scripts/processes/${processId}`);
      if (!response.ok) throw new Error("Failed to fetch process");

      const data = await response.json();
      setProcess(data.info);
      setOutput(data.output);
    } catch (error) {
      console.error("Error fetching process:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendInput = async () => {
    if (!inputValue.trim()) return;

    try {
      const response = await fetch(
        `/api/scripts/processes/${processId}/input`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: inputValue + "\n" }),
        },
      );

      if (!response.ok) throw new Error("Failed to send input");
      setInputValue("");
    } catch (error) {
      console.error("Error sending input:", error);
    }
  };

  const killProcess = async () => {
    try {
      const response = await fetch(`/api/scripts/processes/${processId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to kill process");
      onRefresh();
    } catch (error) {
      console.error("Error killing process:", error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading process details...</div>;
  }

  if (!process) {
    return <div className="p-4">Process not found</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold">Process Details</h2>
          <div className="text-sm text-gray-600 mt-1">
            <div>ID: {process.id}</div>
            <div>PID: {process.pid || "N/A"}</div>
            <div>Started: {format(new Date(process.startTime), "PPpp")}</div>
            {process.endTime && (
              <div>Ended: {format(new Date(process.endTime), "PPpp")}</div>
            )}
            {process.exitCode !== undefined && (
              <div>Exit Code: {process.exitCode}</div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {process.status === "running" && (
            <button
              onClick={killProcess}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Kill Process
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Command</h3>
        <div className="bg-gray-100 p-3 rounded font-mono text-sm">
          {process.command} {process.args.join(" ")}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Output</h3>
        <Terminal output={output} />
      </div>

      {process.status === "running" && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Send Input</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendInput()}
              placeholder="Type command and press Enter"
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={sendInput}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
