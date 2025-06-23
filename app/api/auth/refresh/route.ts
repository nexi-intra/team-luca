import { NextRequest, NextResponse } from 'next/server';
import { customAuthConfig } from '@/lib/auth/custom-auth-config';
import { AuthLogger } from '@/lib/auth/logger';

const logger = new AuthLogger('API /auth/refresh');

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Missing refresh token' },
        { status: 400 }
      );
    }

    // Exchange refresh token for new tokens
    const tokenEndpoint = `${customAuthConfig.authority}/oauth2/v2.0/token`;
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: customAuthConfig.clientId,
        refresh_token: refreshToken,
        scope: customAuthConfig.scopes.join(' ')
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      logger.error('Token refresh failed:', error);
      return NextResponse.json(
        { error: 'Failed to refresh token' },
        { status: tokenResponse.status }
      );
    }

    const tokens = await tokenResponse.json();

    // Decode the ID token to get user info
    const idTokenPayload = JSON.parse(
      Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()
    );

    // Calculate token expiration
    const expiresAt = Date.now() + (tokens.expires_in * 1000);

    // Fetch user photo from Microsoft Graph
    let userPhoto = null;
    try {
      logger.info('Fetching user photo from Microsoft Graph');
      const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      });

      if (photoResponse.ok) {
        const photoBlob = await photoResponse.blob();
        const photoBuffer = await photoBlob.arrayBuffer();
        const photoBase64 = Buffer.from(photoBuffer).toString('base64');
        userPhoto = `data:${photoBlob.type};base64,${photoBase64}`;
        logger.info('User photo fetched successfully');
      } else {
        logger.info('User photo not available', { status: photoResponse.status });
      }
    } catch (photoError) {
      logger.warn('Error fetching user photo:', photoError);
      // Continue without photo
    }

    // Return updated user data and tokens
    return NextResponse.json({
      user: {
        id: idTokenPayload.sub || idTokenPayload.oid,
        email: idTokenPayload.email || idTokenPayload.preferred_username,
        name: idTokenPayload.name,
        displayName: idTokenPayload.name, // For compatibility
        picture: userPhoto || idTokenPayload.picture,
        roles: idTokenPayload.roles || [],
        source: 'entraid',
        metadata: {}
      },
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || refreshToken, // Some providers don't return new refresh token
      expiresAt
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}