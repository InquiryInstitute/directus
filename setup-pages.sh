#!/bin/bash
# Setup GitHub Pages for Commonplace
# This script helps configure Pages via GitHub CLI

set -e

echo "📚 Setting up GitHub Pages for Commonplace"
echo "=========================================="
echo ""

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI is not installed"
    echo "Install: brew install gh"
    exit 1
fi

echo "✅ GitHub CLI found"
echo ""

# Open Pages settings
echo "Opening GitHub Pages settings..."
echo ""
echo "In the browser that opens:"
echo "1. Under 'Source', select 'GitHub Actions'"
echo "2. Under 'Custom domain', enter: commonplace.inquiry.institute"
echo "3. Check 'Enforce HTTPS'"
echo "4. Click 'Save'"
echo ""
read -p "Press Enter to open Pages settings..." -r

open "https://github.com/InquiryInstitute/directus/settings/pages" 2>/dev/null || \
  xdg-open "https://github.com/InquiryInstitute/directus/settings/pages" 2>/dev/null || \
  echo "Please open: https://github.com/InquiryInstitute/directus/settings/pages"

echo ""
echo "📝 Setting up secrets..."
echo ""

# Check if secrets exist
SECRETS=$(gh secret list --repo InquiryInstitute/directus 2>/dev/null || echo "")

if echo "$SECRETS" | grep -q "DIRECTUS_URL"; then
    echo "✅ DIRECTUS_URL already set"
else
    echo "⚠️  DIRECTUS_URL not set"
    echo "   Set with: gh secret set DIRECTUS_URL --repo InquiryInstitute/directus"
fi

if echo "$SECRETS" | grep -q "DIRECTUS_TOKEN"; then
    echo "✅ DIRECTUS_TOKEN already set"
else
    echo "⚠️  DIRECTUS_TOKEN not set"
    echo "   Set with: gh secret set DIRECTUS_TOKEN --repo InquiryInstitute/directus"
fi

if echo "$SECRETS" | grep -q "SUPABASE_URL"; then
    echo "✅ SUPABASE_URL already set"
else
    echo "⚠️  SUPABASE_URL not set"
    echo "   Set with: gh secret set SUPABASE_URL --repo InquiryInstitute/directus"
fi

echo ""
echo "🔧 Quick setup commands:"
echo ""
echo "# Set secrets (replace values):"
echo "gh secret set DIRECTUS_URL --repo InquiryInstitute/directus --body 'https://directus.inquiry.institute'"
echo "gh secret set DIRECTUS_TOKEN --repo InquiryInstitute/directus --body 'your-directus-token'"
echo "gh secret set SUPABASE_URL --repo InquiryInstitute/directus --body 'https://xougqdomkoisrxdnagcj.supabase.co'"
echo ""
echo "# Trigger deployment:"
echo "gh workflow run deploy-pages.yml --repo InquiryInstitute/directus"
echo ""
