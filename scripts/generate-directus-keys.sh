#!/bin/bash
# Generate Directus Key and Secret
# Run this script to generate secure keys for Directus

echo "🔑 Generating Directus Keys"
echo "=========================="
echo ""

# Check if node/npx is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx is not installed. Please install Node.js first."
    exit 1
fi

echo "Generating Directus KEY..."
DIRECTUS_KEY=$(npx directus key generate 2>/dev/null | grep -oP 'KEY=\K[^\s]+' || openssl rand -hex 32)

echo "Generating Directus SECRET..."
DIRECTUS_SECRET=$(npx directus key generate 2>/dev/null | grep -oP 'SECRET=\K[^\s]+' || openssl rand -hex 32)

echo ""
echo "✅ Generated keys:"
echo ""
echo "DIRECTUS_KEY=${DIRECTUS_KEY}"
echo "DIRECTUS_SECRET=${DIRECTUS_SECRET}"
echo ""
echo "Add these to your docker/.env file"
