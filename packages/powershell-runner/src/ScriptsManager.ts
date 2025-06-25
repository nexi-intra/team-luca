import { promises as fs } from "fs";
import path from "path";
import logger from "@monorepo/logger";
import { GitRepoManager } from "./GitRepoManager";
import type { GitRepository } from "./GitRepoManager";

export interface Script {
  id: string;
  name: string;
  description: string;
  folder: string;
  path: string;
  parameters?: ScriptParameter[];
}

export interface ScriptParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array";
  description?: string;
  required?: boolean;
  default?: any;
}

export interface ScriptFolder {
  name: string;
  path: string;
  scripts: Script[];
  version?: FolderVersion;
  logsPath: string;
  isGitRepo?: boolean;
  gitRepo?: GitRepository;
}

export interface FolderVersion {
  version: string;
  description: string;
  author: string;
  lastUpdated: string;
  changelog: Array<{
    version: string;
    date: string;
    changes: string[];
  }>;
}

export class ScriptsManager {
  private scriptsPath: string;
  private scriptsCache: Map<string, Script> = new Map();
  private gitRepoManager: GitRepoManager;

  constructor(scriptsPath?: string) {
    this.scriptsPath = path.resolve(
      process.cwd(),
      scriptsPath || process.env.SCRIPTS_PATH || ".scripts",
    );
    this.gitRepoManager = new GitRepoManager(this.scriptsPath);
    logger.info("Scripts path:", { scriptsPath: this.scriptsPath });
  }

  async ensureScriptsDirectory(): Promise<void> {
    try {
      await fs.access(this.scriptsPath);
    } catch {
      logger.info("Creating scripts directory:", { path: this.scriptsPath });
      await fs.mkdir(this.scriptsPath, { recursive: true });
    }
  }

