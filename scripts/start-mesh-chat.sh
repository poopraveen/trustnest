#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# TrustNest Mesh Chat — Local WiFi Server Launcher (Mac / Linux)
# Double-click this file or run: bash start-mesh-chat.sh
# ─────────────────────────────────────────────────────────────────────────────

cd "$(dirname "$0")/.."

# Detect local IP
if command -v ipconfig &>/dev/null; then
  LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
elif command -v hostname &>/dev/null; then
  LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
fi
LOCAL_IP=${LOCAL_IP:-"your-laptop-ip"}

PORT=3333

echo ""
echo "  ██████████████████████████████████████████████████"
echo "  ██  TrustNest MESH CHAT — Local WiFi Server     ██"
echo "  ██████████████████████████████████████████████████"
echo ""
echo "  Starting on port $PORT..."
echo ""
echo "  ┌─────────────────────────────────────────────────┐"
echo "  │  Share this URL with everyone on your WiFi:    │"
echo "  │                                                 │"
echo "  │  http://${LOCAL_IP}:${PORT}/mesh-chat               │"
echo "  │                                                 │"
echo "  │  Or scan the QR code that will appear below    │"
echo "  └─────────────────────────────────────────────────┘"
echo ""

# Generate QR in terminal (requires qrencode — optional)
if command -v qrencode &>/dev/null; then
  echo "  Scan to join:"
  qrencode -t ANSIUTF8 "http://${LOCAL_IP}:${PORT}/mesh-chat"
  echo ""
fi

# Start the server
if [ -f "package.json" ]; then
  PORT=$PORT npm run dev
else
  echo "ERROR: Run this from the trustnest project root folder."
  exit 1
fi
