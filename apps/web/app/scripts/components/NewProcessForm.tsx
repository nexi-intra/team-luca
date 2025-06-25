import { useState } from "react";

interface NewProcessFormProps {
  onSubmit: (command: string, args?: string[], cwd?: string) => Promise<string>;
}

export function NewProcessForm({ onSubmit }: NewProcessFormProps) {
  const [command, setCommand] = useState("");
  const [args, setArgs] = useState("");
  const [cwd, setCwd] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const argsArray = args.trim() ? args.trim().split(" ") : undefined;
      await onSubmit(command, argsArray, cwd || undefined);
      setCommand("");
      setArgs("");
      setCwd("");
    } catch (error) {
      console.error("Error starting process:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Start New Process</h2>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Command</label>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Get-Process"
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Arguments</label>
          <input
            type="text"
            value={args}
            onChange={(e) => setArgs(e.target.value)}
            placeholder="-Name chrome"
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Working Directory
          </label>
          <input
            type="text"
            value={cwd}
            onChange={(e) => setCwd(e.target.value)}
            placeholder="Leave empty for current directory"
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? "Starting..." : "Start Process"}
        </button>
      </div>
    </form>
  );
}
