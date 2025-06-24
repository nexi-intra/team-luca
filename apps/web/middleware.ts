import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SessionManager } from "@/lib/auth/session";
import {
  applySecurityHeaders,
  generateNonce,
} from "@/lib/compliance/security-headers";
import { auditLogger } from "@/lib/compliance/audit-logger";

// Define protected routes that require authentication
const protectedRoutes = ["/api/protected", "/dashboard", "/admin", "/settings"];

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/api/auth/session",
  "/api/auth/session/refresh",
  "/api/health",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Generate CSP nonce
  const nonce = generateNonce();

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route),
  );

  // Create response
  let response: NextResponse;

  // Skip authentication check for public routes
  if (isPublicRoute) {
    response = NextResponse.next();
  } else if (isProtectedRoute) {
    // Check session for protected routes
    const session = await SessionManager.getSession(request);

    if (!session) {
      // Log failed access attempt
      await auditLogger.logAuthEvent(
        "permission_denied",
        undefined,
        request,
        "failure",
        { path: pathname },
      );

      // For API routes, return 401
      if (pathname.startsWith("/api/")) {
        response = NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 },
        );
      } else {
        // For pages, redirect to home
        const url = new URL("/", request.url);
        url.searchParams.set("from", pathname);
        response = NextResponse.redirect(url);
      }
    } else {
      // Add session data to request headers for server components
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", session.userId);
      requestHeaders.set("x-user-email", session.email);
      requestHeaders.set("x-user-name", session.name);
      requestHeaders.set("x-nonce", nonce);

      response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  } else {
    response = NextResponse.next();
  }

  // Apply security headers to all responses
  response = applySecurityHeaders(response, nonce);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
