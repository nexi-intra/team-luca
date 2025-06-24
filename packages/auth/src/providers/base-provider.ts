import type { User } from "@monorepo/types";
import type { IAuthProvider, AuthState, AuthEvents } from "./types";

/**
 * Base authentication provider implementation
 */
export abstract class BaseAuthProvider implements IAuthProvider {
  protected state: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  protected listeners: ((user: User | null) => void)[] = [];
  protected events: AuthEvents = {};

  abstract name: "none" | "entraid" | "supabase";

  constructor(events?: AuthEvents) {
    this.events = events || {};
  }

  abstract initialize(): Promise<void>;
  abstract signIn(): Promise<void>;
  abstract signOut(): Promise<void>;
  abstract getAccessToken(): Promise<string | null>;

  getUser(): User | null {
    return this.state.user;
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  requiresAuth(): boolean {
    return this.name !== "none";
  }

  getAuthState(): { isLoading: boolean; error: Error | null } {
    return {
      isLoading: this.state.isLoading,
      error: this.state.error,
    };
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  protected notifyListeners(user: User | null): void {
    this.listeners.forEach((listener) => listener(user));
  }

  protected setLoading(isLoading: boolean): void {
    this.state.isLoading = isLoading;
  }

  protected setError(error: Error | null): void {
    this.state.error = error;
    if (error && this.events.onError) {
      this.events.onError(error);
    }
  }

  protected setUser(user: User | null): void {
    const wasAuthenticated = this.state.isAuthenticated;
    this.state.user = user;
    this.state.isAuthenticated = !!user;

    if (!wasAuthenticated && user && this.events.onSignIn) {
      this.events.onSignIn(user);
    } else if (wasAuthenticated && !user && this.events.onSignOut) {
      this.events.onSignOut();
    }

    this.notifyListeners(user);
  }
}
