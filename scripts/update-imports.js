#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Define import mappings
const importMappings = [
  // Logger imports
  { from: /@\/lib\/logger/g, to: "@monorepo/logger" },

  // Config imports
  { from: /@\/lib\/config/g, to: "@monorepo/config" },

  // Telemetry imports
  { from: /@\/lib\/telemetry\/masking/g, to: "@monorepo/telemetry" },
  { from: /@\/lib\/telemetry\/processors/g, to: "@monorepo/telemetry" },
  { from: /@\/lib\/telemetry/g, to: "@monorepo/telemetry" },

  // Types imports - need to be more specific
  { from: /from ['"]@\/lib\/types\/auth['"]/g, to: "from '@monorepo/types'" },
  { from: /from ['"]@\/lib\/types\/api['"]/g, to: "from '@monorepo/types'" },
  { from: /from ['"]@\/lib\/types\/demo['"]/g, to: "from '@monorepo/types'" },
  { from: /from ['"]@\/lib\/types\/ui['"]/g, to: "from '@monorepo/types'" },
  { from: /from ['"]@\/lib\/types\/common['"]/g, to: "from '@monorepo/types'" },
  { from: /from ['"]@\/lib\/types['"]/g, to: "from '@monorepo/types'" },

  // Utils imports
  { from: /from ['"]@\/lib\/utils\/cn['"]/g, to: "from '@monorepo/utils'" },
  {
    from: /from ['"]@\/lib\/utils\/validation['"]/g,
    to: "from '@monorepo/utils'",
  },
  { from: /from ['"]@\/lib\/utils\/jwt['"]/g, to: "from '@monorepo/utils'" },
  { from: /from ['"]@\/lib\/utils\/crypto['"]/g, to: "from '@monorepo/utils'" },
  { from: /from ['"]@\/lib\/utils\/format['"]/g, to: "from '@monorepo/utils'" },
  {
    from: /from ['"]@\/lib\/utils\/test-utils['"]/g,
    to: "from '@monorepo/utils'",
  },
  { from: /from ['"]@\/lib\/utils['"]/g, to: "from '@monorepo/utils'" },

  // Auth imports
  { from: /@\/lib\/auth\/types/g, to: "@monorepo/auth" },
  { from: /@\/lib\/auth\/context/g, to: "@monorepo/auth" },
  { from: /@\/lib\/auth\/hooks/g, to: "@monorepo/auth" },
  { from: /@\/lib\/auth\/providers/g, to: "@monorepo/auth" },
  { from: /@\/lib\/auth\/session/g, to: "@monorepo/auth" },
  { from: /@\/lib\/auth\/utils/g, to: "@monorepo/auth" },
  { from: /@\/lib\/auth\/oauth/g, to: "@monorepo/auth" },
  { from: /@\/lib\/auth\/pkce/g, to: "@monorepo/auth" },
  { from: /@\/lib\/auth\/storage/g, to: "@monorepo/auth" },

  // Features imports
  { from: /@\/lib\/features\/types/g, to: "@monorepo/features" },
  { from: /@\/lib\/features\/constants/g, to: "@monorepo/features" },
  { from: /@\/lib\/features\/registry/g, to: "@monorepo/features" },
  { from: /@\/lib\/features\/storage/g, to: "@monorepo/features" },
  { from: /@\/lib\/features\/context/g, to: "@monorepo/features" },
  { from: /@\/lib\/features\/hooks/g, to: "@monorepo/features" },
  { from: /@\/lib\/features\/components/g, to: "@monorepo/features" },
  { from: /@\/lib\/features/g, to: "@monorepo/features" },
];

// Files to process
const appsWebDir = path.join(__dirname, "../apps/web");
const patterns = [
  "**/*.ts",
  "**/*.tsx",
  "!node_modules/**",
  "!.next/**",
  "!dist/**",
  "!build/**",
];

// Function to update imports in a file
function updateFileImports(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let hasChanges = false;

  for (const mapping of importMappings) {
    const newContent = content.replace(mapping.from, mapping.to);
    if (newContent !== content) {
      hasChanges = true;
      content = newContent;
    }
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated imports in: ${path.relative(appsWebDir, filePath)}`);
  }

  return hasChanges;
}

// Main function
async function main() {
  console.log("Updating imports in apps/web...\n");

  let totalUpdated = 0;

  for (const pattern of patterns) {
    const files = glob.sync(pattern, {
      cwd: appsWebDir,
      absolute: true,
    });

    for (const file of files) {
      if (updateFileImports(file)) {
        totalUpdated++;
      }
    }
  }

  console.log(`\nTotal files updated: ${totalUpdated}`);
}

// Run the script
main().catch(console.error);
