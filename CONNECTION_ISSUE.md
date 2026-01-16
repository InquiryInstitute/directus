# Directus to Supabase Connection Issue

## Problem

Attempting to connect Directus to Supabase is failing with authentication errors:
- "password authentication failed"
- "Tenant or user not found"
- "auth_failed"

## Attempted Solutions

1. ✅ Updated Directus Cloud Run environment variables
2. ❌ Tried pooler connection (`aws-0-us-east-1.pooler.supabase.com:6543`)
3. ❌ Tried direct connection (`db.xougqdomkoisrxdnagcj.supabase.co:5432`)
4. ❌ Tried different user formats (`postgres.xougqdomkoisrxdnagcj` and `postgres`)

## Possible Causes

1. **Supabase Project Status**
   - Project might be paused
   - Check: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj
   - If paused, click "Resume"

2. **Network/Firewall**
   - Cloud Run might be blocked from connecting to Supabase
   - Check Supabase IP allowlist settings
   - Cloud Run uses dynamic IPs, so allowlist might not work

3. **Password Issues**
   - Password might be incorrect
   - Special characters might need escaping
   - Verify password in Supabase dashboard

4. **Connection String Format**
   - Directus might need a different connection format
   - Try using `DATABASE_URL` instead of individual variables

## Next Steps

### Option 1: Check Supabase Project Status

1. Go to: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj
2. Verify project is active (not paused)
3. Check database settings for any restrictions

### Option 2: Use DATABASE_URL Format

Instead of individual DB_* variables, try using a connection string:

```bash
DATABASE_URL="postgresql://postgres:GNXMyzSvnKCICdza@db.xougqdomkoisrxdnagcj.supabase.co:5432/postgres?sslmode=require"
```

### Option 3: Test Connection Locally First

```bash
# Test if password works from your machine
psql "postgresql://postgres:GNXMyzSvnKCICdza@db.xougqdomkoisrxdnagcj.supabase.co:5432/postgres?sslmode=require" -c "SELECT 1"
```

### Option 4: Rollback to Previous Working Version

If Directus was working before, rollback to the last working revision:

```bash
# Find working revision
gcloud run revisions list --service=commonplace-directus --region=us-central1 --project=terpedia

# Rollback to specific revision
gcloud run services update-traffic commonplace-directus \
  --region=us-central1 \
  --project=terpedia \
  --to-revisions=REVISION_NAME=100
```

## Current Status

- Directus service exists but can't connect to Supabase
- All recent revisions are failing
- Need to resolve authentication/connection issue

## Alternative Approach

Since we've successfully created works directly in Supabase, we could:
1. Keep Directus on its current database
2. Create a sync script that copies data from Directus to Supabase
3. Or use Directus API to write to Supabase via Edge Functions

---

**Action Required**: Check Supabase project status and verify connection details.
