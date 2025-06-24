import { NextRequest, NextResponse } from 'next/server';
import { customAuthConfig } from '@/lib/auth/custom-auth-config';
import { AuthLogger } from '@/lib/auth/logger';

// Create logger instance
const logger = new AuthLogger('API /auth/token');

export async function POST(request: NextRequest) {
  logger.info('Token exchange request received');
  try {
    const { code, codeVerifier, redirectUri } = await request.json();
    logger.info('Request body', { 
      hasCode: !!code, 
      hasCodeVerifier: !!codeVerifier,
      redirectUri 
    });

    if (!code || !codeVerifier) {
      logger.info('Missing required parameters');
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Exchange authorization code for tokens
    const tokenEndpoint = `${customAuthConfig.authority}/oauth2/v2.0/token`;
    const tokenParams = {
      grant_type: 'authorization_code',
      client_id: customAuthConfig.clientId,
      code,
      redirect_uri: redirectUri || customAuthConfig.redirectUri,
      code_verifier: codeVerifier,
      scope: customAuthConfig.scopes.join(' ')
    };
    
    logger.info('Token exchange request', {
      endpoint: tokenEndpoint,
      params: { ...tokenParams, code: tokenParams.code.substring(0, 10) + '...', code_verifier: '***' }
    });
    
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenParams)
    });
    
    logger.info('Token response status', tokenResponse.status);

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      logger.info('Token exchange failed', { status: tokenResponse.status, error });
      logger.error('Token exchange failed:', error);
      return NextResponse.json(
        { error: 'Failed to exchange code for tokens' },
        { status: tokenResponse.status }
      );
    }

    const tokens = await tokenResponse.json();
    logger.info('Tokens received', { 
      hasAccessToken: !!tokens.access_token,
      hasIdToken: !!tokens.id_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expires_in
    });

    // Decode the ID token to get user info
    const idTokenPayload = JSON.parse(
      Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()
    );
    logger.info('ID token payload', idTokenPayload);

    // Calculate token expiration
    const expiresAt = Date.now() + (tokens.expires_in * 1000);
    logger.info('Token expiration', { 
      expiresIn: tokens.expires_in,
      expiresAt: new Date(expiresAt).toISOString()
    });

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

    // Return user data and tokens
    const responseData = {
      user: {
        id: idTokenPayload.sub || idTokenPayload.oid,
        email: idTokenPayload.email || idTokenPayload.preferred_username,
        name: idTokenPayload.name,
        displayName: idTokenPayload.name, // For compatibility
        picture: userPhoto || idTokenPayload.picture,
        roles: idTokenPayload.roles || [],
        source: 'entraid', // Change to 'entraid' since we're using Entra ID
        metadata: {}
      },
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt
    };
    
    logger.info('Sending response', { 
      userId: responseData.user.id,
      userEmail: responseData.user.email,
      hasAccessToken: !!responseData.accessToken,
      hasRefreshToken: !!responseData.refreshToken
    });
    
    return NextResponse.json(responseData);
  } catch (error) {
    logger.info('Token exchange error:', error);
    logger.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}