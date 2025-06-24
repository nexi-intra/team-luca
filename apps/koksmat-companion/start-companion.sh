#!/bin/bash

echo "🚀 Starting Koksmat Companion Server..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  pnpm install
  echo ""
fi

# Copy .env.example to .env if it doesn't exist
if [ ! -f ".env" ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo ""
fi

echo "🎯 Starting server on port 2512..."
echo "📡 WebSocket and HTTP endpoints will be available at http://localhost:2512"
echo ""
echo "✨ To test the connection:"
echo "   1. Open your Next.js app at http://localhost:3000"
echo "   2. Open the DevPanel (floating Magic Button icon)"
echo "   3. Check the Koksmat Companion status"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"
echo ""

pnpm start