import { SessionManager, createSessionManager } from "../../session/manager";
import type { SessionPayload } from "@monorepo/types";

describe("SessionManager", () => {
  let sessionManager: SessionManager;
  const mockSecret = "test-secret-that-is-at-least-32-characters-long";

  beforeEach(() => {
    sessionManager = new SessionManager({ secret: mockSecret });
  });

  describe("initialization", () => {
    it("should create session manager with default config", () => {
      const manager = createSessionManager(mockSecret);
      expect(manager).toBeInstanceOf(SessionManager);
    });

    it("should throw error if secret is too short", () => {
      expect(() => new SessionManager({ secret: "short" })).toThrow(
        "Session secret must be at least 32 characters long",
      );
    });

    it("should accept custom configuration", () => {
      const customConfig = {
        secret: mockSecret,
        cookieName: "custom-session",
        duration: 3600,
        secure: true,
        sameSite: "strict" as const,
      };

      const manager = new SessionManager(customConfig);
      const cookieOptions = manager.getCookieOptions();

      expect(cookieOptions.name).toBe("custom-session");
      expect(cookieOptions.maxAge).toBe(3600);
      expect(cookieOptions.secure).toBe(true);
      expect(cookieOptions.sameSite).toBe("strict");
    });
  });

  describe("session creation", () => {
    it("should create a session token", async () => {
      const payload: Omit<SessionPayload, "exp" | "iat"> = {
        userId: "123",
        email: "test@example.com",
        name: "Test User",
      };

      const token = await sessionManager.createSession(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT format
    });
  });

  describe("session verification", () => {
    it("should verify a valid session token", async () => {
      const payload: Omit<SessionPayload, "exp" | "iat"> = {
        userId: "123",
        email: "test@example.com",
        name: "Test User",
      };

      const token = await sessionManager.createSession(payload);
      const verified = await sessionManager.verifySession(token);

      expect(verified).toBeDefined();
      expect(verified?.userId).toBe("123");
      expect(verified?.email).toBe("test@example.com");
      expect(verified?.name).toBe("Test User");
      expect(verified?.exp).toBeDefined();
      expect(verified?.iat).toBeDefined();
    });

    it("should return null for invalid token", async () => {
      const verified = await sessionManager.verifySession("invalid-token");
      expect(verified).toBeNull();
    });

    it("should return null for expired token", async () => {
      // Create a session manager with very short duration
      const shortManager = new SessionManager({
        secret: mockSecret,
        duration: -1, // Already expired
      });

      const token = await shortManager.createSession({
        userId: "123",
        email: "test@example.com",
        name: "Test User",
      });

      const verified = await shortManager.verifySession(token);
      expect(verified).toBeNull();
    });
  });

  describe("session refresh", () => {
    it("should refresh a valid session", async () => {
      const payload: Omit<SessionPayload, "exp" | "iat"> = {
        userId: "123",
        email: "test@example.com",
        name: "Test User",
      };

      const originalToken = await sessionManager.createSession(payload);

      // Add a small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const refreshedToken = await sessionManager.refreshSession(originalToken);

      expect(refreshedToken).toBeDefined();
      expect(refreshedToken).not.toBe(originalToken);

      const verified = await sessionManager.verifySession(refreshedToken!);
      expect(verified?.userId).toBe("123");
    });

    it("should return null for invalid token refresh", async () => {
      const refreshedToken =
        await sessionManager.refreshSession("invalid-token");
      expect(refreshedToken).toBeNull();
    });
  });

  describe("cookie options", () => {
    it("should return default cookie options", () => {
      const options = sessionManager.getCookieOptions();

      expect(options).toEqual({
        name: "session-token",
        httpOnly: true,
        secure: false, // Not in production
        sameSite: "lax",
        maxAge: 60 * 60 * 8, // 8 hours
        path: "/",
      });
    });

    it("should allow custom maxAge", () => {
      const options = sessionManager.getCookieOptions(3600);
      expect(options.maxAge).toBe(3600);
    });

    it("should set secure cookie in production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const prodManager = new SessionManager({ secret: mockSecret });
      const options = prodManager.getCookieOptions();

      expect(options.secure).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });
  });
});
