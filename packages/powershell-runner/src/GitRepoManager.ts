import { promises as fs } from "fs";
import path from "path";
import { spawn } from "child_process";
import logger from "@monorepo/logger";

export interface GitRepository {
  name: string;
  url: string;
  path: string;
  branch: string;
  lastUpdated?: Date;
  status: "clean" | "dirty" | "error";
  description?: string;
}

export interface GitCloneOptions {
  url: string;
  name?: string;
  branch?: string;
  depth?: number;
  token?: string;
}

export class GitRepoManager {
  private scriptsPath: string;
  private reposPath: string;
  private repoRegistry: Map<string, GitRepository> = new Map();

  constructor(scriptsPath?: string) {
    this.scriptsPath = path.resolve(
      process.cwd(),
      scriptsPath || process.env.SCRIPTS_PATH || ".scripts",
    );
    this.reposPath = path.join(this.scriptsPath, "_repos");
    this.ensureReposDirectory();
    this.loadRepoRegistry();
  }

  private async ensureReposDirectory(): Promise<void> {
    try {
      await fs.access(this.reposPath);
    } catch {
      logger.info("Creating repos directory:", { path: this.reposPath });
      await fs.mkdir(this.reposPath, { recursive: true });
    }
  }

  private async loadRepoRegistry(): Promise<void> {
    const registryPath = path.join(this.reposPath, "registry.json");

    try {
      const content = await fs.readFile(registryPath, "utf-8");
      const repos = JSON.parse(content);

      for (const repo of repos) {
        this.repoRegistry.set(repo.name, {
          ...repo,
          lastUpdated: repo.lastUpdated
            ? new Date(repo.lastUpdated)
            : undefined,
        });
      }

      logger.info("Loaded repository registry:", { count: repos.length });
    } catch (error) {
      logger.info("No repository registry found, starting fresh");
    }
  }

  private async saveRepoRegistry(): Promise<void> {
    const registryPath = path.join(this.reposPath, "registry.json");
    const repos = Array.from(this.repoRegistry.values()).map((repo) => ({
      ...repo,
      lastUpdated: repo.lastUpdated?.toISOString(),
    }));

    await fs.writeFile(registryPath, JSON.stringify(repos, null, 2));
  }

  private executeGitCommand(
    command: string,
    args: string[],
    cwd?: string,
  ): Promise<{ stdout: string; stderr: string; success: boolean }> {
    return new Promise((resolve) => {
      const gitProcess = spawn(command, args, {
        cwd: cwd || this.reposPath,
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      gitProcess.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      gitProcess.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      gitProcess.on("close", (code) => {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          success: code === 0,
        });
      });

      gitProcess.on("error", (error) => {
        resolve({
          stdout: "",
          stderr: error.message,
          success: false,
        });
      });
    });
  }

