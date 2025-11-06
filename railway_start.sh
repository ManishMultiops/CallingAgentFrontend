#!/bin/bash

# Railway Frontend Start Script
echo "🎨 Starting Frontend Service on Railway..."

# Script should be run from CallingFrontend directory
# If run from root, cd into CallingFrontend
if [ ! -f "package.json" ]; then
    cd CallingFrontend || exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build for production
echo "🏗️ Building frontend..."
npm run build

# Serve with serve
PORT=${PORT:-3000}
echo "🚀 Serving frontend on port $PORT..."
npx serve -s build -l $PORT
