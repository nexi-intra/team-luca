import { NextRequest, NextResponse } from "next/server";
import { PowerShellParser } from "@monorepo/powershell-runner";

export async function POST(request: NextRequest) {
  try {
    const { scriptPath, relativePath, repository } = await request.json();

    if (!scriptPath) {
      return NextResponse.json(
        { error: "Script path is required" },
        { status: 400 },
      );
    }

    const parsedScript = await PowerShellParser.parseScript(
      scriptPath,
      relativePath || scriptPath,
      repository,
    );

    return NextResponse.json({ script: parsedScript });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
