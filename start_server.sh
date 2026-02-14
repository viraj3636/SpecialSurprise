#!/bin/bash
# Simple script to start a Python server
# Browsers require a secure context (https or localhost) for camera access.
# Opening index.html directly as a file (file://) blocks the camera.

echo "Starting Valentine Server..."
echo "Open your browser to: http://localhost:8000"
echo "Press Ctrl+C to stop."

python3 -m http.server 8000