  async cloneRepository(options: GitCloneOptions): Promise<GitRepository> {
    const repoName = options.name || this.extractRepoName(options.url);
    const repoPath = path.join(this.reposPath, repoName);

    // Check if repository already exists
    if (this.repoRegistry.has(repoName)) {
      throw new Error(`Repository '${repoName}' already exists`);
    }

    // Prepare authenticated URL if token is provided
    let cloneUrl = options.url;
    if (options.token && options.url.startsWith("https://github.com/")) {
      // Insert token for authenticated cloning
      cloneUrl = options.url.replace(
        "https://github.com/",
        `https://${options.token}@github.com/`,
      );
    }

    // Prepare git clone arguments
    const args = ["clone"];

    if (options.branch) {
      args.push("--branch", options.branch);
    }

    if (options.depth) {
      args.push("--depth", options.depth.toString());
    }

    args.push(cloneUrl, repoPath);

    logger.info("Cloning repository:", { url: options.url, name: repoName });

    const result = await this.executeGitCommand("git", args);

    if (!result.success) {
      throw new Error(`Failed to clone repository: ${result.stderr}`);
    }

    // Get current branch
    const branchResult = await this.executeGitCommand(
      "git",
      ["rev-parse", "--abbrev-ref", "HEAD"],
      repoPath,
    );

    const repo: GitRepository = {
      name: repoName,
      url: options.url,
      path: repoPath,
      branch: branchResult.success
        ? branchResult.stdout
        : options.branch || "main",
      lastUpdated: new Date(),
      status: "clean",
    };

    // Try to get repository description from README
    try {
      const readmePath = path.join(repoPath, "README.md");
      const readmeContent = await fs.readFile(readmePath, "utf-8");
      const firstLine = readmeContent.split("\n")[0];
      repo.description = firstLine.replace(/^#\s*/, "").trim();
    } catch {
      // No README or couldn't read it
    }

    this.repoRegistry.set(repoName, repo);
    await this.saveRepoRegistry();

    logger.info("Repository cloned successfully:", { name: repoName });
    return repo;
  }

  async removeRepository(name: string): Promise<void> {
    const repo = this.repoRegistry.get(name);
    if (!repo) {
      throw new Error(`Repository '${name}' not found`);
    }

    logger.info("Removing repository:", { name });

    // Remove directory
    await fs.rm(repo.path, { recursive: true, force: true });

    // Remove from registry
    this.repoRegistry.delete(name);
    await this.saveRepoRegistry();

    logger.info("Repository removed successfully:", { name });
  }

  async updateRepository(name: string, token?: string): Promise<GitRepository> {
    const repo = this.repoRegistry.get(name);
    if (!repo) {
      throw new Error(`Repository '${name}' not found`);
    }

    logger.info("Updating repository:", { name });

    // Check current status
    const statusResult = await this.executeGitCommand(
      "git",
      ["status", "--porcelain"],
      repo.path,
    );

    if (!statusResult.success) {
      repo.status = "error";
      await this.saveRepoRegistry();
      throw new Error(
        `Failed to check repository status: ${statusResult.stderr}`,
      );
    }

    const isDirty = statusResult.stdout.trim().length > 0;

    if (isDirty) {
      repo.status = "dirty";
      await this.saveRepoRegistry();
      throw new Error(
        `Repository has uncommitted changes. Please commit or stash changes before updating.`,
      );
    }

    // Set up authentication if token provided and it's a GitHub repo
    if (token && repo.url.includes("github.com")) {
      // Configure git to use the token for this operation
      await this.executeGitCommand(
        "git",
        [
          "config",
          "--local",
          "http.extraheader",
          `Authorization: Bearer ${token}`,
        ],
        repo.path,
      );
    }

    // Pull latest changes
    const pullResult = await this.executeGitCommand(
      "git",
      ["pull", "origin", repo.branch],
      repo.path,
    );

    // Clean up the auth header after pull
    if (token && repo.url.includes("github.com")) {
      await this.executeGitCommand(
        "git",
        ["config", "--local", "--unset", "http.extraheader"],
        repo.path,
      );
    }

    if (!pullResult.success) {
      repo.status = "error";
      await this.saveRepoRegistry();
      throw new Error(`Failed to pull updates: ${pullResult.stderr}`);
    }

    // Update repository info
    repo.lastUpdated = new Date();
    repo.status = "clean";

    this.repoRegistry.set(name, repo);
    await this.saveRepoRegistry();

    logger.info("Repository updated successfully:", { name });
    return repo;
  }

  async getRepositoryStatus(name: string): Promise<{
    status: string;
    branch: string;
    commits: { ahead: number; behind: number };
    changes: {
      modified: number;
      added: number;
      deleted: number;
      untracked: number;
    };
  }> {
    const repo = this.repoRegistry.get(name);
    if (!repo) {
      throw new Error(`Repository '${name}' not found`);
    }

    // Get current branch
    const branchResult = await this.executeGitCommand(
      "git",
      ["rev-parse", "--abbrev-ref", "HEAD"],
      repo.path,
    );

    // Get ahead/behind status
    const trackingResult = await this.executeGitCommand(
      "git",
      ["rev-list", "--left-right", "--count", `origin/${repo.branch}...HEAD`],
      repo.path,
    );

    let ahead = 0,
      behind = 0;
    if (trackingResult.success && trackingResult.stdout) {
      const [behindStr, aheadStr] = trackingResult.stdout.split("\t");
      behind = parseInt(behindStr) || 0;
      ahead = parseInt(aheadStr) || 0;
    }

    // Get working directory status
    const statusResult = await this.executeGitCommand(
      "git",
      ["status", "--porcelain"],
      repo.path,
    );

    const changes = { modified: 0, added: 0, deleted: 0, untracked: 0 };
    if (statusResult.success && statusResult.stdout) {
      const lines = statusResult.stdout
        .split("\n")
        .filter((line) => line.trim());

      for (const line of lines) {
        const status = line.substring(0, 2);
        if (status.includes("M")) changes.modified++;
        if (status.includes("A")) changes.added++;
        if (status.includes("D")) changes.deleted++;
        if (status.includes("??")) changes.untracked++;
      }
    }

    return {
      status: repo.status,
      branch: branchResult.success ? branchResult.stdout : repo.branch,
      commits: { ahead, behind },
      changes,
    };
  }

  async listRepositories(): Promise<GitRepository[]> {
    return Array.from(this.repoRegistry.values());
  }

  getRepository(name: string): GitRepository | undefined {
    return this.repoRegistry.get(name);
  }

  private extractRepoName(url: string): string {
    // Extract repository name from URL
    const match = url.match(/\/([^\/]+?)(?:\.git)?$/);
    return match ? match[1] : "unknown-repo";
  }

  async getRepoScripts(repoName: string): Promise<string[]> {
    const repo = this.repoRegistry.get(repoName);
    if (!repo) {
      throw new Error(`Repository '${repoName}' not found`);
    }

    const scripts: string[] = [];

    try {
      const findScripts = async (
        dir: string,
        relativePath = "",
      ): Promise<void> => {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.isDirectory() && !entry.name.startsWith(".")) {
            await findScripts(
              path.join(dir, entry.name),
              path.join(relativePath, entry.name),
            );
          } else if (entry.isFile() && entry.name.endsWith(".ps1")) {
            scripts.push(path.join(relativePath, entry.name));
          }
        }
      };

      await findScripts(repo.path);
    } catch (error) {
      logger.error("Error scanning repository for scripts:", {
        repoName,
        error,
      });
    }

    return scripts;
  }
}

// Global instance
let globalGitRepoManager: GitRepoManager | null = null;

export function getGlobalGitRepoManager(): GitRepoManager {
  if (!globalGitRepoManager) {
    globalGitRepoManager = new GitRepoManager();
  }
  return globalGitRepoManager;
}
