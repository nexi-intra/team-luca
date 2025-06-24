import { SignJWT, jwtVerify } from "jose";
import type { SessionPayload } from "@monorepo/types";

/**
 * Session configuration
 */
export interface SessionConfig {
  secret: string;
  cookieName?: string;
  duration?: number; // in seconds
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
}

/**
 * Session manager for server-side session handling
 */
export class SessionManager {
  private config: Required<SessionConfig>;
  private secret: Uint8Array;

  constructor(config: SessionConfig) {
    this.config = {
      cookieName: "session-token",
      duration: 60 * 60 * 8, // 8 hours
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      ...config,
    };

    if (!config.secret || config.secret.length < 32) {
      throw new Error("Session secret must be at least 32 characters long");
    }

    this.secret = new TextEncoder().encode(config.secret);
  }

  /**
   * Create a session token
   */
  async createSession(
    payload: Omit<SessionPayload, "exp" | "iat">,
  ): Promise<string> {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${this.config.duration}s`)
      .sign(this.secret);

    return token;
  }

  /**
   * Verify and decode a session token
   */
  async verifySession(token: string): Promise<SessionPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secret);
      return payload as unknown as SessionPayload;
    } catch (error) {
      console.error("Session verification failed:", error);
      return null;
    }
  }

  /**
   * Get cookie options
   */
  getCookieOptions(maxAge?: number): {
    name: string;
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax" | "strict" | "none";
    maxAge: number;
    path: string;
  } {
    return {
      name: this.config.cookieName,
      httpOnly: true,
      secure: this.config.secure,
      sameSite: this.config.sameSite,
      maxAge: maxAge ?? this.config.duration,
      path: "/",
    };
  }

  /**
   * Refresh a session by creating a new token with updated expiration
   */
  async refreshSession(token: string): Promise<string | null> {
    const session = await this.verifySession(token);
    if (!session) {
      return null;
    }

    const { userId, email, name } = session;
    return this.createSession({ userId, email, name });
  }
}

/**
 * Create a session manager with default configuration
 */
export function createSessionManager(secret: string): SessionManager {
  return new SessionManager({ secret });
}
