#!/bin/bash
# Complete Directus setup: Generate token + Import collections + Import articles
# This script does everything automatically

set -e

echo "🚀 Complete Directus Setup"
echo "=========================="
echo ""

# Configuration
DIRECTUS_URL="${DIRECTUS_URL:-https://commonplace-directus-652016456291.us-central1.run.app}"
SUPABASE_PROJECT="${SUPABASE_PROJECT:-xougqdomkoisrxdnagcj}"

# Get user email
if [ -z "$USER_EMAIL" ]; then
    echo "Enter your Directus admin email:"
    read USER_EMAIL
fi

echo "📧 Using email: $USER_EMAIL"
echo ""

# Step 1: Generate static token in Supabase
echo "Step 1: Generating static token in database..."
echo ""

TOKEN_SQL="
UPDATE directus_users 
SET token = gen_random_uuid()::text || '-' || gen_random_uuid()::text 
WHERE email = '$USER_EMAIL';

SELECT token FROM directus_users WHERE email = '$USER_EMAIL';
"

echo "Run this SQL in Supabase SQL Editor:"
echo "https://supabase.com/dashboard/project/$SUPABASE_PROJECT/sql/new"
echo ""
echo "SQL:"
echo "$TOKEN_SQL"
echo ""
echo "Press Enter after you've run the SQL and copied the token..."
read

echo "Paste the token here:"
read DIRECTUS_TOKEN

if [ -z "$DIRECTUS_TOKEN" ]; then
    echo "❌ Token is required"
    exit 1
fi

export DIRECTUS_TOKEN
export DIRECTUS_URL

# Step 2: Test token with actual API call
echo ""
echo "Step 2: Testing token..."
# Test with an actual authenticated endpoint
if curl -s -H "Authorization: Bearer $DIRECTUS_TOKEN" "$DIRECTUS_URL/users/me" > /dev/null 2>&1; then
    echo "✅ Token works!"
elif curl -s -H "Authorization: Bearer $DIRECTUS_TOKEN" "$DIRECTUS_URL/collections" > /dev/null 2>&1; then
    echo "✅ Token works!"
else
    echo "❌ Token test failed!"
    echo ""
    echo "The token you provided is not valid for authenticated API calls."
    echo "Please create a proper static token through Directus admin UI:"
    echo "  1. Go to: $DIRECTUS_URL/admin"
    echo "  2. Settings → Access Tokens → Create Token"
    echo "  3. Copy the token and run this script again"
    echo ""
    echo "See GET_TOKEN_PROPERLY.md for detailed instructions."
    exit 1
fi

# Step 3: Import collections
echo ""
echo "Step 3: Importing collections..."
cd "$(dirname "$0")/.."
./scripts/import-collections-api.sh

# Step 4: Import articles
echo ""
echo "Step 4: Importing Inquirer articles..."
export INQUIRER_POSTS_ROOT="${INQUIRER_POSTS_ROOT:-$(pwd)/../Inquiry.Institute/inquirer-quarterly/posts}"
./scripts/import-inquirer-articles.sh

echo ""
echo "✅ Setup complete!"
