# Connect Directus to Supabase

## Current Setup

- **Directus URL**: https://commonplace-directus-652016456291.us-central1.run.app
- **Directus Project**: Currently in `terpedia` project (detected from service URL)
- **Supabase Project**: `xougqdomkoisrxdnagcj` (inquiry-institute)
- **Goal**: Connect Directus to use Supabase database so faculty publishing appears on frontend

## Quick Start

### Option 1: Automated Script (Recommended)

```bash
cd /Users/danielmcshan/GitHub/directus

# The script will auto-detect the project, or you can set it:
export GCP_PROJECT_ID="terpedia"  # or whatever project Directus is in

./scripts/connect-directus-to-supabase.sh
```

The script will:
1. Auto-detect the GCP project (or prompt you)
2. Ask for your Supabase database password
3. Update Directus Cloud Run service to use Supabase
4. Preserve existing Directus configuration

### Option 2: Manual Update

1. **Get Supabase Database Password**:
   - Go to: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/settings/database
   - Copy or reset the database password

2. **Update Directus Service**:
   ```bash
   # Set the correct project
   gcloud config set project terpedia  # or inquiry-institute if moved
   
   # Update with your password
   export SUPABASE_DB_PASSWORD="your-password-here"
   
   gcloud run services update commonplace-directus \
     --region=us-central1 \
     --update-env-vars "DB_CLIENT=pg,DB_HOST=aws-0-us-east-1.pooler.supabase.com,DB_PORT=6543,DB_DATABASE=postgres,DB_USER=postgres.xougqdomkoisrxdnagcj,DB_PASSWORD=$SUPABASE_DB_PASSWORD"
   ```

## Connection Details

**Supabase Connection (Pooler - Recommended)**:
- Host: `aws-0-us-east-1.pooler.supabase.com`
- Port: `6543`
- Database: `postgres`
- User: `postgres.xougqdomkoisrxdnagcj`
- Password: (from Supabase dashboard)

## After Connecting

1. **Wait 30-60 seconds** for Cloud Run to restart

2. **Verify Directus**:
   - Go to: https://commonplace-directus-652016456291.us-central1.run.app/admin
   - Log in
   - Check Settings → Data Model
   - Verify `persons` and `works` collections are visible

3. **Test Publishing**:
   - Create a test work in Directus
   - Set status: `published`, visibility: `public`
   - Check Supabase: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/editor/works
   - Verify on frontend: https://commonplace.inquiry.institute

## Troubleshooting

### Wrong Project

If you get "service not found":
```bash
# List all projects
gcloud projects list

# Set the correct one
gcloud config set project <project-id>

# Or set in the script
export GCP_PROJECT_ID="terpedia"
```

### Connection Issues

Check logs:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=commonplace-directus" --limit 20 --project=terpedia
```

### Password Issues

- Verify password in Supabase dashboard
- Try resetting the database password
- Make sure there are no extra spaces or quotes

## What This Achieves

✅ Directus writes directly to Supabase  
✅ Works created in Directus appear in Supabase immediately  
✅ Frontend shows new works automatically  
✅ Single source of truth for Commonplace data  
✅ No manual synchronization needed  

---

**Ready?** Run the script and enter your Supabase database password!
