# Security Scanning Setup

This project uses multiple layers of security scanning to prevent secrets and sensitive data from being committed to the repository.

## Overview

We use the following tools:

- **pre-commit**: Manages and runs git hooks
- **detect-secrets**: Scans for various types of secrets using entropy analysis and pattern matching
- **gitleaks**: Additional secret scanning with custom rules
- **husky**: Ensures hooks are installed and run consistently

## Installation

When you run `pnpm install`, the pre-commit hooks will be automatically installed via the `prepare` script.

If you need to install them manually:

```bash
pnpm run prepare
```

## Usage

### Automatic Scanning

The pre-commit hooks will automatically run when you attempt to commit code. If any secrets are detected, the commit will be blocked.

### Manual Scanning

You can manually run the security scans:

```bash
# Run all pre-commit hooks on all files
pnpm run pre-commit

# Scan for new secrets
pnpm run secrets:scan

# Review detected secrets (mark false positives)
pnpm run secrets:audit
```

### Update Tools

To update the pre-commit hooks to their latest versions:

```bash
pnpm run pre-commit:update
```

## Configuration

### Pre-commit Configuration

The main configuration is in `.pre-commit-config.yaml`. It includes:

- General file checks (trailing whitespace, file size, etc.)
- Secret detection with detect-secrets and gitleaks
- Code quality checks (ESLint, TypeScript)
- Formatting with Prettier
- Dependency auditing

### Gitleaks Configuration

Custom rules and allowlists are defined in `.gitleaks.toml`. This includes:

- Magic Button specific API key patterns
- Database connection string detection
- JWT secret detection
- Paths to exclude from scanning

### Detect-secrets Baseline

The `.secrets.baseline` file contains:

- Known false positives that should be ignored
- Configuration for which secret detectors to use
- Entropy thresholds for detection

## Handling False Positives

If a legitimate file is flagged as containing secrets:

1. **For detect-secrets**: Run `pnpm run secrets:audit` and mark the finding as a false positive
2. **For gitleaks**: Add the file pattern to the allowlist in `.gitleaks.toml`
3. **For specific lines**: Add a comment to ignore:
   - `# nosec` or `# noqa` for Python
   - `// gitleaks:allow` for other languages

## Common Issues

### "Command not found: pre-commit"

Make sure you've run `pnpm install` to install all dependencies.

### Hooks not running

Ensure husky is properly installed:

```bash
npx husky install
```

### Too many false positives

You may need to adjust the entropy thresholds in:

- `.gitleaks.toml` for gitleaks
- `.pre-commit-config.yaml` for detect-secrets

## Security Best Practices

1. **Never commit real secrets**, even temporarily
2. **Use environment variables** for sensitive configuration
3. **Use `.env.example`** files to document required variables without values
4. **Rotate any secrets** that may have been exposed
5. **Review the scan results** carefully before marking as false positives

## Bypassing Checks (Emergency Only)

If you absolutely need to bypass the checks (not recommended):

```bash
git commit --no-verify -m "your message"
```

**Note**: This should only be used in emergencies. Always fix the underlying issue instead.
