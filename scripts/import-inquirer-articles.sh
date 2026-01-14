#!/bin/bash
# Import Inquirer articles to Commonplace Directus

set -e

echo "📚 Importing Inquirer Articles to Commonplace"
echo "=============================================="
echo ""

# Check for required environment variables
if [ -z "$DIRECTUS_URL" ]; then
    export DIRECTUS_URL="https://directus.inquiry.institute"
fi

if [ -z "$DIRECTUS_TOKEN" ]; then
    echo "❌ DIRECTUS_TOKEN environment variable is required"
    echo "Get token from: https://directus.inquiry.institute/admin"
    exit 1
fi

# Set Inquirer posts path
export INQUIRER_POSTS_ROOT="${INQUIRER_POSTS_ROOT:-$(pwd)/../Inquiry.Institute/inquirer-quarterly/posts}"

if [ ! -d "$INQUIRER_POSTS_ROOT" ]; then
    echo "❌ Inquirer posts directory not found: $INQUIRER_POSTS_ROOT"
    echo "Set INQUIRER_POSTS_ROOT environment variable to correct path"
    exit 1
fi

echo "Configuration:"
echo "  Directus URL: $DIRECTUS_URL"
echo "  Posts Path: $INQUIRER_POSTS_ROOT"
echo ""

# Run import script
cd "$(dirname "$0")/.."
npx tsx scripts/import-inquirer-articles.ts

echo ""
echo "✅ Import complete!"
