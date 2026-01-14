#!/bin/bash
# Setup Route 53 DNS for Commonplace Directus
# Maps directus.inquiry.institute to Cloud Run service

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🌐 Setting up Route 53 DNS for Commonplace"
echo "==========================================="
echo ""

# Route 53 Configuration
HOSTED_ZONE_ID="Z053032935YKZE3M0E0D1"
DOMAIN="inquiry.institute"
SUBDOMAIN="directus"
FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"

# Cloud Run Service URL
CLOUD_RUN_URL="commonplace-directus-652016456291.us-central1.run.app"

echo "Configuration:"
echo "  Hosted Zone: $HOSTED_ZONE_ID"
echo "  Domain: $FULL_DOMAIN"
echo "  Target: $CLOUD_RUN_URL"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    echo "Install: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI configured${NC}"
echo ""

# Get Cloud Run service IP or use CNAME
echo "Creating CNAME record for $FULL_DOMAIN..."
echo ""

# Create CNAME record pointing to Cloud Run
aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch "{
    \"Changes\": [{
      \"Action\": \"UPSERT\",
      \"ResourceRecordSet\": {
        \"Name\": \"$FULL_DOMAIN\",
        \"Type\": \"CNAME\",
        \"TTL\": 300,
        \"ResourceRecords\": [{\"Value\": \"$CLOUD_RUN_URL\"}]
      }
    }]
  }" \
  --output json

echo ""
echo -e "${GREEN}✅ DNS record created!${NC}"
echo ""
echo "DNS changes are propagating (usually 5-60 minutes)"
echo ""
echo "Verify with:"
echo "  dig $FULL_DOMAIN"
echo "  nslookup $FULL_DOMAIN"
echo ""
echo "Once DNS propagates, access Directus at:"
echo "  https://$FULL_DOMAIN/admin"
echo ""
