import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { parseMarkdownScript } from "@/lib/demo/parser";

export async function GET() {
  try {
    const demoDir = path.join(process.cwd(), "..", "..", "demo");
    const files = await fs.readdir(demoDir);

    const scripts = await Promise.all(
      files
        .filter((file) => file.endsWith(".md"))
        .map(async (file) => {
          const content = await fs.readFile(path.join(demoDir, file), "utf-8");
          return parseMarkdownScript(content);
        }),
    );

    return NextResponse.json(scripts);
  } catch (error) {
    console.error("Failed to load demo scripts:", error);
    return NextResponse.json([], { status: 500 });
  }
}
