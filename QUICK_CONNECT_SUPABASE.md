# Quick Guide: Connect Directus to Supabase

## Current Situation

- ✅ Directus is running on Cloud Run
- ✅ Supabase has Commonplace schema (persons, works tables)
- ❌ Directus is using a different database (not Supabase)
- ✅ Demo work created directly in Supabase (visible on frontend)

## Goal

Connect Directus to Supabase so faculty publishing via Directus automatically appears on the frontend.

## Important: Find the Correct GCP Project

The Directus service URL is `commonplace-directus-652016456291.us-central1.run.app`. The project number `652016456291` indicates which GCP project it's in.

To find the project:
```bash
# List all projects and find the one with this number
gcloud projects list --format="table(projectId,projectNumber,name)"
```

Or check the Directus deployment documentation for the project ID.

## Quick Steps

### 1. Get Supabase Database Password

Go to: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/settings/database

If you don't have the password, click "Reset database password" and save it.

### 2. Run the Connection Script

```bash
cd /Users/danielmcshan/GitHub/directus
./scripts/connect-directus-to-supabase.sh
```

Enter your Supabase database password when prompted.

### 3. Verify Connection

After the service restarts (30-60 seconds):

1. **Check Directus**: https://commonplace-directus-652016456291.us-central1.run.app/admin
   - Log in
   - Go to Settings → Data Model
   - Verify `persons` and `works` collections are visible

2. **Test Publishing**:
   - Create a test work in Directus
   - Set status: `published`, visibility: `public`
   - Check it appears in Supabase dashboard
   - Verify it shows on frontend

## Alternative: Manual Update

If the script doesn't work, update manually:

```bash
# Get password first
export SUPABASE_DB_PASSWORD="your-password"

# Update service
gcloud run services update commonplace-directus \
  --region=us-central1 \
  --update-env-vars "DB_CLIENT=pg,DB_HOST=aws-0-us-east-1.pooler.supabase.com,DB_PORT=6543,DB_DATABASE=postgres,DB_USER=postgres.xougqdomkoisrxdnagcj,DB_PASSWORD=$SUPABASE_DB_PASSWORD"
```

## What This Does

- Updates Directus to use Supabase PostgreSQL database
- Directus will auto-detect existing tables (persons, works, etc.)
- New works created in Directus will be in Supabase
- Frontend will immediately show new works

## Important Notes

⚠️ **Data Migration**: Existing data in Directus's current database will NOT be automatically migrated. The demo work we created directly in Supabase will remain.

If you have important data in Directus:
1. Export it first (if possible)
2. Or re-run import scripts after connecting
3. Or manually migrate via SQL

## Verification Commands

```bash
# Check service status
gcloud run services describe commonplace-directus --region=us-central1

# Check logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=commonplace-directus" --limit 20

# Test Directus health
curl https://commonplace-directus-652016456291.us-central1.run.app/server/health
```

---

**Ready to connect?** Run the script and enter your Supabase database password!
