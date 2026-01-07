#!/bin/bash

echo "🛡️  ThreatWatch Network Capture Agent"
echo "======================================"
echo ""

if [ "$EUID" -ne 0 ]; then
  echo "⚠️  This script requires root privileges for packet capture."
  echo "   Restarting with sudo..."
  echo ""
  sudo "$0" "$@"
  exit $?
fi

if [ ! -f ".env" ]; then
  echo "❌ Error: .env file not found"
  echo ""
  echo "Please create a .env file with:"
  echo "  VITE_SUPABASE_URL=your_supabase_url"
  echo "  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
  echo ""
  echo "You can copy from the parent directory:"
  echo "  cp ../.env .env"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

echo "🚀 Starting capture agent..."
echo ""
node index.js
