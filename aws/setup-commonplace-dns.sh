#!/bin/bash
# Setup Route 53 DNS for Commonplace (non-interactive)
# Points commonplace.inquiry.institute to GitHub Pages

set -e

HOSTED_ZONE_ID="Z053032935YKZE3M0E0D1"
DOMAIN="commonplace.inquiry.institute"
TARGET="InquiryInstitute.github.io"

echo "🌐 Setting up DNS for Commonplace"
echo "Domain: $DOMAIN → $TARGET"
echo ""

aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch "{
    \"Changes\": [{
      \"Action\": \"UPSERT\",
      \"ResourceRecordSet\": {
        \"Name\": \"$DOMAIN\",
        \"Type\": \"CNAME\",
        \"TTL\": 300,
        \"ResourceRecords\": [{\"Value\": \"$TARGET\"}]
      }
    }]
  }" \
  --output json

echo ""
echo "✅ DNS record created!"
echo ""
echo "Note: After GitHub Pages is deployed, configure custom domain:"
echo "  https://github.com/InquiryInstitute/directus/settings/pages"
echo "  Custom domain: commonplace.inquiry.institute"
echo ""
