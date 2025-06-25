import { NextRequest, NextResponse } from "next/server";
import {
  getGlobalScriptsManager,
  scanForScripts,
} from "@monorepo/powershell-runner";
import path from "path";

export async function GET() {
  try {
    const scriptsManager = getGlobalScriptsManager();
    const gitManager = scriptsManager.getGitRepoManager();

    const allScripts: any[] = [];
    const scriptsPath = process.env.SCRIPTS_PATH || ".scripts";
    const fullScriptsPath = path.resolve(process.cwd(), scriptsPath);

    // Get scripts from regular folders
    const folders = await scriptsManager.getFolders();

    for (const folder of folders) {
      if (!folder.isGitRepo) {
        // Scan regular folder for all .ps1 files recursively
        const folderScripts = await scanForScripts(folder.path, folder.name);
        allScripts.push(
          ...folderScripts.map((script) => ({
            ...script,
            category: folder.name,
            source: "folder",
            repository: undefined,
          })),
        );
      }
    }

    // Get scripts from Git repositories
    const repositories = await gitManager.listRepositories();

    for (const repo of repositories) {
      const repoScripts = await scanForScripts(repo.path, repo.name);
      allScripts.push(
        ...repoScripts.map((script) => ({
          ...script,
          category: repo.name,
          source: "git",
          repository: repo,
        })),
      );
    }

    // Build tree structure
    const tree = buildScriptTree(allScripts);

    return NextResponse.json({
      scripts: allScripts,
      tree,
      totalCount: allScripts.length,
      folderCount: folders.filter((f) => !f.isGitRepo).length,
      repositoryCount: repositories.length,
    });
  } catch (error) {
    console.error("Error fetching all scripts:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

function buildScriptTree(scripts: any[]): any {
  const tree: any = {};

  for (const script of scripts) {
    const pathParts = script.relativePath.split("/");
    let currentNode = tree;

    // Create category if it doesn't exist
    if (!currentNode[script.category]) {
      currentNode[script.category] = {
        type: "category",
        name: script.category,
        source: script.source,
        repository: script.repository,
        children: {},
        scripts: [],
      };
    }

    currentNode = currentNode[script.category];

    // Navigate through path parts (excluding the file name)
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!currentNode.children[part]) {
        currentNode.children[part] = {
          type: "folder",
          name: part,
          children: {},
          scripts: [],
        };
      }
      currentNode = currentNode.children[part];
    }

    // Add the script to the current node
    currentNode.scripts.push(script);
  }

  return tree;
}
