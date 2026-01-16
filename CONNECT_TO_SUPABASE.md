# Connect Directus to Supabase

This guide explains how to connect Directus to use Supabase as its database, so that when faculty publish via Directus, their works automatically appear on the Commonplace frontend.

## Why Connect to Supabase?

Currently, Directus is using a separate database. When faculty create works in Directus, they don't appear in Supabase, so the frontend (which reads from Supabase) doesn't show them.

By connecting Directus to Supabase:
- ✅ Works created in Directus automatically appear in Supabase
- ✅ Frontend immediately shows new works
- ✅ Single source of truth for Commonplace data
- ✅ No need for data synchronization scripts

## Prerequisites

1. **Supabase Database Password**
   - Go to: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/settings/database
   - If you don't have the password, click "Reset database password"
   - Save the password securely

2. **gcloud CLI** installed and authenticated
   ```bash
   gcloud auth login
   gcloud config set project terpedia  # or your project ID
   ```

## Method 1: Automated Script (Recommended)

```bash
cd /Users/danielmcshan/GitHub/directus
./scripts/connect-directus-to-supabase.sh
```

The script will:
1. Prompt for your Supabase database password
2. Get current Directus configuration
3. Update Cloud Run service to use Supabase
4. Preserve existing Directus settings (KEY, SECRET, etc.)

## Method 2: Manual Update via gcloud

```bash
# Set your password
export SUPABASE_DB_PASSWORD="your-password-here"

# Update the service
gcloud run services update commonplace-directus \
  --region=us-central1 \
  --update-env-vars "DB_CLIENT=pg,DB_HOST=aws-0-us-east-1.pooler.supabase.com,DB_PORT=6543,DB_DATABASE=postgres,DB_USER=postgres.xougqdomkoisrxdnagcj,DB_PASSWORD=$SUPABASE_DB_PASSWORD"
```

## Method 3: Via Cloud Console

1. Go to: https://console.cloud.google.com/run/detail/us-central1/commonplace-directus
2. Click "Edit & Deploy New Revision"
3. Expand "Variables & Secrets"
4. Update database environment variables:
   - `DB_CLIENT`: `pg`
   - `DB_HOST`: `aws-0-us-east-1.pooler.supabase.com`
   - `DB_PORT`: `6543`
   - `DB_DATABASE`: `postgres`
   - `DB_USER`: `postgres.xougqdomkoisrxdnagcj`
   - `DB_PASSWORD`: (your Supabase database password)
5. Click "Deploy"

## Connection Details

**Connection Pooler (Recommended for Cloud Run):**
- Host: `aws-0-us-east-1.pooler.supabase.com`
- Port: `6543`
- Database: `postgres`
- User: `postgres.xougqdomkoisrxdnagcj`

**Direct Connection (Alternative):**
- Host: `db.xougqdomkoisrxdnagcj.supabase.co`
- Port: `5432`
- Database: `postgres`
- User: `postgres`

## After Connecting

1. **Wait for restart**: Cloud Run will restart the service (30-60 seconds)

2. **Verify connection**:
   ```bash
   curl https://commonplace-directus-652016456291.us-central1.run.app/server/health
   ```

3. **Check Directus admin**:
   - Go to: https://commonplace-directus-652016456291.us-central1.run.app/admin
   - Log in with your admin credentials
   - Go to Settings → Data Model
   - Verify collections are detected: `persons`, `works`, `sources`, etc.

4. **Test publishing**:
   - Create a test work in Directus
   - Set status to "published" and visibility to "public"
   - Check Supabase: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/editor/works
   - Verify it appears on frontend: https://commonplace.inquiry.institute

## Troubleshooting

### Service won't start

Check logs:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=commonplace-directus" --limit 50
```

Common issues:
- **Wrong password**: Verify password in Supabase dashboard
- **Network issues**: Try direct connection instead of pooler
- **Project paused**: Check Supabase project status

### Collections not detected

Directus should auto-detect tables. If not:
1. Go to Settings → Data Model
2. Click "Import from Database"
3. Select the `public` schema
4. Import all Commonplace tables

### Data migration

**Important**: Connecting to Supabase will create a NEW Directus instance. Existing data in the old database will NOT be migrated automatically.

To migrate existing data:
1. Export from old Directus (if accessible)
2. Or use the import scripts to re-import data
3. Or manually copy data via SQL

## Verification

After connecting, verify everything works:

```bash
# 1. Check Directus health
curl https://commonplace-directus-652016456291.us-central1.run.app/server/health

# 2. Check Supabase has data
cd /Users/danielmcshan/GitHub/Inquiry.Institute
SUPABASE_URL="https://xougqdomkoisrxdnagcj.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="sb_secret_sN0tF2L2uRk0d-kCV11FyA_Z3z5flmU" \
npx tsx scripts/check-supabase-data.ts

# 3. Test creating a work in Directus
# Then verify it appears in Supabase and on frontend
```

## Next Steps

Once connected:
1. ✅ Faculty can publish via Directus admin panel
2. ✅ Works automatically appear in Supabase
3. ✅ Frontend displays new works immediately
4. ✅ No manual synchronization needed

---

**Need help?** Check the Directus logs or Supabase dashboard for connection issues.
