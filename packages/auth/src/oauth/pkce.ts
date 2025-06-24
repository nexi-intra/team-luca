import { generateState, generatePKCE } from "@monorepo/utils";

/**
 * OAuth state management
 */
export interface OAuthState {
  state: string;
  codeVerifier: string;
  redirectUri: string;
  timestamp: number;
}

/**
 * OAuth configuration
 */
export interface OAuthConfig {
  clientId: string;
  authority: string;
  redirectUri: string;
  scopes: string[];
  postLogoutRedirectUri?: string;
}

/**
 * Generate OAuth state and PKCE parameters
 */
export async function generateOAuthParams(): Promise<{
  state: string;
  codeChallenge: string;
  codeVerifier: string;
}> {
  const state = generateState();
  const { verifier, challenge } = await generatePKCE();

  return {
    state,
    codeChallenge: challenge,
    codeVerifier: verifier,
  };
}

/**
 * Build authorization URL
 */
export function buildAuthorizationUrl(
  config: OAuthConfig,
  params: {
    state: string;
    codeChallenge: string;
  },
): string {
  const url = new URL(`${config.authority}/oauth2/v2.0/authorize`);

  url.searchParams.append("client_id", config.clientId);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("redirect_uri", config.redirectUri);
  url.searchParams.append("scope", config.scopes.join(" "));
  url.searchParams.append("state", params.state);
  url.searchParams.append("code_challenge", params.codeChallenge);
  url.searchParams.append("code_challenge_method", "S256");
  url.searchParams.append("response_mode", "query");

  return url.toString();
}

/**
 * Build logout URL
 */
export function buildLogoutUrl(
  config: OAuthConfig,
  postLogoutRedirectUri?: string,
): string {
  const url = new URL(`${config.authority}/oauth2/v2.0/logout`);

  if (postLogoutRedirectUri || config.postLogoutRedirectUri) {
    url.searchParams.append(
      "post_logout_redirect_uri",
      postLogoutRedirectUri || config.postLogoutRedirectUri!,
    );
  }

  return url.toString();
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  config: OAuthConfig,
  code: string,
  codeVerifier: string,
): Promise<{
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn: number;
}> {
  const tokenUrl = `${config.authority}/oauth2/v2.0/token`;

  const params = new URLSearchParams({
    client_id: config.clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
    code_verifier: codeVerifier,
    scope: config.scopes.join(" "),
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(
  config: OAuthConfig,
  refreshToken: string,
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}> {
  const tokenUrl = `${config.authority}/oauth2/v2.0/token`;

  const params = new URLSearchParams({
    client_id: config.clientId,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: config.scopes.join(" "),
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}
