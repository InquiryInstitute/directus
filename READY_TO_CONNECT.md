# Ready to Connect Directus to Supabase

## ✅ What's Complete

1. **Demo Work Created** - Test work in Supabase demonstrating faculty publishing
2. **Connection Scripts Ready** - Both interactive and non-interactive versions
3. **Documentation Complete** - Full guides for the connection process

## 📋 Current Status

- ✅ Supabase has Commonplace schema (persons, works tables)
- ✅ Demo work visible in Supabase
- ✅ Directus running on Cloud Run
- ⏳ **Next: Connect Directus to Supabase**

## 🚀 To Connect Directus to Supabase

### Option 1: Interactive Script (Recommended)

```bash
cd /Users/danielmcshan/GitHub/directus
./scripts/connect-directus-to-supabase.sh
```

This will prompt you for the Supabase database password.

### Option 2: Non-Interactive Script

```bash
cd /Users/danielmcshan/GitHub/directus
SUPABASE_DB_PASSWORD="your-password-here" ./scripts/connect-directus-to-supabase-noninteractive.sh
```

### Option 3: Manual gcloud Command

```bash
# Set project
gcloud config set project terpedia

# Update service (replace YOUR_PASSWORD)
gcloud run services update commonplace-directus \
  --region=us-central1 \
  --update-env-vars "DB_CLIENT=pg,DB_HOST=aws-0-us-east-1.pooler.supabase.com,DB_PORT=6543,DB_DATABASE=postgres,DB_USER=postgres.xougqdomkoisrxdnagcj,DB_PASSWORD=YOUR_PASSWORD"
```

## 🔑 Get Supabase Database Password

1. Go to: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/settings/database
2. Copy the database password (or reset it if needed)
3. Use it in one of the methods above

## ✅ After Connecting

1. Wait 30-60 seconds for Cloud Run to restart
2. Check Directus: https://commonplace-directus-652016456291.us-central1.run.app/admin
3. Verify collections (Settings → Data Model)
4. Test creating a work in Directus
5. Verify it appears in Supabase and on frontend

## 📁 Files Created

- `scripts/connect-directus-to-supabase.sh` - Interactive version
- `scripts/connect-directus-to-supabase-noninteractive.sh` - Non-interactive version
- `CONNECT_DIRECTUS_SUPABASE.md` - Complete guide
- `NEXT_STEP_CONNECT.md` - Quick reference
- `READY_TO_CONNECT.md` - This file

## 🎯 Goal

Once connected:
- ✅ Faculty can publish via Directus admin panel
- ✅ Works automatically appear in Supabase
- ✅ Frontend displays new works immediately
- ✅ Single source of truth for Commonplace data

---

**Ready?** Get your Supabase password and run one of the scripts above!
