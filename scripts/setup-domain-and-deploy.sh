#!/bin/bash
# Complete setup: Domain + GitHub Pages Deployment

set -e

echo "🚀 Setting up Domain and Deploying Commonplace"
echo "================================================"
echo ""

# Step 1: Setup Route 53 DNS
echo "📡 Step 1: Setting up Route 53 DNS"
echo "----------------------------------"

HOSTED_ZONE_ID="Z053032935YKZE3M0E0D1"
DOMAIN="commonplace.inquiry.institute"

# Check for existing records
EXISTING=$(aws route53 list-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --query "ResourceRecordSets[?Name=='${DOMAIN}.']" \
  --output json 2>/dev/null || echo "[]")

if [ "$EXISTING" != "[]" ]; then
    echo "⚠️  Existing DNS record found. Updating..."
    # Delete existing record first
    RECORD_TYPE=$(echo "$EXISTING" | jq -r '.[0].Type')
    if [ "$RECORD_TYPE" != "CNAME" ]; then
        echo "Deleting existing $RECORD_TYPE record..."
        aws route53 change-resource-record-sets \
          --hosted-zone-id "$HOSTED_ZONE_ID" \
          --change-batch "{\"Changes\":[{\"Action\":\"DELETE\",\"ResourceRecordSet\":$(echo "$EXISTING" | jq '.[0]')}]}" \
          2>/dev/null || true
    fi
fi

# Create CNAME pointing to GitHub Pages
echo "Creating CNAME record: $DOMAIN → InquiryInstitute.github.io"
aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch "{
    \"Changes\": [{
      \"Action\": \"UPSERT\",
      \"ResourceRecordSet\": {
        \"Name\": \"$DOMAIN\",
        \"Type\": \"CNAME\",
        \"TTL\": 300,
        \"ResourceRecords\": [{\"Value\": \"InquiryInstitute.github.io\"}]
      }
    }]
  }" \
  --output json > /dev/null

echo "✅ DNS record created"
echo ""

# Step 2: Configure GitHub Pages
echo "📚 Step 2: Configuring GitHub Pages"
echo "------------------------------------"

echo "Opening GitHub Pages settings..."
echo ""
echo "Please configure:"
echo "1. Source: Select 'GitHub Actions'"
echo "2. Custom domain: Enter 'commonplace.inquiry.institute'"
echo "3. Check 'Enforce HTTPS'"
echo "4. Click 'Save'"
echo ""

open "https://github.com/InquiryInstitute/directus/settings/pages" 2>/dev/null || \
  echo "Open: https://github.com/InquiryInstitute/directus/settings/pages"

read -p "Press Enter after configuring Pages settings..." -r
echo ""

# Step 3: Trigger Deployment
echo "🚀 Step 3: Triggering Deployment"
echo "--------------------------------"

echo "Triggering GitHub Actions workflow..."
gh workflow run deploy-pages.yml --repo InquiryInstitute/directus

echo ""
echo "✅ Deployment triggered!"
echo ""
echo "Monitor progress:"
echo "  https://github.com/InquiryInstitute/directus/actions"
echo ""
echo "Once deployed, visit:"
echo "  https://commonplace.inquiry.institute"
echo ""
