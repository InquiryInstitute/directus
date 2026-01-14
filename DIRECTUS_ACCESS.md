# Directus Access

## Current Status

Directus is deployed to Google Cloud Run and is accessible, but the custom domain `directus.inquiry.institute` needs Cloud Run domain mapping to work properly.

## Access Methods

### Option 1: Use Cloud Run URL Directly (Works Now)

**URL**: https://commonplace-directus-652016456291.us-central1.run.app/admin

This works immediately and doesn't require domain mapping.

### Option 2: Set Up Cloud Run Domain Mapping (Recommended)

Cloud Run requires domain mapping to be configured for custom domains. This process:

1. **Verifies domain ownership** (if not already verified)
2. **Issues SSL certificate** automatically
3. **Routes traffic** from custom domain to Cloud Run service

#### Steps:

1. **Create domain mapping**:
   ```bash
   gcloud run domain-mappings create \
     --service commonplace-directus \
     --domain directus.inquiry.institute \
     --project terpedia
   ```

2. **Get verification records**:
   ```bash
   gcloud run domain-mappings describe directus.inquiry.institute \
     --project terpedia
   ```

3. **Add verification TXT record** to Route 53:
   ```bash
   aws route53 change-resource-record-sets \
     --hosted-zone-id Z053032935YKZE3M0E0D1 \
     --change-batch '{
       "Changes": [{
         "Action": "UPSERT",
         "ResourceRecordSet": {
           "Name": "directus.inquiry.institute",
           "Type": "TXT",
           "TTL": 300,
           "ResourceRecords": [{"Value": "<verification-string>"}]
         }
       }]
     }'
   ```

4. **Wait for verification** (can take 10-60 minutes)

5. **Update CNAME** (if needed):
   The domain mapping will provide a CNAME target. Update Route 53:
   ```bash
   aws route53 change-resource-record-sets \
     --hosted-zone-id Z053032935YKZE3M0E0D1 \
     --change-batch '{
       "Changes": [{
         "Action": "UPSERT",
         "ResourceRecordSet": {
           "Name": "directus.inquiry.institute",
           "Type": "CNAME",
           "TTL": 300,
           "ResourceRecords": [{"Value": "<cloud-run-cname-target>"}]
         }
       }]
     }'
   ```

### Option 3: Use Load Balancer (Advanced)

For production, consider using a Google Cloud Load Balancer with:
- Custom SSL certificates
- Better routing control
- CDN integration

## For Import Script

Until domain mapping is set up, you can use the Cloud Run URL:

```bash
export DIRECTUS_URL="https://commonplace-directus-652016456291.us-central1.run.app"
export DIRECTUS_TOKEN="your-token-here"
./scripts/import-inquirer-articles.sh
```

Or update the script to use the Cloud Run URL by default.

## Current Service Status

- **Service**: `commonplace-directus`
- **Region**: `us-central1`
- **Project**: `terpedia`
- **Cloud Run URL**: https://commonplace-directus-652016456291.us-central1.run.app
- **Health Check**: ✅ Working (`/server/health` returns `{"status":"ok"}`)
- **Custom Domain**: ⚠️ Needs domain mapping

## Quick Fix for Now

Use the Cloud Run URL directly:
- Admin: https://commonplace-directus-652016456291.us-central1.run.app/admin
- API: https://commonplace-directus-652016456291.us-central1.run.app
