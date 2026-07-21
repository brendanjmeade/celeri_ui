#!/bin/bash

# Celeri UI Launcher - Starts server and opens browser

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Warning: No .env file found. Creating from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "Please add your MapBox token to .env"
    fi
fi

# Start the server in background
echo "Starting Celeri UI..."
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Open in browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open -a '/Applications/Google Chrome.app' http://localhost:3000/
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000/
elif [[ "$OSTYPE" == "msys"* ]]; then 
	START "Chrome" "C:\Program Files\Google\Chrome\Application\chrome.exe" http://localhost:3000/
fi

echo "Celeri UI is running at http://localhost:3000/"
echo "Press Ctrl+C to stop"

# Wait for the server process
wait $SERVER_PID