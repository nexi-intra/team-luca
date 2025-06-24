import { NoAuthProvider } from "../../providers/no-auth-provider";

describe("NoAuthProvider", () => {
  let provider: NoAuthProvider;

  beforeEach(() => {
    provider = new NoAuthProvider();
  });

  describe("initialization", () => {
    it("should create an anonymous user on initialize", async () => {
      expect(provider.getUser()).toBeNull();

      await provider.initialize();

      const user = provider.getUser();
      expect(user).toBeDefined();
      expect(user?.id).toBe("anonymous");
      expect(user?.email).toBe("anonymous@localhost");
      expect(user?.name).toBe("Anonymous User");
    });

    it("should set isAuthenticated to true after initialization", async () => {
      expect(provider.isAuthenticated()).toBe(false);

      await provider.initialize();

      expect(provider.isAuthenticated()).toBe(true);
    });
  });

  describe("authentication", () => {
    it("should not require auth", () => {
      expect(provider.requiresAuth()).toBe(false);
    });

    it('should have name "none"', () => {
      expect(provider.name).toBe("none");
    });

    it("should handle signIn without error", async () => {
      await expect(provider.signIn()).resolves.not.toThrow();
    });

    it("should handle signOut without error", async () => {
      await expect(provider.signOut()).resolves.not.toThrow();
    });

    it("should return null for access token", async () => {
      const token = await provider.getAccessToken();
      expect(token).toBeNull();
    });
  });

  describe("auth state", () => {
    it("should return auth state", () => {
      const state = provider.getAuthState();
      expect(state).toEqual({
        isLoading: false,
        error: null,
      });
    });
  });

  describe("auth state changes", () => {
    it("should notify listeners when user changes", async () => {
      const listener = jest.fn();
      const unsubscribe = provider.onAuthStateChange(listener);

      await provider.initialize();

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "anonymous",
          email: "anonymous@localhost",
        }),
      );

      unsubscribe();
    });

    it("should allow unsubscribing from auth state changes", async () => {
      const listener = jest.fn();
      const unsubscribe = provider.onAuthStateChange(listener);

      unsubscribe();

      await provider.initialize();

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("events", () => {
    it("should trigger onSignIn event", async () => {
      const onSignIn = jest.fn();
      provider = new NoAuthProvider({ onSignIn });

      await provider.initialize();

      expect(onSignIn).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "anonymous",
          email: "anonymous@localhost",
        }),
      );
    });
  });
});
