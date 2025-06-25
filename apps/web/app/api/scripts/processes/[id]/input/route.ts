import { NextRequest, NextResponse } from "next/server";
import { getGlobalProcessManager } from "@monorepo/powershell-runner";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { input } = await request.json();
    const { id } = await params;

    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    const manager = getGlobalProcessManager();
    manager.writeToProcess(id, input);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
