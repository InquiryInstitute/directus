#!/bin/bash
# Setup Route 53 DNS for Commonplace frontend
# Maps commonplace.inquiry.institute to Cloudflare Pages (or other frontend)

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🌐 Setting up Route 53 DNS for Commonplace Frontend"
echo "==================================================="
echo ""

# Route 53 Configuration
HOSTED_ZONE_ID="Z053032935YKZE3M0E0D1"
DOMAIN="inquiry.institute"
SUBDOMAIN="commonplace"
FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"

# Frontend URL - GitHub Pages
# After first deployment, get the actual GitHub Pages URL
# Format: InquiryInstitute.github.io/directus (or custom domain)
FRONTEND_URL="InquiryInstitute.github.io"

echo "Configuration:"
echo "  Hosted Zone: $HOSTED_ZONE_ID"
echo "  Domain: $FULL_DOMAIN"
echo "  Target: $FRONTEND_URL"
echo ""
echo "Note: After GitHub Pages is deployed, update this to point to:"
echo "  InquiryInstitute.github.io/directus"
echo "  Or configure custom domain in GitHub Pages settings"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    exit 1
fi

# Create CNAME record
echo "Creating CNAME record for $FULL_DOMAIN..."
aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch "{
    \"Changes\": [{
      \"Action\": \"UPSERT\",
      \"ResourceRecordSet\": {
        \"Name\": \"$FULL_DOMAIN\",
        \"Type\": \"CNAME\",
        \"TTL\": 300,
        \"ResourceRecords\": [{\"Value\": \"$FRONTEND_URL\"}]
      }
    }]
  }" \
  --output json

echo ""
echo -e "${GREEN}✅ DNS record created!${NC}"
echo ""
echo "Note: Update this when frontend is deployed to Cloudflare Pages"
echo ""
