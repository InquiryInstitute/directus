#!/bin/bash
# Complete Directus setup using email/password authentication
# This avoids the need for static tokens

set -e

echo "🚀 Complete Directus Setup (Email/Password Auth)"
echo "================================================"
echo ""

# Configuration
DIRECTUS_URL="${DIRECTUS_URL:-https://commonplace-directus-652016456291.us-central1.run.app}"

# Get credentials
if [ -z "$DIRECTUS_EMAIL" ]; then
    echo "Enter your Directus admin email:"
    read DIRECTUS_EMAIL
fi

if [ -z "$DIRECTUS_PASSWORD" ]; then
    echo "Enter your Directus admin password:"
    read -s DIRECTUS_PASSWORD
    echo ""
fi

export DIRECTUS_EMAIL
export DIRECTUS_PASSWORD
export DIRECTUS_URL

# Step 1: Import collections
echo ""
echo "Step 1: Importing collections..."
cd "$(dirname "$0")/.."
npx tsx scripts/import-collections-with-auth.ts

# Step 2: Import articles
echo ""
echo "Step 2: Importing Inquirer articles..."
export INQUIRER_POSTS_ROOT="${INQUIRER_POSTS_ROOT:-$(pwd)/../Inquiry.Institute/inquirer-quarterly/posts}"
npx tsx scripts/import-inquirer-articles.ts

echo ""
echo "✅ Setup complete!"
