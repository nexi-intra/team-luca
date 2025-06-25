import { NextRequest, NextResponse } from "next/server";
import { getGlobalScriptsManager } from "@monorepo/powershell-runner";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ folder: string }> },
) {
  try {
    const { folder } = await params;
    const manager = getGlobalScriptsManager();
    const scripts = await manager.getScriptsInFolder(folder);

    return NextResponse.json({ scripts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
