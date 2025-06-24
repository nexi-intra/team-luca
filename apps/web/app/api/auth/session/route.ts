import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/auth/session';

// POST /api/auth/session - Create a new session
export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // TODO: Validate the token with Azure AD
    // For now, we'll trust the client-provided data
    // In production, you should validate the token with Microsoft Graph or your backend
    // const token = authHeader.substring(7);

    // Get user data from request body
    const body = await request.json();
    const { userId, email, name } = body;

    if (!userId || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required user data' },
        { status: 400 }
      );
    }

    // Create session token
    const sessionToken = await SessionManager.createSession({
      userId,
      email,
      name,
    });

    // Create response
    const response = NextResponse.json(
      { success: true, message: 'Session created' },
      { status: 200 }
    );

    // Set session cookie
    await SessionManager.setSessionCookie(sessionToken, response);

    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// DELETE /api/auth/session - Clear session
export async function DELETE(_request: NextRequest) {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Session cleared' },
      { status: 200 }
    );

    await SessionManager.clearSession(response);

    return response;
  } catch (error) {
    console.error('Session deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to clear session' },
      { status: 500 }
    );
  }
}

// GET /api/auth/session - Get current session
export async function GET(request: NextRequest) {
  try {
    const session = await SessionManager.getSession(request);
    
    if (!session) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      session: {
        userId: session.userId,
        email: session.email,
        name: session.name,
      }
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}