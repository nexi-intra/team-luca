import { NextRequest, NextResponse } from "next/server";
import { getGlobalScriptsManager } from "@monorepo/powershell-runner";

export async function GET(request: NextRequest) {
  try {
    const manager = getGlobalScriptsManager();
    const folders = await manager.getFolders();

    return NextResponse.json({ folders });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
