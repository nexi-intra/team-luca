import { NextRequest, NextResponse } from "next/server";
import { getGlobalProcessManager } from "@monorepo/powershell-runner";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const manager = getGlobalProcessManager();
    const info = await manager.getProcessInfo(id);

    if (!info) {
      return NextResponse.json({ error: "Process not found" }, { status: 404 });
    }

    const output = await manager.getProcessOutput(id);

    return NextResponse.json({ info, output });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const manager = getGlobalProcessManager();
    manager.killProcess(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
