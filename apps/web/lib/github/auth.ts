import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const GITHUB_TOKEN_COOKIE = "github-token";
const GITHUB_USER_COOKIE = "github-user";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "");

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  email: string;
  company?: string;
  location?: string;
  bio?: string;
}

export interface GitHubToken {
  access_token: string;
  token_type: string;
  scope: string;
}

export async function getGitHubAuthUrl(): Promise<string> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri =
    process.env.GITHUB_REDIRECT_URI ||
    "http://localhost:50001/api/auth/github/callback";
  const scope = "repo user:email";

  if (!clientId) {
    throw new Error("GitHub client ID not configured");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope,
    state: await generateState(),
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

async function generateState(): Promise<string> {
  const state = crypto.randomUUID();
  const token = await new SignJWT({ state })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("10m")
    .sign(secret);

  return token;
}

export async function verifyState(state: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(state, secret);
    return !!payload.state;
  } catch {
    return false;
  }
}

export async function exchangeCodeForToken(code: string): Promise<GitHubToken> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri =
    process.env.GITHUB_REDIRECT_URI ||
    "http://localhost:50001/api/auth/github/callback";

  if (!clientId || !clientSecret) {
    throw new Error("GitHub OAuth not configured");
  }

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange code for token");
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error_description || data.error);
  }

  return data as GitHubToken;
}

export async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub user");
  }

  return response.json();
}

export async function saveGitHubAuth(
  token: GitHubToken,
  user: GitHubUser,
): Promise<void> {
  const cookieStore = await cookies();

  // Encrypt the token
  const encryptedToken = await new SignJWT({ token: token.access_token })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);

  cookieStore.set(GITHUB_TOKEN_COOKIE, encryptedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  cookieStore.set(
    GITHUB_USER_COOKIE,
    JSON.stringify({
      login: user.login,
      name: user.name,
      avatar_url: user.avatar_url,
      email: user.email,
    }),
    {
      httpOnly: false, // Allow client to read user info
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
  );
}

export async function getGitHubAuth(): Promise<{
  token: string;
  user: GitHubUser;
} | null> {
  const cookieStore = await cookies();
  const encryptedToken = cookieStore.get(GITHUB_TOKEN_COOKIE)?.value;
  const userJson = cookieStore.get(GITHUB_USER_COOKIE)?.value;

  if (!encryptedToken || !userJson) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(encryptedToken, secret);
    const token = payload.token as string;
    const user = JSON.parse(userJson);

    return { token, user };
  } catch {
    return null;
  }
}

export async function clearGitHubAuth(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(GITHUB_TOKEN_COOKIE);
  cookieStore.delete(GITHUB_USER_COOKIE);
}

export async function isGitHubAuthenticated(): Promise<boolean> {
  const auth = await getGitHubAuth();
  return !!auth;
}
