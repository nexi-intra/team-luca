import { NextRequest, NextResponse } from "next/server";
import {
  verifyState,
  exchangeCodeForToken,
  getGitHubUser,
  saveGitHubAuth,
} from "@/lib/github/auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle user denial
    if (error) {
      return NextResponse.redirect(
        new URL("/scripts?github=cancelled", request.url),
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/scripts?github=error&message=missing_params", request.url),
      );
    }

    // Verify state to prevent CSRF
    const isValidState = await verifyState(state);
    if (!isValidState) {
      return NextResponse.redirect(
        new URL("/scripts?github=error&message=invalid_state", request.url),
      );
    }

    // Exchange code for token
    const token = await exchangeCodeForToken(code);

    // Get user info
    const user = await getGitHubUser(token.access_token);

    // Save auth info
    await saveGitHubAuth(token, user);

    return NextResponse.redirect(
      new URL("/scripts?github=connected", request.url),
    );
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/scripts?github=error&message=auth_failed", request.url),
    );
  }
}
