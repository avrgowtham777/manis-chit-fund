#!/usr/bin/env bash
# exit on error
set -e

echo "=== Installing Server Dependencies ==="
cd server
npm install --production=false

echo "=== Installing Client Dependencies ==="
cd ../client
npm install

echo "=== Building Client Production Bundle ==="
npm run build

echo "=== Build Complete ==="
