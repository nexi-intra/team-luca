import { NextResponse } from 'next/server';

export interface SecurityHeaders {
  [key: string]: string;
}

export function getSecurityHeaders(nonce?: string): SecurityHeaders {
  const headers: SecurityHeaders = {
    // Prevent XSS attacks
    'X-XSS-Protection': '1; mode=block',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Force HTTPS
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    
    // Referrer policy for privacy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions policy (formerly Feature Policy)
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  };

  // Content Security Policy
  if (nonce) {
    headers['Content-Security-Policy'] = getContentSecurityPolicy(nonce);
  }

  return headers;
}

export function getContentSecurityPolicy(nonce: string): string {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const directives = [
    `default-src 'self'`,
    // In development, we need 'unsafe-eval' for Next.js hot reload
    isDevelopment 
      ? `script-src 'self' 'unsafe-eval' 'unsafe-inline'`
      : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https: blob:`,
    `font-src 'self' data:`,
    `connect-src 'self' https://login.microsoftonline.com https://graph.microsoft.com wss: https:`,
    `media-src 'self'`,
    `object-src 'none'`,
    `child-src 'self'`,
    `frame-src 'self' https://login.microsoftonline.com`,
    `worker-src 'self' blob:`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `manifest-src 'self'`,
    `upgrade-insecure-requests`,
  ];

  return directives.join('; ');
}

export function applySecurityHeaders(response: NextResponse, nonce?: string): NextResponse {
  const headers = getSecurityHeaders(nonce);
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Generate a random nonce for CSP
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64');
}