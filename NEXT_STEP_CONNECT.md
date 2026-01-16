# Next Step: Connect Directus to Supabase

## Current Status

✅ Demo work created in Supabase (visible on frontend)  
✅ Commonplace schema exists in Supabase  
✅ Directus is running on Cloud Run  
❌ Directus is using a different database (not Supabase)  

## Action Required

To enable faculty publishing via Directus, we need to connect Directus to Supabase.

### Quick Command

```bash
cd /Users/danielmcshan/GitHub/directus
./scripts/connect-directus-to-supabase.sh
```

### What You'll Need

1. **Supabase Database Password**
   - Get it from: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/settings/database
   - If you don't have it, click "Reset database password"

2. **GCP Access**
   - The script will auto-detect the project (terpedia)
   - Make sure you're authenticated: `gcloud auth login`

### What the Script Does

1. Detects the GCP project where Directus is deployed
2. Prompts for Supabase database password
3. Updates Directus Cloud Run service environment variables:
   - `DB_HOST`: `aws-0-us-east-1.pooler.supabase.com`
   - `DB_PORT`: `6543`
   - `DB_DATABASE`: `postgres`
   - `DB_USER`: `postgres.xougqdomkoisrxdnagcj`
   - `DB_PASSWORD`: (your password)
4. Preserves existing Directus settings (KEY, SECRET, etc.)

### After Running

1. Wait 30-60 seconds for Cloud Run to restart
2. Check Directus: https://commonplace-directus-652016456291.us-central1.run.app/admin
3. Verify collections are detected (persons, works, etc.)
4. Test creating a work in Directus
5. Verify it appears in Supabase and on frontend

### Alternative: Manual Update

If the script doesn't work, update manually:

```bash
# Set project
gcloud config set project terpedia

# Update service (replace YOUR_PASSWORD)
gcloud run services update commonplace-directus \
  --region=us-central1 \
  --update-env-vars "DB_CLIENT=pg,DB_HOST=aws-0-us-east-1.pooler.supabase.com,DB_PORT=6543,DB_DATABASE=postgres,DB_USER=postgres.xougqdomkoisrxdnagcj,DB_PASSWORD=YOUR_PASSWORD"
```

---

**Ready?** Get your Supabase password and run the script!
