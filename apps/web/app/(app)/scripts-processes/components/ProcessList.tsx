import { ProcessInfo } from "../types";
import { format } from "date-fns";

interface ProcessListProps {
  processes: ProcessInfo[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
  error: string | null;
}

export function ProcessList({
  processes,
  selectedId,
  onSelect,
  loading,
  error,
}: ProcessListProps) {
  if (loading) {
    return <div className="p-4">Loading processes...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  const statusColors = {
    running: "text-blue-600",
    completed: "text-green-600",
    error: "text-red-600",
    cancelled: "text-yellow-600",
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mt-4">
      <h2 className="text-xl font-semibold mb-4">Processes</h2>
      <div className="space-y-2">
        {processes.map((process) => (
          <div
            key={process.id}
            onClick={() => onSelect(process.id)}
            className={`p-3 rounded cursor-pointer transition-colors ${
              selectedId === process.id
                ? "bg-blue-100 border-blue-500 border"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-mono text-sm truncate">
                  {process.command}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {format(new Date(process.startTime), "HH:mm:ss")} •{" "}
                  {process.user}
                </div>
              </div>
              <span
                className={`text-xs font-semibold ${statusColors[process.status]}`}
              >
                {process.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
