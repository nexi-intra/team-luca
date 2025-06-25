import { IAuthProvider, AuthProviderConfig } from "./types";
import { User } from "../types";
import { createLogger } from "@monorepo/logger";
import {
  generateCodeChallenge,
  generateCodeVerifier,
} from "../custom-auth-utils";
import { handleAuthCallback, refreshAccessToken } from "./entraid-utils";
import { config } from "@/lib/config";

const logger = createLogger("EntraIDAuthProvider");

/**
 * Microsoft Entra ID (Azure AD) authentication provider
 */
export class EntraIDAuthProvider implements IAuthProvider {
  name: "entraid" = "entraid";
  private currentUser: User | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();
  private config: AuthProviderConfig;
  private refreshTimer: NodeJS.Timeout | null = null;
  private isProcessingCallback = false;
  private processedCodes = new Set<string>();

  constructor(config: AuthProviderConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    // Check for existing user in localStorage
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;

        // Check if token is still valid
        if (user.expiresAt && new Date(user.expiresAt) > new Date()) {
          this.currentUser = user;
          this.notifyListeners();
          this.scheduleTokenRefresh(user);
        } else if (user.refreshToken) {
          // Try to refresh the token
          await this.refreshToken(user);
        } else {
          // Token expired and no refresh token
          localStorage.removeItem("auth_user");
        }
      } catch (error) {
        logger.error("Failed to restore user session", error);
        localStorage.removeItem("auth_user");
      }
    }

    // Handle auth callback if we have auth parameters in the URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (
        params.has("code") &&
        params.has("state") &&
        !this.isProcessingCallback
      ) {
        await this.handleCallback();
      }
    }
  }

  async signIn(options?: { mode?: "popup" | "redirect" }): Promise<void> {
    const mode = options?.mode || "popup"; // Default to popup
    const { clientId, authority, redirectUri, scopes } = this.config;

    if (!clientId || !authority) {
      throw new Error(
        "Client ID and authority are required for Entra ID authentication",
      );
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = crypto.randomUUID();

    // Store for callback
    sessionStorage.setItem("pkce_code_verifier", codeVerifier);
    sessionStorage.setItem("auth_state", state);

    if (mode === "popup") {
      sessionStorage.setItem("auth_popup", "true");
    }

    const authUrl = new URL(`${authority}/oauth2/v2.0/authorize`);
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("response_type", "code");

    // Always use the current host with root path as callback
    const callbackUrl = window.location.origin + "/";
    authUrl.searchParams.append("redirect_uri", callbackUrl);
    authUrl.searchParams.append(
      "scope",
      (
        scopes || ["openid", "profile", "email", "offline_access", "User.Read"]
      ).join(" "),
    );
    authUrl.searchParams.append("code_challenge", codeChallenge);
    authUrl.searchParams.append("code_challenge_method", "S256");
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("prompt", "select_account");

    if (mode === "redirect") {
      // Traditional redirect flow
      window.location.href = authUrl.toString();
      return;
    }

    // Popup flow
    const popupWidth = 500;
    const popupHeight = 600;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    const popup = window.open(
      authUrl.toString(),
      "EntraIDAuth",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},popup=yes`,
    );

    if (!popup) {
      throw new Error(
        "Failed to open authentication popup. Please allow popups for this site.",
      );
    }

    // Monitor the popup
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(checkInterval);
            // Check if authentication was successful
            const authUser = localStorage.getItem("auth_user");
            if (authUser) {
              resolve();
            } else {
              reject(new Error("Authentication cancelled"));
            }
          }
        } catch (e) {
          // Ignore cross-origin errors
        }
      }, 500);

      // Listen for messages from the popup
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === "auth-success") {
          clearInterval(checkInterval);
          window.removeEventListener("message", messageHandler);
          popup.close();

          // Load the user data from localStorage that was set by the popup
          const authUserStr = localStorage.getItem("auth_user");
          if (authUserStr) {
            try {
              const authUser = JSON.parse(authUserStr);
              this.currentUser = authUser;
              this.notifyListeners();
              this.scheduleTokenRefresh(authUser);
            } catch (e) {
              logger.error("Failed to parse auth user from localStorage", e);
            }
          }

          resolve();
        } else if (event.data.type === "auth-error") {
          clearInterval(checkInterval);
          window.removeEventListener("message", messageHandler);
          popup.close();
          reject(new Error(event.data.error || "Authentication failed"));
        }
      };

      window.addEventListener("message", messageHandler);
    });
  }

  async signOut(): Promise<void> {
    const { authority, clientId, postLogoutRedirectUri } = this.config;

    // Clear stored user data
    localStorage.removeItem("auth_user");
    this.currentUser = null;
    this.notifyListeners();

    // Clear refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    if (authority && clientId) {
      const logoutUrl = new URL(`${authority}/oauth2/v2.0/logout`);
      logoutUrl.searchParams.append(
        "post_logout_redirect_uri",
        window.location.origin + "/",
      );
      window.location.href = logoutUrl.toString();
    }
  }

  getUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return (
      this.currentUser !== null &&
      this.currentUser.expiresAt !== null &&
      new Date(this.currentUser.expiresAt) > new Date()
    );
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.currentUser) {
      return null;
    }

    // Check if token needs refresh
    if (
      this.currentUser.expiresAt &&
      new Date(this.currentUser.expiresAt) <= new Date()
    ) {
      if (this.currentUser.refreshToken) {
        await this.refreshToken(this.currentUser);
      } else {
        return null;
      }
    }

    return this.currentUser.accessToken;
  }

  async handleCallback(code?: string, state?: string): Promise<void> {
    // Prevent duplicate processing
    if (this.isProcessingCallback) {
      logger.info("Already processing callback, skipping");
      return;
    }

    this.isProcessingCallback = true;

    const params = new URLSearchParams(window.location.search);
    code = code || params.get("code") || undefined;
    state = state || params.get("state") || undefined;

    if (!code) {
      logger.error("No authorization code in callback");
      this.isProcessingCallback = false;
      throw new Error("No authorization code received");
    }

    // Check if we've already processed this code
    if (this.processedCodes.has(code)) {
      logger.info("Code already processed, skipping", {
        code: code.substring(0, 10) + "...",
      });
      this.isProcessingCallback = false;
      return;
    }

    // Mark this code as processed
    this.processedCodes.add(code);

    try {
      const result = await handleAuthCallback(code, state);

      if (result.success && result.user) {
        this.currentUser = result.user;
        localStorage.setItem("auth_user", JSON.stringify(result.user));
        this.notifyListeners();
        this.scheduleTokenRefresh(result.user);

        // Check if this is a popup authentication
        const isPopup = sessionStorage.getItem("auth_popup") === "true";
        sessionStorage.removeItem("auth_popup");

        if (isPopup) {
          // Clean up the URL in the popup too
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);

          // Send success message to parent window
          if (window.opener) {
            window.opener.postMessage({ type: "auth-success" }, "*");
          }
          // The popup will be closed by the parent window
        } else {
          // Clean up the URL by removing auth parameters
          const redirectUrl =
            sessionStorage.getItem("auth_redirect_url") || "/";
          sessionStorage.removeItem("auth_redirect_url");

          // Use replaceState to remove the auth parameters from the URL without adding to history
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);

          // Navigate to the intended destination
          window.location.href = redirectUrl;
        }
      } else {
        throw new Error(result.error || "Authentication failed");
      }
    } catch (error) {
      logger.error("Failed to handle auth callback", error);

      // Check if this is a popup authentication
      const isPopup = sessionStorage.getItem("auth_popup") === "true";
      sessionStorage.removeItem("auth_popup");

      if (isPopup && window.opener) {
        // Send error message to parent window
        window.opener.postMessage(
          {
            type: "auth-error",
            error:
              error instanceof Error ? error.message : "Authentication failed",
          },
          "*",
        );
      }

      this.isProcessingCallback = false;
      throw error;
    } finally {
      // Always reset the flag after processing
      this.isProcessingCallback = false;
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.listeners.add(callback);
    // Immediately call with current state
    callback(this.currentUser);

    return () => {
      this.listeners.delete(callback);
    };
  }

  requiresAuth(): boolean {
    return true;
  }

  getAuthState(): { isLoading: boolean; error: Error | null } {
    return {
      isLoading: false,
      error: null,
    };
  }

  private async refreshToken(user: User): Promise<void> {
    if (!user.refreshToken) {
      logger.warn("No refresh token available");
      return;
    }

    try {
      const refreshedUser = await refreshAccessToken(user.refreshToken);

      if (refreshedUser) {
        this.currentUser = refreshedUser;
        localStorage.setItem("auth_user", JSON.stringify(refreshedUser));
        this.notifyListeners();
        this.scheduleTokenRefresh(refreshedUser);
      } else {
        // Refresh failed, sign out
        await this.signOut();
      }
    } catch (error) {
      logger.error("Token refresh failed", error);
      await this.signOut();
    }
  }

  private scheduleTokenRefresh(user: User): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!user.expiresAt || !user.refreshToken) {
      return;
    }

    const expiresAt = new Date(user.expiresAt).getTime();
    const now = Date.now();
    const refreshIn = Math.max(0, expiresAt - now - 5 * 60 * 1000); // Refresh 5 minutes before expiry

    this.refreshTimer = setTimeout(() => {
      this.refreshToken(user);
    }, refreshIn);
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => {
      try {
        callback(this.currentUser);
      } catch (error) {
        logger.error("Error in auth state change listener", error);
      }
    });
  }
}
