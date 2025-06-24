import { IAuthProvider } from "./types";
import { User } from "../types";

/**
 * No-auth provider for when authentication is disabled
 */
export class NoAuthProvider implements IAuthProvider {
  name: "none" = "none";
  private listeners: Set<(user: User | null) => void> = new Set();

  async initialize(): Promise<void> {
    // No initialization needed
  }

  async signIn(): Promise<void> {
    // No-op - no authentication
  }

  async signOut(): Promise<void> {
    // No-op - no authentication
  }

  getUser(): User | null {
    // Return a default user when auth is disabled
    return {
      id: "anonymous",
      email: "anonymous@localhost",
      name: "Anonymous User",
      givenName: "Anonymous",
      surname: "User",
      jobTitle: "User",
      officeLocation: "Local",
      preferredLanguage: "en",
      accessToken: null,
      idToken: null,
      refreshToken: null,
      expiresAt: null,
      photo: null,
    };
  }

  isAuthenticated(): boolean {
    // Always authenticated in no-auth mode
    return true;
  }

  async getAccessToken(): Promise<string | null> {
    return null;
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.listeners.add(callback);
    // Immediately call with the anonymous user
    callback(this.getUser());

    return () => {
      this.listeners.delete(callback);
    };
  }

  requiresAuth(): boolean {
    return false;
  }

  getAuthState(): { isLoading: boolean; error: Error | null } {
    return {
      isLoading: false,
      error: null,
    };
  }
}
