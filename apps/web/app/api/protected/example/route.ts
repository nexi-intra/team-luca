import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/session";

// Example of a protected API route
export const GET = withAuth(
  async (request: NextRequest & { session?: any }) => {
    const session = request.session;

    return NextResponse.json({
      message: "This is a protected route",
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
      },
      timestamp: new Date().toISOString(),
    });
  },
);

// Example of another protected endpoint
export const POST = withAuth(
  async (request: NextRequest & { session?: any }) => {
    const session = request.session;
    const body = await request.json();

    // Your protected logic here
    console.log(`User ${session.email} is performing an action:`, body);

    return NextResponse.json({
      success: true,
      message: "Action completed successfully",
      performedBy: session.email,
    });
  },
);
