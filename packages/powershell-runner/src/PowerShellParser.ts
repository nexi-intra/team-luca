import { promises as fs } from "fs";
import path from "path";

export interface ParsedScript {
  id: string;
  name: string;
  path: string;
  relativePath: string;
  repository?: string;
  frontMatter: Record<string, any>;
  markdown: string;
  rawContent: string;
  codeBlocks: Array<{
    language: string;
    content: string;
    startLine: number;
    endLine: number;
  }>;
  parameters: Array<{
    name: string;
    type: string;
    description?: string;
    required?: boolean;
    default?: any;
  }>;
}

export class PowerShellParser {
  static parseFrontMatter(content: string): {
    frontMatter: Record<string, any>;
    remainingContent: string;
  } {
    const frontMatter: Record<string, any> = {};
    let remainingContent = content;

    // Look for first multiline comment with triple dash pattern
    const frontMatterRegex = /^\s*<#\s*---\s*\n([\s\S]*?)\n\s*---\s*#>/m;
    const match = content.match(frontMatterRegex);

    if (match) {
      const frontMatterText = match[1];
      remainingContent = content.replace(match[0], "").trim();

      // Parse YAML-like frontmatter
      const lines = frontMatterText.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const colonIndex = trimmed.indexOf(":");
          if (colonIndex > -1) {
            const key = trimmed.substring(0, colonIndex).trim();
            const value = trimmed.substring(colonIndex + 1).trim();

            // Try to parse as JSON value, fallback to string
            try {
              frontMatter[key] = JSON.parse(value);
            } catch {
              // Remove quotes if present
              frontMatter[key] = value.replace(/^["']|["']$/g, "");
            }
          }
        }
      }
    }

    return { frontMatter, remainingContent };
  }

  static parseParameters(content: string): Array<{
    name: string;
    type: string;
    description?: string;
    required?: boolean;
    default?: any;
  }> {
    const parameters: Array<{
      name: string;
      type: string;
      description?: string;
      required?: boolean;
      default?: any;
    }> = [];

    // Find param block
    const paramBlockRegex = /param\s*\(([\s\S]*?)\)/i;
    const paramMatch = content.match(paramBlockRegex);

    if (paramMatch) {
      const paramContent = paramMatch[1];

      // Parse individual parameters
      const paramRegex = /\[([^\]]+)\]\s*\$(\w+)(?:\s*=\s*([^,\)]+))?/g;
      let match;

      while ((match = paramRegex.exec(paramContent)) !== null) {
        const [, type, name, defaultValue] = match;

        parameters.push({
          name,
          type: this.mapPowerShellType(type),
          required: !defaultValue,
          default: defaultValue?.trim(),
        });
      }
    }

    return parameters;
  }

  static mapPowerShellType(psType: string): string {
    const cleanType = psType.toLowerCase().replace(/parameter\([^)]*\)\s*/, "");

    switch (cleanType) {
      case "string":
        return "string";
      case "int":
      case "int32":
      case "double":
      case "decimal":
        return "number";
      case "bool":
      case "boolean":
      case "switch":
        return "boolean";
      case "array":
      case "object[]":
      case "string[]":
        return "array";
      default:
        return "string";
    }
  }

  static convertToMarkdown(content: string): string {
    let markdown = "";
    const lines = content.split("\n");
    let inCodeBlock = false;
    let currentCodeBlock: string[] = [];
    let currentComment: string[] = [];
    let inMultilineComment = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Handle multiline comments
      if (trimmed.startsWith("<#")) {
        inMultilineComment = true;
        currentComment = [];
        // Don't include the opening tag
        const contentAfterTag = trimmed.substring(2).trim();
        if (contentAfterTag && !contentAfterTag.startsWith("---")) {
          currentComment.push(contentAfterTag);
        }
        continue;
      }

      if (inMultilineComment) {
        if (trimmed.endsWith("#>")) {
          inMultilineComment = false;
          // Don't include the closing tag
          const contentBeforeTag = trimmed
            .substring(0, trimmed.length - 2)
            .trim();
          if (contentBeforeTag) {
            currentComment.push(contentBeforeTag);
          }

          // Add comment as markdown
          if (currentComment.length > 0) {
            markdown += currentComment.join("\n") + "\n\n";
          }
          currentComment = [];
          continue;
        } else {
          currentComment.push(line);
          continue;
        }
      }

      // Handle single line comments
      if (trimmed.startsWith("#") && !trimmed.startsWith("#{")) {
        // Flush any pending code block
        if (inCodeBlock && currentCodeBlock.length > 0) {
          markdown +=
            "```powershell\n" + currentCodeBlock.join("\n") + "\n```\n\n";
          currentCodeBlock = [];
          inCodeBlock = false;
        }

        // Add comment as markdown (remove # and clean up)
        const commentText = trimmed.substring(1).trim();
        if (commentText) {
          markdown += commentText + "\n\n";
        }
        continue;
      }

      // Handle code lines
      if (trimmed && !trimmed.startsWith("#")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          currentCodeBlock = [];
        }
        currentCodeBlock.push(line);
      } else if (inCodeBlock && !trimmed) {
        // Empty line in code block
        currentCodeBlock.push(line);
      } else if (inCodeBlock && trimmed === "") {
        // End code block on truly empty line
        if (currentCodeBlock.length > 0) {
          markdown +=
            "```powershell\n" + currentCodeBlock.join("\n") + "\n```\n\n";
          currentCodeBlock = [];
          inCodeBlock = false;
        }
      }
    }

    // Flush any remaining code block
    if (inCodeBlock && currentCodeBlock.length > 0) {
      markdown += "```powershell\n" + currentCodeBlock.join("\n") + "\n```\n\n";
    }

    return markdown.trim();
  }

  static async parseScript(
    filePath: string,
    relativePath: string,
    repository?: string,
  ): Promise<ParsedScript> {
    const content = await fs.readFile(filePath, "utf-8");
    const name = path.basename(filePath, ".ps1");
    const id = repository ? `${repository}/${relativePath}` : relativePath;

    // Parse frontmatter
    const { frontMatter, remainingContent } = this.parseFrontMatter(content);

    // Parse parameters
    const parameters = this.parseParameters(content);

    // Convert to markdown
    const markdown = this.convertToMarkdown(remainingContent);

    // Extract code blocks for syntax highlighting
    const codeBlocks: Array<{
      language: string;
      content: string;
      startLine: number;
      endLine: number;
    }> = [];

    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      codeBlocks.push({
        language: match[1] || "powershell",
        content: match[2],
        startLine: 0, // TODO: Calculate actual line numbers
        endLine: 0,
      });
    }

    return {
      id,
      name,
      path: filePath,
      relativePath,
      repository,
      frontMatter,
      markdown,
      rawContent: content,
      codeBlocks,
      parameters,
    };
  }
}

// Utility function to scan directory for PowerShell scripts
export async function scanForScripts(
  basePath: string,
  repository?: string,
): Promise<ParsedScript[]> {
  const scripts: ParsedScript[] = [];

  async function scanDirectory(dir: string, relativePath = ""): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const entryRelativePath = path.join(relativePath, entry.name);

        if (
          entry.isDirectory() &&
          !entry.name.startsWith(".") &&
          entry.name !== "logs"
        ) {
          await scanDirectory(fullPath, entryRelativePath);
        } else if (entry.isFile() && entry.name.endsWith(".ps1")) {
          const script = await PowerShellParser.parseScript(
            fullPath,
            entryRelativePath.replace(/\\/g, "/"),
            repository,
          );
          scripts.push(script);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error);
    }
  }

  await scanDirectory(basePath);
  return scripts;
}
