import type { User } from "@monorepo/types";
import { BaseAuthProvider } from "./base-provider";
import type { AuthEvents } from "./types";

/**
 * No-auth provider for development or open access scenarios
 */
export class NoAuthProvider extends BaseAuthProvider {
  name: "none" = "none";

  constructor(events?: AuthEvents) {
    super(events);
  }

  async initialize(): Promise<void> {
    // Create a mock user for no-auth mode
    const mockUser: User = {
      id: "anonymous",
      email: "anonymous@localhost",
      name: "Anonymous User",
      givenName: "Anonymous",
      surname: "User",
    };

    this.setUser(mockUser);
  }

  async signIn(): Promise<void> {
    // No-op for no-auth provider
    console.log("Sign in called on no-auth provider");
  }

  async signOut(): Promise<void> {
    // No-op for no-auth provider
    console.log("Sign out called on no-auth provider");
  }

  async getAccessToken(): Promise<string | null> {
    // No access token in no-auth mode
    return null;
  }

  handleCallback(): Promise<void> {
    // No callback handling needed
    return Promise.resolve();
  }
}
