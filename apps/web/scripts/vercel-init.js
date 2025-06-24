#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function isVercelLinked() {
  try {
    const projectInfo = execSync("vercel project ls --json", {
      encoding: "utf-8",
    });
    const projects = JSON.parse(projectInfo);
    return projects && projects.length > 0;
  } catch (error) {
    return false;
  }
}

function pullEnvVars() {
  try {
    console.log("Pulling environment variables from Vercel...");

    // Pull development environment variables
    execSync("vercel env pull .env.local", { stdio: "inherit" });

    console.log(
      "✅ Successfully created .env.local file with Vercel environment variables",
    );

    // Check if the file was created
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      console.log(`📄 Environment variables saved to: ${envPath}`);

      // Remind about required environment variables
      console.log("\n📋 Required environment variables:");
      console.log("   - NEXT_PUBLIC_AZURE_AD_CLIENT_ID");
      console.log("   - NEXT_PUBLIC_AZURE_AD_TENANT_ID");
      console.log("   - NEXT_PUBLIC_AZURE_AD_REDIRECT_URI");
      console.log("   - ANTHROPIC_API_KEY");
      console.log("   - SESSION_SECRET");
      console.log("   - NEXT_PUBLIC_APP_URL");
      console.log("   - OTEL_SERVICE_NAME (optional)");
      console.log(
        "\nPlease ensure these are configured in your Vercel project settings.",
      );
    }
  } catch (error) {
    console.error("❌ Failed to pull environment variables from Vercel");
    console.error(error.message);
    process.exit(1);
  }
}

function main() {
  console.log("🔍 Checking Vercel connection...\n");

  if (!isVercelLinked()) {
    console.log("❌ This project is not linked to Vercel.\n");
    console.log("To link this project to Vercel, please follow these steps:\n");
    console.log("1. Run: vercel link");
    console.log(
      "2. Follow the prompts to link to an existing project or create a new one",
    );
    console.log("3. Once linked, run: npm run vercel:init\n");
    console.log(
      "For more information, visit: https://vercel.com/docs/cli/link",
    );
    process.exit(1);
  }

  console.log("✅ Project is linked to Vercel\n");
  pullEnvVars();
}

main();
