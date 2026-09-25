#!/usr/bin/env bash
# exit on error
set -e

echo "=== Installing Server Dependencies ==="
cd server
npm install --include=dev

echo "=== Installing Client Dependencies ==="
cd ../client
npm install --include=dev

echo "=== Building Client Production Bundle ==="
npm run build

echo "=== Build Complete ==="
