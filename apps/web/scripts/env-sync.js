#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Parse command line arguments
const args = process.argv.slice(2);
const forceUpdate = args.includes("--force") || args.includes("-f");

// Keywords that indicate a value should be a secret
const SECRET_KEYWORDS = [
  "secret",
  "key",
  "token",
  "password",
  "pwd",
  "pass",
  "auth",
  "credential",
  "private",
  "api_key",
  "apikey",
  "access_token",
  "refresh_token",
  "client_secret",
  "encryption",
  "salt",
  "hash",
  "signature",
  "certificate",
  "cert",
  "pem",
  "ssh",
  "gpg",
  "pgp",
];

// Patterns that indicate GDPR-sensitive or secret data
const SECRET_PATTERNS = [
  /^[A-Za-z0-9+/]{40,}={0,2}$/, // Base64-like strings (API keys, tokens)
  /^[a-f0-9]{32,}$/i, // Hex strings (hashes, keys)
  /^sk_[a-zA-Z0-9]+$/, // Stripe-like secret keys
  /^pk_[a-zA-Z0-9]+$/, // Private keys
  /^ey[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, // JWT tokens
  /^ghp_[a-zA-Z0-9]+$/, // GitHub personal access tokens
  /^ghs_[a-zA-Z0-9]+$/, // GitHub server tokens
  /^npm_[a-zA-Z0-9]+$/, // npm tokens
  /-----BEGIN.*KEY-----/, // PEM format keys
  /-----BEGIN.*CERTIFICATE-----/, // PEM format certificates
];

// Check if a key or value should be treated as a secret
function isSecret(key, value) {
  const lowerKey = key.toLowerCase();

  // Check if key contains secret keywords
  if (SECRET_KEYWORDS.some((keyword) => lowerKey.includes(keyword))) {
    return true;
  }

  // Check if value matches secret patterns
  if (value && typeof value === "string") {
    // Skip URLs and common non-secret values
    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value === "true" ||
      value === "false" ||
      value === "development" ||
      value === "production" ||
      value === "localhost" ||
      value.match(/^\d+$/)
    ) {
      return false;
    }

    // Check against secret patterns
    if (SECRET_PATTERNS.some((pattern) => pattern.test(value))) {
      return true;
    }

    // Long random-looking strings are likely secrets
    if (value.length > 20 && /^[A-Za-z0-9_\-]+$/.test(value)) {
      return true;
    }
  }

  return false;
}

// Parse .env file
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const env = {};

  content.split("\n").forEach((line) => {
    // Skip comments and empty lines
    if (line.trim() === "" || line.trim().startsWith("#")) {
      return;
    }

    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();

      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      env[key] = value;
    }
  });

  return env;
}

// Get GitHub repository info
function getRepoInfo() {
  try {
    const remoteUrl = execSync("git remote get-url origin", {
      encoding: "utf-8",
    }).trim();
    const match = remoteUrl.match(/github\.com[:/]([^/]+)\/(.+?)(\.git)?$/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
      };
    }
  } catch (error) {
    console.error("Failed to get repository info:", error.message);
  }
  return null;
}

// Check if a GitHub variable or secret exists
function checkGitHubEnvVar(repo, key, isSecret) {
  const { owner, repo: repoName } = repo;
  const type = isSecret ? "secret" : "variable";
  const listCommand = isSecret ? "secret list" : "variable list";

  try {
    const output = execSync(
      `gh ${listCommand} -R ${owner}/${repoName} --json name`,
      {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      },
    );
    const vars = JSON.parse(output);
    return vars.some((v) => v.name === key);
  } catch (error) {
    // If the command fails, assume the variable doesn't exist
    return false;
  }
}

// Set GitHub variable or secret
function setGitHubEnvVar(repo, key, value, isSecret) {
  const { owner, repo: repoName } = repo;
  const type = isSecret ? "secret" : "variable";
  const command = isSecret ? "secret set" : "variable set";

  // Check if variable/secret exists and if we should skip it
  if (!forceUpdate && checkGitHubEnvVar(repo, key, isSecret)) {
    console.log(
      `⏭  Skipping existing ${type}: ${key} (use --force to update)`,
    );
    return;
  }

  try {
    // For secrets, we need to use stdin to avoid exposing in process list
    if (isSecret) {
      execSync(
        `echo -n "${value}" | gh ${command} ${key} -R ${owner}/${repoName}`,
        {
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "inherit"],
        },
      );
    } else {
      execSync(`gh ${command} ${key} -b "${value}" -R ${owner}/${repoName}`, {
        encoding: "utf-8",
        stdio: "inherit",
      });
    }
    console.log(`✓ ${forceUpdate ? "Updated" : "Set"} ${type}: ${key}`);
  } catch (error) {
    console.error(`✗ Failed to set ${type} ${key}:`, error.message);
  }
}

// Main function
async function main() {
  // Check if gh CLI is installed
  try {
    execSync("gh --version", { stdio: "ignore" });
  } catch (error) {
    console.error("Error: GitHub CLI (gh) is not installed.");
    console.error("Please install it from: https://cli.github.com/");
    process.exit(1);
  }

  // Check if authenticated
  try {
    execSync("gh auth status", { stdio: "ignore" });
  } catch (error) {
    console.error("Error: Not authenticated with GitHub CLI.");
    console.error("Please run: gh auth login");
    process.exit(1);
  }

  // Get repository info
  const repo = getRepoInfo();
  if (!repo) {
    console.error("Error: Could not determine GitHub repository.");
    console.error(
      "Make sure you are in a git repository with a GitHub remote.",
    );
    process.exit(1);
  }

  console.log(`Syncing to: ${repo.owner}/${repo.repo}`);
  if (forceUpdate) {
    console.log("Force mode: All variables and secrets will be updated.");
  }
  console.log();

  // Parse environment files
  const envFiles = [".env", ".env.local"];
  const allEnvVars = {};

  envFiles.forEach((file) => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`Reading ${file}...`);
      const vars = parseEnvFile(filePath);
      Object.assign(allEnvVars, vars);
    }
  });

  if (Object.keys(allEnvVars).length === 0) {
    console.log("No environment variables found.");
    return;
  }

  console.log(
    `\nFound ${Object.keys(allEnvVars).length} environment variables.\n`,
  );

  // Categorize and sync variables
  const secrets = [];
  const variables = [];

  Object.entries(allEnvVars).forEach(([key, value]) => {
    if (isSecret(key, value)) {
      secrets.push(key);
    } else {
      variables.push(key);
    }
  });

  console.log(
    `Detected ${secrets.length} secrets and ${variables.length} variables.\n`,
  );

  // Sync variables
  if (variables.length > 0) {
    console.log("Setting GitHub Variables:");
    variables.forEach((key) => {
      setGitHubEnvVar(repo, key, allEnvVars[key], false);
    });
    console.log();
  }

  // Sync secrets
  if (secrets.length > 0) {
    console.log("Setting GitHub Secrets:");
    secrets.forEach((key) => {
      setGitHubEnvVar(repo, key, allEnvVars[key], true);
    });
    console.log();
  }

  console.log("✅ Environment sync complete!");
}

// Run the script
main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
