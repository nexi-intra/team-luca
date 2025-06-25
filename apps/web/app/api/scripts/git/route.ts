import { NextRequest, NextResponse } from "next/server";
import { getGlobalScriptsManager } from "@monorepo/powershell-runner";
import { getGitHubAuth } from "@/lib/github/auth";

// GET - List all Git repositories
export async function GET() {
  try {
    const scriptsManager = getGlobalScriptsManager();
    const gitManager = scriptsManager.getGitRepoManager();
    const repositories = await gitManager.listRepositories();

    return NextResponse.json({ repositories });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// POST - Clone a new repository
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, name, branch, depth } = body;

    if (!url) {
      return NextResponse.json(
        { error: "Repository URL is required" },
        { status: 400 },
      );
    }

    const scriptsManager = getGlobalScriptsManager();
    const gitManager = scriptsManager.getGitRepoManager();

    // Get GitHub authentication token if available
    const githubAuth = await getGitHubAuth();

    const repository = await gitManager.cloneRepository({
      url,
      name,
      branch,
      depth,
      token: githubAuth?.token, // Pass token if authenticated
    });

    return NextResponse.json({ repository }, { status: 201 });
  } catch (error) {
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("authentication")) {
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
