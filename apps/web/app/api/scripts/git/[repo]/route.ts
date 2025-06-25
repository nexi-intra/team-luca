import { NextRequest, NextResponse } from "next/server";
import { getGlobalScriptsManager } from "@monorepo/powershell-runner";
import { getGitHubAuth } from "@/lib/github/auth";

// GET - Get repository details and status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repo: string }> },
) {
  try {
    const { repo } = await params;
    const scriptsManager = getGlobalScriptsManager();
    const gitManager = scriptsManager.getGitRepoManager();

    const repository = gitManager.getRepository(repo);
    if (!repository) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 },
      );
    }

    const status = await gitManager.getRepositoryStatus(repo);

    return NextResponse.json({ repository, status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// PUT - Update repository (pull latest changes)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ repo: string }> },
) {
  try {
    const { repo } = await params;
    const scriptsManager = getGlobalScriptsManager();
    const gitManager = scriptsManager.getGitRepoManager();

    // Get GitHub authentication token if available
    const githubAuth = await getGitHubAuth();

    const repository = await gitManager.updateRepository(
      repo,
      githubAuth?.token,
    );

    return NextResponse.json({ repository });
  } catch (error) {
    // Handle authentication errors specifically
    if (
      error instanceof Error &&
      (error.message.includes("authentication") ||
        error.message.includes("Permission denied") ||
        error.message.includes("could not read Username"))
    ) {
      return NextResponse.json(
        {
          error: "GitHub authentication required for private repositories",
          requiresAuth: true,
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// DELETE - Remove repository
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ repo: string }> },
) {
  try {
    const { repo } = await params;
    const scriptsManager = getGlobalScriptsManager();
    const gitManager = scriptsManager.getGitRepoManager();

    await gitManager.removeRepository(repo);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
