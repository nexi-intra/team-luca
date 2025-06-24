# Koksmat Companion

A developer automation server that integrates with the Magic Button Assistant DevPanel.

## Features

- HTTP REST API for script management
- WebSocket support for real-time communication
- Script execution with live output streaming
- Connection status monitoring
- Integrated with DevPanel for seamless developer experience

## Quick Start

### From the root directory (recommended):

1. Install dependencies:

```bash
pnpm run koksmat:install
```

2. Start in development mode (with hot reload):

```bash
pnpm run koksmat:dev
```

Or start in production mode:

```bash
pnpm run koksmat
```

### From the koksmat-companion directory:

1. Install dependencies:

```bash
cd koksmat-companion
pnpm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Start the companion server:

**Development mode (with hot reload):**

```bash
pnpm run koksmat:dev
```

**Production mode:**

```bash
pnpm run koksmat
```

The server will start on port 2512 by default.

## Available Scripts

- `pnpm run koksmat:dev` - Start with hot module reloading (watches for file changes)
- `pnpm run koksmat` - Start in production mode
- `pnpm run dev` - Same as koksmat:dev (alias)
- `pnpm start` - Basic start without .env loading

## API Endpoints

### HTTP Endpoints

- `GET /health` - Health check
- `GET /api/status` - Get companion status
- `GET /api/scripts` - List available scripts
- `GET /api/scripts/running` - List running scripts
- `POST /api/scripts/execute` - Execute a script
- `POST /api/scripts/stop/:id` - Stop a running script

### WebSocket Events

#### Client to Server:

- `script:execute` - Request script execution
- `disconnect` - Client disconnection

#### Server to Client:

- `companion:status` - Companion status update
- `script:started` - Script execution started
- `script:output` - Script output (stdout/stderr)
- `script:completed` - Script execution completed
- `script:error` - Script execution error
- `script:stopped` - Script was stopped

## Creating Scripts

Add your automation scripts to the `scripts/` directory. Scripts should be Node.js files that can be executed directly.

Example script structure:

```javascript
#!/usr/bin/env node

console.log("Starting my automation script...");

// Your automation logic here

process.exit(0); // Success
// or
process.exit(1); // Failure
```

## Integration with DevPanel

The companion automatically integrates with the DevPanel when running. The DevPanel will show:

- Connection status (Connected/Disconnected)
- Number of running scripts
- Real-time script output
- Script execution controls

## Configuration

Environment variables:

- `PORT` - Server port (default: 2512)
- `CLIENT_URL` - Allowed client URL for CORS (default: http://localhost:3000)
- `LOG_LEVEL` - Logging level: error, warn, info, verbose (default: info)

## Logging

Koksmat Companion features rich logging with:

- **Console output** - Color-coded logs with timestamps
- **File logging** - JSON-formatted logs saved to `./logs/` directory
- **Log rotation** - Daily rotation with 3-day retention
- **WebSocket streaming** - Real-time log streaming to connected clients
- **Structured logging** - Logs include metadata for better debugging

Log files:

- `./logs/koksmat-YYYY-MM-DD.log` - All logs
- `./logs/error-YYYY-MM-DD.log` - Error logs only

The logs directory is automatically created and excluded from git.

## Troubleshooting

### Connection Issues

1. Ensure the companion server is running on port 2512
2. Check that the Next.js app is running on the expected port
3. Verify CORS settings in .env file

### Script Execution Issues

1. Ensure scripts have proper Node.js shebang
2. Check script permissions
3. Review logs in `koksmat-companion.log`

## Development

To add new features:

1. Add new routes in `routes/`
2. Extend ScriptManager for new functionality
3. Update WebSocket events as needed
4. Test integration with DevPanel
