import { NextRequest, NextResponse } from "next/server";
import { getGlobalProcessManager } from "@monorepo/powershell-runner";

export async function GET() {
  try {
    const manager = getGlobalProcessManager();
    const runningProcesses = manager.getAllProcesses();
    const historicalProcesses = await manager.getProcessHistory();

    const allProcesses = [
      ...runningProcesses,
      ...historicalProcesses.filter(
        (h) => !runningProcesses.find((r) => r.id === h.id),
      ),
    ];

    return NextResponse.json({ processes: allProcesses });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { command, args, cwd, user } = body;

    if (!command) {
      return NextResponse.json(
        { error: "Command is required" },
        { status: 400 },
      );
    }

    const manager = getGlobalProcessManager();
    const processId = await manager.startProcess({
      command,
      args: args || [],
      cwd: cwd || process.cwd(),
      user: user || request.headers.get("x-user") || undefined,
    });

    return NextResponse.json({ processId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
