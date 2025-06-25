import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";
import * as githubAuth from "@/lib/github/auth";

// Mock dependencies
vi.mock("@monorepo/powershell-runner", () => ({
  getGlobalScriptsManager: () => ({
    getGitRepoManager: () => ({
      cloneRepository: vi.fn().mockResolvedValue({
        name: "test-repo",
        url: "https://github.com/test/repo.git",
        path: "/path/to/repo",
        branch: "main",
        status: "clean",
      }),
    }),
  }),
}));

vi.mock("@/lib/github/auth", () => ({
  getGitHubAuth: vi.fn(),
}));

describe("Git API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/scripts/git", () => {
    it("should clone repository without authentication for public repos", async () => {
      vi.mocked(githubAuth.getGitHubAuth).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/scripts/git", {
        method: "POST",
        body: JSON.stringify({
          url: "https://github.com/test/public-repo.git",
          name: "public-repo",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.repository).toBeDefined();
      expect(data.repository.name).toBe("test-repo");
    });

    it("should pass GitHub token when authenticated", async () => {
      const mockToken = "github_token_12345";
      vi.mocked(githubAuth.getGitHubAuth).mockResolvedValue({
        token: mockToken,
        user: {
          login: "testuser",
          id: 123,
          avatar_url: "https://example.com/avatar.jpg",
          name: "Test User",
          email: "test@example.com",
        },
      });

      const cloneRepositoryMock = vi.fn().mockResolvedValue({
        name: "private-repo",
        url: "https://github.com/test/private-repo.git",
        path: "/path/to/repo",
        branch: "main",
        status: "clean",
      });

      // Override the mock for this test
      vi.mocked(() => ({
        getGitRepoManager: () => ({
          cloneRepository: cloneRepositoryMock,
        }),
      }));

      const request = new NextRequest("http://localhost:3000/api/scripts/git", {
        method: "POST",
        body: JSON.stringify({
          url: "https://github.com/test/private-repo.git",
          name: "private-repo",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.repository).toBeDefined();

      // Verify the token was passed
      expect(cloneRepositoryMock).toHaveBeenCalledWith(
        expect.objectContaining({
          token: mockToken,
        }),
      );
    });

    it("should return 401 for authentication errors", async () => {
      vi.mocked(githubAuth.getGitHubAuth).mockResolvedValue(null);

      // Mock a clone failure due to authentication
      const errorMessage = "authentication required";
      vi.mocked(() => ({
        getGitRepoManager: () => ({
          cloneRepository: vi.fn().mockRejectedValue(new Error(errorMessage)),
        }),
      }));

      const request = new NextRequest("http://localhost:3000/api/scripts/git", {
        method: "POST",
        body: JSON.stringify({
          url: "https://github.com/test/private-repo.git",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe(
        "GitHub authentication required for private repositories",
      );
      expect(data.requiresAuth).toBe(true);
    });
  });
});
