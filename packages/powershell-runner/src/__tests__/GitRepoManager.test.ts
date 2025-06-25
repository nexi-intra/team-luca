import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { GitRepoManager } from "../GitRepoManager";
import { promises as fs } from "fs";
import path from "path";
import { spawn } from "child_process";

// Mock child_process spawn
vi.mock("child_process", () => ({
  spawn: vi.fn(),
}));

// Mock fs module
vi.mock("fs", () => ({
  promises: {
    access: vi.fn(),
    mkdir: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    readdir: vi.fn(),
    rm: vi.fn(),
  },
}));

// Mock logger
vi.mock("@monorepo/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("GitRepoManager", () => {
  let gitRepoManager: GitRepoManager;
  const testScriptsPath = "/test/scripts";

  beforeEach(() => {
    vi.clearAllMocks();
    gitRepoManager = new GitRepoManager(testScriptsPath);
  });

  describe("cloneRepository", () => {
    it("should include token in clone URL for GitHub repositories", async () => {
      const mockToken = "ghp_test123456789";
      const repoUrl = "https://github.com/test/repo.git";

      // Mock successful git clone
      const mockProcess = {
        stdout: { on: vi.fn((event, cb) => event === "data" && cb("")) },
        stderr: { on: vi.fn((event, cb) => event === "data" && cb("")) },
        on: vi.fn((event, cb) => {
          if (event === "close") cb(0);
        }),
      };

      vi.mocked(spawn).mockReturnValue(mockProcess as any);
      vi.mocked(fs.readFile).mockRejectedValue(new Error("No registry"));

      await gitRepoManager.cloneRepository({
        url: repoUrl,
        name: "test-repo",
        token: mockToken,
      });

      // Verify spawn was called with authenticated URL
      expect(spawn).toHaveBeenCalledWith(
        "git",
        expect.arrayContaining([
          "clone",
          `https://${mockToken}@github.com/test/repo.git`,
          expect.any(String),
        ]),
        expect.any(Object),
      );
    });

    it("should not modify URL for non-GitHub repositories", async () => {
      const mockToken = "token123";
      const repoUrl = "https://gitlab.com/test/repo.git";

      // Mock successful git clone
      const mockProcess = {
        stdout: { on: vi.fn((event, cb) => event === "data" && cb("")) },
        stderr: { on: vi.fn((event, cb) => event === "data" && cb("")) },
        on: vi.fn((event, cb) => {
          if (event === "close") cb(0);
        }),
      };

      vi.mocked(spawn).mockReturnValue(mockProcess as any);
      vi.mocked(fs.readFile).mockRejectedValue(new Error("No registry"));

      await gitRepoManager.cloneRepository({
        url: repoUrl,
        name: "test-repo",
        token: mockToken,
      });

      // Verify spawn was called with original URL (not modified)
      expect(spawn).toHaveBeenCalledWith(
        "git",
        expect.arrayContaining([
          "clone",
          repoUrl, // Original URL, not modified
          expect.any(String),
        ]),
        expect.any(Object),
      );
    });
  });

  describe("updateRepository", () => {
    it("should configure authentication header when token is provided", async () => {
      const mockToken = "ghp_test123456789";
      const repoName = "test-repo";

      // Mock repository registry
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([
          {
            name: repoName,
            url: "https://github.com/test/repo.git",
            path: "/test/scripts/_repos/test-repo",
            branch: "main",
            status: "clean",
          },
        ]),
      );

      // Mock git commands
      const mockProcess = {
        stdout: { on: vi.fn((event, cb) => event === "data" && cb("")) },
        stderr: { on: vi.fn((event, cb) => event === "data" && cb("")) },
        on: vi.fn((event, cb) => {
          if (event === "close") cb(0);
        }),
      };

      vi.mocked(spawn).mockReturnValue(mockProcess as any);

      await gitRepoManager.updateRepository(repoName, mockToken);

      // Verify authentication header was set
      expect(spawn).toHaveBeenCalledWith(
        "git",
        [
          "config",
          "--local",
          "http.extraheader",
          `Authorization: Bearer ${mockToken}`,
        ],
        expect.objectContaining({
          cwd: "/test/scripts/_repos/test-repo",
        }),
      );

      // Verify pull command was called
      expect(spawn).toHaveBeenCalledWith(
        "git",
        ["pull", "origin", "main"],
        expect.objectContaining({
          cwd: "/test/scripts/_repos/test-repo",
        }),
      );

      // Verify authentication header was unset
      expect(spawn).toHaveBeenCalledWith(
        "git",
        ["config", "--local", "--unset", "http.extraheader"],
        expect.objectContaining({
          cwd: "/test/scripts/_repos/test-repo",
        }),
      );
    });

    it("should not set authentication header for non-GitHub repositories", async () => {
      const mockToken = "token123";
      const repoName = "test-repo";

      // Mock repository registry with non-GitHub URL
      vi.mocked(fs.readFile).mockResolvedValueOnce(
        JSON.stringify([
          {
            name: repoName,
            url: "https://gitlab.com/test/repo.git",
            path: "/test/scripts/_repos/test-repo",
            branch: "main",
            status: "clean",
          },
        ]),
      );

      // Mock git commands
      const mockProcess = {
        stdout: { on: vi.fn((event, cb) => event === "data" && cb("")) },
        stderr: { on: vi.fn((event, cb) => event === "data" && cb("")) },
        on: vi.fn((event, cb) => {
          if (event === "close") cb(0);
        }),
      };

      vi.mocked(spawn).mockReturnValue(mockProcess as any);

      await gitRepoManager.updateRepository(repoName, mockToken);

      // Verify authentication header was NOT set
      expect(spawn).not.toHaveBeenCalledWith(
        "git",
        expect.arrayContaining(["config", "--local", "http.extraheader"]),
        expect.any(Object),
      );

      // Verify pull command was still called
      expect(spawn).toHaveBeenCalledWith(
        "git",
        ["pull", "origin", "main"],
        expect.objectContaining({
          cwd: "/test/scripts/_repos/test-repo",
        }),
      );
    });
  });
});
