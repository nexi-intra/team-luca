/**
 * Client-side auth configuration
 *
 * This file provides direct access to auth environment variables on the client side.
 * It bypasses the complex config system which has issues with Next.js client-side env vars.
 */

export const getClientAuthConfig = () => {
  // These values are replaced at build time by Next.js
  // Always use current host for redirect URIs
  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin : "";

  return {
    provider: "entraid" as const,
    clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID || "",
    authority: process.env.NEXT_PUBLIC_AUTH_AUTHORITY || "",
    redirectUri: currentOrigin + "/",
    postLogoutRedirectUri: currentOrigin + "/",
  };
};
