#!/bin/bash
set -e

echo "Installing dependencies..."
npm ci

echo "Building application..."
npx vite build --config vite.config.ts

echo "Build completed successfully!"