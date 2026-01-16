# Connect Directus to Supabase - Action Required

## Current Status

✅ Directus service is accessible  
✅ Connection scripts are ready  
⏳ **Need: Supabase database password**

## Quick Steps

### 1. Get Supabase Database Password

Go to: **https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/settings/database**

- If you see the password, copy it
- If you don't see it or forgot it, click **"Reset database password"**
- Save the password securely

### 2. Run the Connection Script

**Option A: Non-Interactive (Recommended)**

```bash
cd /Users/danielmcshan/GitHub/directus
SUPABASE_DB_PASSWORD="your-password-here" ./scripts/connect-directus-to-supabase-noninteractive.sh
```

**Option B: Interactive**

```bash
cd /Users/danielmcshan/GitHub/directus
./scripts/connect-directus-to-supabase.sh
# Enter password when prompted
```

### 3. Verify Connection

After running (wait 30-60 seconds for restart):

1. Check Directus: https://commonplace-directus-lfrshkx55q-uc.a.run.app/admin
2. Go to Settings → Data Model
3. Verify `persons` and `works` collections are visible
4. Create a test work
5. Verify it appears in Supabase

## What This Does

Updates Directus Cloud Run service to use Supabase database:
- `DB_HOST`: `aws-0-us-east-1.pooler.supabase.com`
- `DB_PORT`: `6543`
- `DB_DATABASE`: `postgres`
- `DB_USER`: `postgres.xougqdomkoisrxdnagcj`
- `DB_PASSWORD`: (your password)

## After Connecting

✅ Faculty can publish via Directus  
✅ Works appear in Supabase automatically  
✅ Frontend shows new works immediately  

---

**Ready?** Get your password and run the script!
