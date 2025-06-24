import { NextRequest, NextResponse } from "next/server";
import { magicAuth } from "@/lib/auth/magic-auth";
import { config } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const { token, route } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Validate the token
    const isValid = await magicAuth.validateToken(token);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    // Generate magic link
    const baseUrl = config.getOrDefault(
      "general.appUrl",
      request.nextUrl.origin,
    );
    const magicLink = magicAuth.generateMagicLink(baseUrl, token, route);

    return NextResponse.json({ magicLink });
  } catch (error) {
    console.error("Magic link generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate magic link" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  try {
    // Validate token and create session
    const session = await magicAuth.createSessionFromToken(token);

    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      valid: true,
      user: session.user,
    });
  } catch (error) {
    console.error("Token validation failed:", error);
    return NextResponse.json(
      { error: "Token validation failed" },
      { status: 500 },
    );
  }
}
