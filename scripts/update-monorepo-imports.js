#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define import update rules
const updateRules = [
  // Logger - simple replacement
  {
    pattern: /from\s+['"]@\/lib\/logger['"]/g,
    replacement: "from '@monorepo/logger'"
  },
  
  // Config - simple replacement  
  {
    pattern: /from\s+['"]@\/lib\/config['"]/g,
    replacement: "from '@monorepo/config'"
  },
  
  // Telemetry - multiple paths
  {
    pattern: /from\s+['"]@\/lib\/telemetry\/masking['"]/g,
    replacement: "from '@monorepo/telemetry'"
  },
  {
    pattern: /from\s+['"]@\/lib\/telemetry\/processors['"]/g,
    replacement: "from '@monorepo/telemetry'"
  },
  {
    pattern: /from\s+['"]@\/lib\/telemetry['"]/g,
    replacement: "from '@monorepo/telemetry'"
  },
  
  // Types - all subpaths go to main types package
  {
    pattern: /from\s+['"]@\/lib\/types\/\w+['"]/g,
    replacement: "from '@monorepo/types'"
  },
  {
    pattern: /from\s+['"]@\/lib\/types['"]/g,
    replacement: "from '@monorepo/types'"
  },
  
  // Utils - all subpaths
  {
    pattern: /from\s+['"]@\/lib\/utils\/\w+['"]/g,
    replacement: "from '@monorepo/utils'"
  },
  {
    pattern: /from\s+['"]@\/lib\/utils['"]/g,
    replacement: "from '@monorepo/utils'"
  },
  
  // Auth - complex paths
  {
    pattern: /from\s+['"]@\/lib\/auth\/types['"]/g,
    replacement: "from '@monorepo/auth'"
  },
  {
    pattern: /from\s+['"]@\/lib\/auth\/context['"]/g,
    replacement: "from '@monorepo/auth'"
  },
  {
    pattern: /from\s+['"]@\/lib\/auth\/hooks['"]/g,
    replacement: "from '@monorepo/auth'"
  },
  {
    pattern: /from\s+['"]@\/lib\/auth\/providers\/[\w-]+['"]/g,
    replacement: "from '@monorepo/auth'"
  },
  {
    pattern: /from\s+['"]@\/lib\/auth\/providers['"]/g,
    replacement: "from '@monorepo/auth'"
  },
  {
    pattern: /from\s+['"]@\/lib\/auth\/session['"]/g,
    replacement: "from '@monorepo/auth'"
  },
  {
    pattern: /from\s+['"]@\/lib\/auth\/utils['"]/g,
    replacement: "from '@monorepo/auth'"
  },
  {
    pattern: /from\s+['"]@\/lib\/auth\/oauth['"]/g,
    replacement: "from '@monorepo/auth'"
  },
  {
    pattern: /from\s+['"]@\/lib\/auth\/pkce['"]/g,
    replacement: "from '@monorepo/auth'"
  },
  {
    pattern: /from\s+['"]@\/lib\/auth\/storage['"]/g,
    replacement: "from '@monorepo/auth'"
  },
  
  // Features - all paths
  {
    pattern: /from\s+['"]@\/lib\/features\/\w+['"]/g,
    replacement: "from '@monorepo/features'"
  },
  {
    pattern: /from\s+['"]@\/lib\/features['"]/g,
    replacement: "from '@monorepo/features'"
  },
];

// Special case handling for specific imports
const specialCases = [
  // Handle createLogger specifically since it's now a named export
  {
    before: /import\s+logger\s+from\s+['"]@\/lib\/logger['"]/g,
    after: "import { createLogger } from '@monorepo/logger'"
  },
  // AuthLogger is part of logger package
  {
    before: /import\s+{\s*AuthLogger\s*}\s+from\s+['"]@\/lib\/logger['"]/g,
    after: "import { AuthLogger } from '@monorepo/logger'"
  }
];

// Process a single file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let changes = [];
  
  // Apply special cases first
  for (const special of specialCases) {
    if (special.before.test(content)) {
      content = content.replace(special.before, special.after);
      changes.push(`Applied special case: ${special.before} -> ${special.after}`);
    }
  }
  
  // Apply regular update rules
  for (const rule of updateRules) {
    const matches = content.match(rule.pattern);
    if (matches) {
      content = content.replace(rule.pattern, rule.replacement);
      changes.push(`Updated ${matches.length} import(s) matching ${rule.pattern}`);
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`\n✅ Updated: ${relativePath}`);
    changes.forEach(change => console.log(`  - ${change}`));
    return true;
  }
  
  return false;
}

// Main function
async function main() {
  console.log('🔄 Updating imports to use monorepo packages...\n');
  
  const appsWebDir = path.join(__dirname, '../apps/web');
  const files = glob.sync('**/*.{ts,tsx}', {
    cwd: appsWebDir,
    absolute: true,
    ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**']
  });
  
  console.log(`Found ${files.length} TypeScript files to check...\n`);
  
  let updatedCount = 0;
  for (const file of files) {
    if (processFile(file)) {
      updatedCount++;
    }
  }
  
  console.log(`\n✅ Updated ${updatedCount} files`);
  console.log(`📊 Checked ${files.length} total files`);
  
  // Check if logger is still used from lib
  console.log('\n🔍 Checking for remaining lib imports...');
  const remainingLibImports = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const libImports = content.match(/from\s+['"]@\/lib\/(logger|config|telemetry|types|utils|auth|features)/g);
    if (libImports) {
      remainingLibImports.push({
        file: path.relative(appsWebDir, file),
        imports: libImports
      });
    }
  }
  
  if (remainingLibImports.length > 0) {
    console.log('\n⚠️  Found remaining lib imports that need manual review:');
    remainingLibImports.forEach(({ file, imports }) => {
      console.log(`\n  ${file}:`);
      imports.forEach(imp => console.log(`    - ${imp}`));
    });
  } else {
    console.log('✅ All imports have been updated!');
  }
}

// Run the script
main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});