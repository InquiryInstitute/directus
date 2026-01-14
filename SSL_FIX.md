# SSL Certificate Fix for Directus

## Issue

SSL certificate errors when accessing Directus via Cloud Run URL.

## Solution

Cloud Run automatically provisions SSL certificates for all services. If you're seeing SSL errors, try these fixes:

### 1. Wait for Certificate Provisioning

Cloud Run SSL certificates are automatically provisioned, but it can take a few minutes after deployment. Wait 5-10 minutes and try again.

### 2. Clear Browser Cache

Sometimes browsers cache old certificate information:
- **Chrome/Edge**: Settings → Privacy → Clear browsing data → Cached images and files
- **Firefox**: Settings → Privacy → Clear Data → Cached Web Content
- Or use an **incognito/private window**

### 3. Verify Certificate Manually

```bash
# Check certificate
openssl s_client -connect commonplace-directus-652016456291.us-central1.run.app:443 \
  -servername commonplace-directus-652016456291.us-central1.run.app

# Test with curl (ignore certificate errors for testing)
curl -k https://commonplace-directus-652016456291.us-central1.run.app/server/health
```

### 4. Update Directus Public URL

Ensure Directus knows its public URL:

```bash
gcloud run services update commonplace-directus \
  --region us-central1 \
  --project terpedia \
  --set-env-vars="PUBLIC_URL=https://commonplace-directus-652016456291.us-central1.run.app"
```

### 5. For Import Script (Bypass SSL Verification)

If you need to run the import script immediately and SSL is still having issues, you can temporarily bypass SSL verification in Node.js:

**Option A: Use environment variable**
```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
./scripts/import-inquirer-articles.sh
```

**Option B: Update the script** (not recommended for production)

Add to `scripts/import-inquirer-articles.ts`:
```typescript
// Only for development - remove in production
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
```

### 6. Check Cloud Run Service Status

```bash
gcloud run services describe commonplace-directus \
  --region us-central1 \
  --project terpedia \
  --format="yaml(status)"
```

## Expected Behavior

Cloud Run services should have valid SSL certificates automatically. The certificate is issued by Google and should be trusted by all browsers and clients.

## If SSL Still Fails

1. **Check service is running**:
   ```bash
   gcloud run services list --project terpedia
   ```

2. **Check logs for errors**:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=commonplace-directus" \
     --project terpedia \
     --limit 50
   ```

3. **Redeploy service** (forces new certificate):
   ```bash
   cd /Users/danielmcshan/GitHub/directus
   gcloud builds submit --config docker/cloudbuild.yaml --project terpedia
   ```

## For Custom Domain

When setting up `directus.inquiry.institute` via Cloud Run domain mapping, Google automatically provisions and manages SSL certificates. This is the recommended approach for production.

## Quick Test

```bash
# Should return {"status":"ok"} without SSL errors
curl https://commonplace-directus-652016456291.us-central1.run.app/server/health
```
