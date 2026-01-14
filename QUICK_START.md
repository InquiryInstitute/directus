# 🚀 Quick Start: Get Directus Running

## Prerequisites Check ✅

- [x] Database schema applied (via `APPLY_THIS_SQL.sql`)
- [x] Directus keys generated
- [x] .env file created

## ⚠️ Action Required: Set Database Password

**Edit `docker/.env` and set your database password:**

1. Get your database password from:
   https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/settings/database

2. Edit `docker/.env`:
   ```bash
   cd ~/GitHub/directus/docker
   # Open .env in your editor
   # Find: DB_PASSWORD=your-supabase-password
   # Replace with your actual password
   ```

## 🐳 Start Directus

Once DB_PASSWORD is set:

```bash
cd ~/GitHub/directus/docker
docker compose up -d
```

**Check if it's running:**
```bash
# Check logs
docker logs commonplace-directus

# Check health (wait 10-15 seconds after starting)
curl http://localhost:8055/server/health
```

**Expected**: `{"status":"ok"}`

## 🔐 Access Directus Admin

1. **Open**: http://localhost:8055/admin

2. **Login**:
   - Email: `admin@inquiry.institute`
   - Password: (from ADMIN_PASSWORD in .env, or set it now)

3. **First-time setup**: Directus will auto-detect your Commonplace tables!

## ✅ Verify Setup

1. **Check Collections**: Settings → Data Model
   - Should see: persons, works, sources, fragments, themes, etc.

2. **Test API**:
   ```bash
   curl http://localhost:8055/items/persons
   ```

## 📦 Create Storage Bucket (If not done)

1. Go to: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/storage/buckets
2. Click "New Bucket"
3. Name: `commonplace-assets`
4. Make it **PUBLIC** ✅
5. Create

## 🎯 Next Steps

See `NEXT_STEPS.md` for:
- Configuring roles and permissions
- Setting up storage adapters
- Adding your first content
- Production deployment

---

**Troubleshooting?** Check `docs/DEPLOYMENT.md` or `NEXT_STEPS.md`
