#!/bin/bash
# Fix DNS for GitHub Pages custom domain
# GitHub Pages requires CNAME pointing to org.github.io

set -e

HOSTED_ZONE_ID="Z053032935YKZE3M0E0D1"
DOMAIN="commonplace.inquiry.institute"
GITHUB_PAGES_DOMAIN="InquiryInstitute.github.io"

echo "🔧 Fixing DNS for GitHub Pages HTTPS"
echo "====================================="
echo ""

# Delete any existing A records
echo "Checking for existing records..."
EXISTING=$(aws route53 list-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --query "ResourceRecordSets[?Name=='${DOMAIN}.']" \
  --output json 2>/dev/null || echo "[]")

if [ "$EXISTING" != "[]" ]; then
    RECORD_TYPE=$(echo "$EXISTING" | jq -r '.[0].Type // "NONE"')
    if [ "$RECORD_TYPE" != "CNAME" ] || [ "$RECORD_TYPE" == "A" ]; then
        echo "Deleting existing $RECORD_TYPE record..."
        aws route53 change-resource-record-sets \
          --hosted-zone-id "$HOSTED_ZONE_ID" \
          --change-batch "{\"Changes\":[{\"Action\":\"DELETE\",\"ResourceRecordSet\":$(echo "$EXISTING" | jq '.[0]')}]}" \
          --output json > /dev/null
        echo "✅ Deleted $RECORD_TYPE record"
        sleep 2
    fi
fi

# Create CNAME record
echo "Creating CNAME: $DOMAIN → $GITHUB_PAGES_DOMAIN"
aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch "{
    \"Changes\": [{
      \"Action\": \"UPSERT\",
      \"ResourceRecordSet\": {
        \"Name\": \"$DOMAIN\",
        \"Type\": \"CNAME\",
        \"TTL\": 300,
        \"ResourceRecords\": [{\"Value\": \"$GITHUB_PAGES_DOMAIN\"}]
      }
    }]
  }" \
  --output json

echo ""
echo "✅ DNS record updated!"
echo ""
echo "Next steps:"
echo "1. Wait 5-60 minutes for DNS propagation"
echo "2. GitHub will automatically verify the domain"
echo "3. Once verified, HTTPS will be enabled"
echo ""
echo "Check status:"
echo "  https://github.com/InquiryInstitute/directus/settings/pages"
echo ""
echo "Verify DNS:"
echo "  dig commonplace.inquiry.institute CNAME"
echo "  nslookup commonplace.inquiry.institute"
