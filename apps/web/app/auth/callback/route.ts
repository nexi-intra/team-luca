import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AuthCallbackRoute');

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const provider = config.get<string>('auth.provider');
  
  logger.info('Auth callback received', { 
    provider,
    hasCode: requestUrl.searchParams.has('code'),
    hasError: requestUrl.searchParams.has('error')
  });

  // For Supabase, the client-side handler will process the callback
  if (provider === 'supabase') {
    // Redirect to home and let the client-side handle the auth
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }

  // For Entra ID, the client-side handler will process the callback
  if (provider === 'entraid') {
    // The client-side auth provider will handle the callback
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Callback</title>
        </head>
        <body>
          <script>
            // Let the client-side auth provider handle the callback
            window.location.href = '/auth/callback' + window.location.search;
          </script>
          <p>Processing authentication...</p>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }

  // For unknown providers or 'none', redirect to home
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}