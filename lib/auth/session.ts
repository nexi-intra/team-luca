import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'session-token';
const SESSION_DURATION = 60 * 60 * 8; // 8 hours

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  exp?: number;
  iat?: number;
}

export class SessionManager {
  private static secret: Uint8Array;

  private static getSecret(): Uint8Array {
    if (!SessionManager.secret) {
      const secret = process.env.SESSION_SECRET;
      if (!secret) {
        throw new Error('SESSION_SECRET environment variable is not set');
      }
      SessionManager.secret = new TextEncoder().encode(secret);
    }
    return SessionManager.secret;
  }

  static async createSession(payload: Omit<SessionPayload, 'exp' | 'iat'>): Promise<string> {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${SESSION_DURATION}s`)
      .sign(SessionManager.getSecret());

    return token;
  }

  static async verifySession(token: string): Promise<SessionPayload | null> {
    try {
      const { payload } = await jwtVerify(token, SessionManager.getSecret());
      return payload as unknown as SessionPayload;
    } catch (error) {
      console.error('Session verification failed:', error);
      return null;
    }
  }

  static async getSession(request?: NextRequest): Promise<SessionPayload | null> {
    const cookieStore = request ? request.cookies : cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    return SessionManager.verifySession(token);
  }

  static async setSessionCookie(token: string, response?: NextResponse): Promise<void> {
    const cookieOptions = {
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: SESSION_DURATION,
      path: '/',
    };

    if (response) {
      response.cookies.set(cookieOptions);
    } else {
      cookies().set(cookieOptions);
    }
  }

  static async clearSession(response?: NextResponse): Promise<void> {
    const cookieOptions = {
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 0,
      path: '/',
    };

    if (response) {
      response.cookies.set(cookieOptions);
    } else {
      cookies().set(cookieOptions);
    }
  }

  static async refreshSession(request?: NextRequest): Promise<string | null> {
    const session = await SessionManager.getSession(request);
    if (!session) {
      return null;
    }

    const { userId, email, name } = session;
    return SessionManager.createSession({ userId, email, name });
  }
}

// Helper function for server components and API routes
export async function requireAuth(): Promise<SessionPayload> {
  const session = await SessionManager.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}

// Helper function for API routes
export function withAuth<T extends (...args: any[]) => any>(
  handler: T
): (...args: Parameters<T>) => Promise<NextResponse> {
  return async (...args: Parameters<T>): Promise<NextResponse> => {
    try {
      const request = args[0] as NextRequest;
      const session = await SessionManager.getSession(request);
      
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Add session to request context
      (request as any).session = session;
      
      return await handler(...args);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}