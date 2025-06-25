"use client";

import { useState, useEffect } from "react";

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  email: string;
}

interface GitHubAuthState {
  authenticated: boolean;
  user: GitHubUser | null;
  authUrl: string | null;
  loading: boolean;
  error: string | null;
}

export function useGitHubAuth() {
  const [state, setState] = useState<GitHubAuthState>({
    authenticated: false,
    user: null,
    authUrl: null,
    loading: true,
    error: null,
  });

  const checkAuth = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await fetch("/api/auth/github");

      if (!response.ok) {
        throw new Error("Failed to check GitHub auth status");
      }

      const data = await response.json();
      setState({
        authenticated: data.authenticated,
        user: data.user || null,
        authUrl: data.authUrl || null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  };

  const connect = () => {
    if (state.authUrl) {
      window.location.href = state.authUrl;
    }
  };

  const disconnect = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const response = await fetch("/api/auth/github", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect GitHub");
      }

      await checkAuth();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  };

  useEffect(() => {
    checkAuth();

    // Check for OAuth callback parameters
    const params = new URLSearchParams(window.location.search);
    const githubStatus = params.get("github");

    if (githubStatus) {
      // Clean up URL
      params.delete("github");
      params.delete("message");
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState({}, "", newUrl);

      // Handle status
      if (githubStatus === "connected") {
        checkAuth();
      } else if (githubStatus === "error") {
        const message = params.get("message") || "Authentication failed";
        setState((prev) => ({
          ...prev,
          error: message,
        }));
      }
    }
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    refresh: checkAuth,
  };
}
