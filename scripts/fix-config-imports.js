#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Files to update
const filesToUpdate = [
  "app/api/auth/magic-link/route.ts",
  "app/auth/callback/route.ts",
  "lib/auth/providers/entraid-provider.ts",
  "lib/auth/providers/entraid-utils.ts",
  "lib/auth/providers/factory.ts",
  "lib/auth/custom-auth-config.ts",
  "lib/auth/session.ts",
  "lib/compliance/audit-logger.ts",
  "lib/compliance/security-headers.ts",
];

const webDir = path.join(__dirname, "../apps/web");

filesToUpdate.forEach((file) => {
  const filePath = path.join(webDir, file);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, "utf8");

    // Replace imports of config from @monorepo/config with @/lib/config
    content = content.replace(
      /import\s*{\s*config\s*}\s*from\s*['"]@monorepo\/config['"]/g,
      "import { config } from '@/lib/config'",
    );

    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed imports in: ${file}`);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log("\n✅ Import fixes complete!");
