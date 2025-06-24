import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/auth/session';

// POST /api/auth/session/refresh - Refresh session
export async function POST(request: NextRequest) {
  try {
    const newToken = await SessionManager.refreshSession(request);
    
    if (!newToken) {
      return NextResponse.json(
        { error: 'No active session to refresh' },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      { success: true, message: 'Session refreshed' },
      { status: 200 }
    );

    await SessionManager.setSessionCookie(newToken, response);

    return response;
  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    );
  }
}