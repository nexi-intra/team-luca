"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import {
  AuthContextType,
  AuthSession,
  AuthUser,
  AuthConfig,
  StoredAuthData,
} from "./custom-auth-types";
import {
  saveAuthToStorage,
  getAuthFromStorage,
  clearAuthFromStorage,
  openAuthPopup,
  listenForAuthMessage,
  generateState,
  generatePKCE,
  isTokenExpired,
} from "./custom-auth-utils";
import { AuthLogger } from "./logger";

// Create logger instance
const logger = new AuthLogger("Auth Context");

const CustomAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useCustomAuth = () => {
  const context = useContext(CustomAuthContext);
  if (!context) {
    throw new Error("useCustomAuth must be used within a CustomAuthProvider");
  }
  return context;
};

interface CustomAuthProviderProps {
  children: React.ReactNode;
  config: AuthConfig;
}

export const CustomAuthProvider: React.FC<CustomAuthProviderProps> = ({
  children,
  config,
}) => {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const silentAuthIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const authWindowRef = useRef<Window | null>(null);

  // Initialize auth from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (config.persistence?.enabled) {
          const storedAuth = getAuthFromStorage();
          if (storedAuth) {
            // Check if token is still valid
            if (
              storedAuth.user.accessToken &&
              !isTokenExpired(storedAuth.user.accessToken)
            ) {
              setSession({
                user: storedAuth.user,
                isAuthenticated: true,
                isLoading: false,
              });
            } else if (storedAuth.refreshToken) {
              // Try to refresh the session
              await refreshSessionWithToken(storedAuth.refreshToken);
            }
          }
        }
      } catch (err) {
        logger.error("Error initializing auth:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.persistence?.enabled]);

  // Set up silent auth check interval
  useEffect(() => {
    if (config.silentAuth?.enabled && session?.isAuthenticated) {
      const interval = config.silentAuth.checkInterval || 5 * 60 * 1000; // 5 minutes default

      silentAuthIntervalRef.current = setInterval(() => {
        checkAndRefreshSession();
      }, interval);

      return () => {
        if (silentAuthIntervalRef.current) {
          clearInterval(silentAuthIntervalRef.current);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.silentAuth, session?.isAuthenticated]);

  const checkAndRefreshSession = useCallback(async () => {
    if (!session?.user.accessToken) return;

    if (isTokenExpired(session.user.accessToken)) {
      try {
        await refreshSession();
      } catch (err) {
        logger.warn("Silent refresh failed:", err);
        // Don't logout on silent refresh failure, let user continue
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const refreshSessionWithToken = useCallback(
    async (refreshToken: string) => {
      try {
        // This would call your backend to refresh the token
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          throw new Error("Failed to refresh session");
        }

        const data = await response.json();
        logger.info("Token response data:", {
          ...data,
          accessToken: data.accessToken ? "***" : undefined,
          refreshToken: data.refreshToken ? "***" : undefined,
        });

        const user: AuthUser = {
          ...data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
        };

        logger.info("Created user object:", {
          ...user,
          accessToken: "***",
          refreshToken: "***",
        });

        setSession({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        if (config.persistence?.enabled) {
          saveAuthToStorage(user, data.expiresAt, data.refreshToken);
        }
      } catch (err) {
        logger.error("Token refresh failed:", err);
        throw err;
      }
    },
    [config.persistence?.enabled],
  );

  const login = useCallback(
    async (hint?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const state = generateState();
        const { codeVerifier, codeChallenge } = await generatePKCE();

        // Store state and verifier for later verification
        sessionStorage.setItem("auth-state", state);
        sessionStorage.setItem("auth-verifier", codeVerifier);

        const params = new URLSearchParams({
          client_id: config.clientId,
          redirect_uri: config.redirectUri,
          response_type: "code",
          scope: config.scopes.join(" "),
          state,
          code_challenge: codeChallenge,
          code_challenge_method: "S256",
          ...(hint && { login_hint: hint }),
        });

        // Redirect to auth provider
        window.location.href = `${config.authority}/oauth2/v2.0/authorize?${params}`;
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    },
    [config],
  );

  const loginWithPopup = useCallback(
    async (hint?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const state = generateState();
        const { codeVerifier, codeChallenge } = await generatePKCE();

        // Store state and verifier for later verification
        sessionStorage.setItem("auth-state", state);
        sessionStorage.setItem("auth-verifier", codeVerifier);

        const params = new URLSearchParams({
          client_id: config.clientId,
          redirect_uri: config.redirectUri,
          response_type: "code",
          scope: config.scopes.join(" "),
          state,
          code_challenge: codeChallenge,
          code_challenge_method: "S256",
          display: "popup",
          ...(hint && { login_hint: hint }),
        });

        const authUrl = `${config.authority}/oauth2/v2.0/authorize?${params}`;
        authWindowRef.current = openAuthPopup(
          authUrl,
          config.popup?.width,
          config.popup?.height,
        );

        if (!authWindowRef.current) {
          throw new Error("Failed to open authentication popup");
        }

        // Listen for auth completion message
        const authData = await listenForAuthMessage();

        // Exchange code for tokens
        await handleAuthCallback(authData.code, authData.state);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      } finally {
        if (authWindowRef.current && !authWindowRef.current.closed) {
          authWindowRef.current.close();
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [config],
  );

  const handleAuthCallback = useCallback(
    async (code: string, state: string) => {
      try {
        // Verify state
        const savedState = sessionStorage.getItem("auth-state");
        if (state !== savedState) {
          throw new Error("Invalid state parameter");
        }

        const codeVerifier = sessionStorage.getItem("auth-verifier");
        if (!codeVerifier) {
          throw new Error("Code verifier not found");
        }

        // Exchange code for tokens
        const response = await fetch("/api/auth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            codeVerifier,
            redirectUri: config.redirectUri,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to exchange code for tokens");
        }

        const data = await response.json();
        logger.info("Token response data:", {
          ...data,
          accessToken: data.accessToken ? "***" : undefined,
          refreshToken: data.refreshToken ? "***" : undefined,
        });

        const user: AuthUser = {
          ...data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
        };

        logger.info("Created user object:", {
          ...user,
          accessToken: "***",
          refreshToken: "***",
        });

        setSession({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        if (config.persistence?.enabled) {
          saveAuthToStorage(user, data.expiresAt, data.refreshToken);
        }

        // Clean up
        sessionStorage.removeItem("auth-state");
        sessionStorage.removeItem("auth-verifier");

        // Important: Set loading to false after successful auth
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        throw err;
      }
    },
    [config.persistence?.enabled, config.redirectUri],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      // Call logout endpoint
      if (session?.user.accessToken) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        });
      }

      // Clear local state
      setSession(null);
      clearAuthFromStorage();

      // Redirect to logout URL
      const params = new URLSearchParams({
        client_id: config.clientId,
        logout_uri: config.postLogoutRedirectUri,
      });

      window.location.href = `${config.authority}/oauth2/v2.0/logout?${params}`;
    } catch (err) {
      logger.error("Logout error:", err);
      // Still clear local state even if logout request fails
      setSession(null);
      clearAuthFromStorage();
    } finally {
      setIsLoading(false);
    }
  }, [config, session]);

  const refreshSession = useCallback(async () => {
    if (!session?.user.refreshToken) {
      throw new Error("No refresh token available");
    }

    await refreshSessionWithToken(session.user.refreshToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Handle auth callback on initial load
  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const error = params.get("error");

      if (error) {
        setError(new Error(params.get("error_description") || error));
        setIsLoading(false);
        router.replace("/");
        return;
      }

      if (code && state) {
        try {
          await handleAuthCallback(code, state);
          router.replace("/");
        } catch (err) {
          logger.error("Auth callback error:", err);
          setIsLoading(false);
          router.replace("/");
        }
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const value: AuthContextType = {
    session,
    login,
    loginWithPopup,
    logout,
    refreshSession,
    isAuthenticated: session?.isAuthenticated || false,
    isLoading,
    user: session?.user || null,
    error,
  };

  return (
    <CustomAuthContext.Provider value={value}>
      {children}
    </CustomAuthContext.Provider>
  );
};
