import { NextRequest, NextResponse } from "next/server";
import { AuthLogger } from "@/lib/auth/logger";

const logger = new AuthLogger("API /auth/photo");

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = authHeader.split(" ")[1];

    logger.info("Fetching user photo from Microsoft Graph");
    const photoResponse = await fetch(
      "https://graph.microsoft.com/v1.0/me/photo/$value",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!photoResponse.ok) {
      logger.info("User photo not available", { status: photoResponse.status });
      return NextResponse.json(
        { error: "Photo not found" },
        { status: photoResponse.status },
      );
    }

    const photoBlob = await photoResponse.blob();
    const photoBuffer = await photoBlob.arrayBuffer();

    // Return the photo as a response with proper content type
    return new NextResponse(photoBuffer, {
      headers: {
        "Content-Type": photoBlob.type,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    logger.error("Error fetching user photo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
