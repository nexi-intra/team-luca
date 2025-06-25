import { NextRequest, NextResponse } from "next/server";
import {
  getGitHubAuthUrl,
  getGitHubAuth,
  clearGitHubAuth,
} from "@/lib/github/auth";

// GET - Get GitHub auth status
export async function GET() {
  try {
    const auth = await getGitHubAuth();

    if (!auth) {
      return NextResponse.json({
        authenticated: false,
        authUrl: await getGitHubAuthUrl(),
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: auth.user,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// DELETE - Disconnect GitHub
export async function DELETE() {
  try {
    await clearGitHubAuth();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
