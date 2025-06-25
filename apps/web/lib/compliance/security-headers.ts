import { NextResponse } from "next/server";
import { config } from "@/lib/config";

export interface SecurityHeaders {
  [key: string]: string;
}

export function getSecurityHeaders(): SecurityHeaders {
  const isDevelopment = process.env.NODE_ENV === "development";

  const headers: SecurityHeaders = {
    // Prevent XSS attacks
    "X-XSS-Protection": "1; mode=block",

    // Prevent clickjacking
    "X-Frame-Options": "DENY",

    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",

    // Force HTTPS (only in production)
    ...(isDevelopment
      ? {}
      : {
          "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        }),

    // Referrer policy for privacy
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Permissions policy (formerly Feature Policy)
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  };

  // CSP has been removed - can be re-enabled later with proper Next.js integration

  return headers;
}

// CSP functions have been removed - CSP is no longer implemented

export function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers = getSecurityHeaders();

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