  async getFolders(): Promise<ScriptFolder[]> {
    await this.ensureScriptsDirectory();

    const entries = await fs.readdir(this.scriptsPath, { withFileTypes: true });
    const folders: ScriptFolder[] = [];
    const gitRepos = await this.gitRepoManager.listRepositories();

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== "_repos") {
        const folderPath = path.join(this.scriptsPath, entry.name);
        const logsPath = path.join(folderPath, "logs");

        // Ensure logs directory exists
        try {
          await fs.access(logsPath);
        } catch {
          await fs.mkdir(logsPath, { recursive: true });
        }

        const scripts = await this.getScriptsInFolder(entry.name);
        const version = await this.getFolderVersion(folderPath);

        folders.push({
          name: entry.name,
          path: folderPath,
          scripts,
          version,
          logsPath,
        });
      }
    }

    // Add Git repositories as script folders
    for (const repo of gitRepos) {
      const scripts = await this.getGitRepoScripts(repo);
      const logsPath = path.join(repo.path, "logs");

      // Ensure logs directory exists in git repos
      try {
        await fs.access(logsPath);
      } catch {
        await fs.mkdir(logsPath, { recursive: true });
      }

      folders.push({
        name: repo.name,
        path: repo.path,
        scripts,
        logsPath,
        isGitRepo: true,
        gitRepo: repo,
        version: {
          version: "git",
          description: repo.description || "Git repository",
          author: "Git",
          lastUpdated: repo.lastUpdated?.toISOString().split("T")[0] || "",
          changelog: [],
        },
      });
    }

    return folders;
  }

  async getFolderVersion(
    folderPath: string,
  ): Promise<FolderVersion | undefined> {
    const versionPath = path.join(folderPath, "version.json");

    try {
      const versionContent = await fs.readFile(versionPath, "utf-8");
      return JSON.parse(versionContent);
    } catch (error) {
      logger.debug("No version.json found for folder:", { folderPath });
      return undefined;
    }
  }

  async getScriptsInFolder(folderName: string): Promise<Script[]> {
    const folderPath = path.join(this.scriptsPath, folderName);
    const scripts: Script[] = [];

    try {
      const files = await fs.readdir(folderPath);

      for (const file of files) {
        if (file.endsWith(".ps1")) {
          const scriptPath = path.join(folderPath, file);
          const script = await this.parseScript(scriptPath, folderName);
          scripts.push(script);
          this.scriptsCache.set(script.id, script);
        }
      }
    } catch (error) {
      logger.error("Error reading scripts folder:", { folderName, error });
    }

    return scripts;
  }

  async parseScript(
    scriptPath: string,
    folderName: string,
    relativePath?: string,
  ): Promise<Script> {
    const content = await fs.readFile(scriptPath, "utf-8");
    const fileName = path.basename(scriptPath, ".ps1");
    const scriptId = relativePath
      ? `${folderName}/${relativePath.replace(/\\/g, "/").replace(/\.ps1$/, "")}`
      : `${folderName}/${fileName}`;

    // Parse script metadata from comments
    const descriptionMatch = content.match(/#\s*Description:\s*(.+)/i);
    const description = descriptionMatch
      ? descriptionMatch[1].trim()
      : fileName;

    // Parse parameters from param block
    const parameters = this.parseParameters(content);

    return {
      id: scriptId,
      name: fileName,
      description,
      folder: folderName,
      path: scriptPath,
      parameters,
    };
  }

  private parseParameters(scriptContent: string): ScriptParameter[] {
    const parameters: ScriptParameter[] = [];

    // Simple parameter parsing - can be enhanced
    const paramBlock = scriptContent.match(/param\s*\(([\s\S]*?)\)/i);
    if (paramBlock) {
      const paramContent = paramBlock[1];
      const paramMatches = paramContent.matchAll(/\[([^\]]+)\]\s*\$(\w+)/g);

      for (const match of paramMatches) {
        const type = match[1].toLowerCase();
        const name = match[2];

        parameters.push({
          name,
          type: this.mapPowerShellType(type),
          required: !paramContent.includes(`$${name} =`),
        });
      }
    }

    return parameters;
  }

  private mapPowerShellType(
    psType: string,
  ): "string" | "number" | "boolean" | "array" {
    switch (psType) {
      case "string":
        return "string";
      case "int":
      case "int32":
      case "double":
      case "decimal":
        return "number";
      case "bool":
      case "boolean":
        return "boolean";
      case "array":
      case "object[]":
        return "array";
      default:
        return "string";
    }
  }

  async getScript(scriptId: string): Promise<Script | null> {
    if (this.scriptsCache.has(scriptId)) {
      return this.scriptsCache.get(scriptId)!;
    }

    const [folderName, fileName] = scriptId.split("/");
    const scripts = await this.getScriptsInFolder(folderName);
    return scripts.find((s) => s.id === scriptId) || null;
  }

  getScriptPath(scriptId: string): string {
    const script = this.scriptsCache.get(scriptId);
    if (script) {
      return script.path;
    }

    const [folderName, fileName] = scriptId.split("/");
    return path.join(this.scriptsPath, folderName, `${fileName}.ps1`);
  }

  getScriptLogPath(scriptId: string): string {
    const [folderName, fileName] = scriptId.split("/");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return path.join(
      this.scriptsPath,
      folderName,
      "logs",
      `${fileName}_${timestamp}.log`,
    );
  }

  async saveScriptExecution(
    scriptId: string,
    processId: string,
    parameters?: Record<string, any>,
  ): Promise<void> {
    const logPath = this.getScriptLogPath(scriptId);
    const logEntry = {
      scriptId,
      processId,
      parameters,
      startTime: new Date().toISOString(),
      logFile: logPath,
    };

    try {
      const logDir = path.dirname(logPath);
      await fs.mkdir(logDir, { recursive: true });

      // Save execution metadata
      const metadataPath = path.join(logDir, "executions.json");
      let executions = [];

      try {
        const existing = await fs.readFile(metadataPath, "utf-8");
        executions = JSON.parse(existing);
      } catch {
        // File doesn't exist yet
      }

      executions.push(logEntry);

      // Keep only last 100 executions
      if (executions.length > 100) {
        executions = executions.slice(-100);
      }

      await fs.writeFile(metadataPath, JSON.stringify(executions, null, 2));
    } catch (error) {
      logger.error("Failed to save script execution:", { scriptId, error });
    }
  }

  private async getGitRepoScripts(repo: GitRepository): Promise<Script[]> {
    const scripts: Script[] = [];

    try {
      const scriptPaths = await this.gitRepoManager.getRepoScripts(repo.name);

      for (const scriptPath of scriptPaths) {
        const fullPath = path.join(repo.path, scriptPath);
        const script = await this.parseScript(fullPath, repo.name, scriptPath);
        scripts.push(script);
        this.scriptsCache.set(script.id, script);
      }
    } catch (error) {
      logger.error("Error getting scripts from Git repo:", {
        repoName: repo.name,
        error,
      });
    }

    return scripts;
  }

  // Git repository management methods
  getGitRepoManager(): GitRepoManager {
    return this.gitRepoManager;
  }
}

// Global instance
let globalScriptsManager: ScriptsManager | null = null;

export function getGlobalScriptsManager(): ScriptsManager {
  if (!globalScriptsManager) {
    globalScriptsManager = new ScriptsManager();
  }
  return globalScriptsManager;
}
