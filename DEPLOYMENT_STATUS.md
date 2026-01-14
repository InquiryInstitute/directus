# 🚀 Commonplace Deployment Status

## ✅ Completed

- [x] Repository created: `InquiryInstitute/directus`
- [x] Complete schema migration file created
- [x] Docker Compose configuration ready
- [x] Frontend starter created (Next.js)
- [x] Deployment scripts created
- [x] Supabase project linked: `xougqdomkoisrxdnagcj`

## ⏳ Next Steps

### 1. Apply Database Schema (Required)

**Option A: Via Supabase Dashboard (Recommended)**

1. Open SQL Editor:
   https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/sql/new

2. Copy the entire contents of:
   ```
   supabase/migrations/20260113000000_commonplace_schema.sql
   ```

3. Paste into SQL Editor and click **"Run"**

**Option B: Via Script**

```bash
cd ~/GitHub/directus
./scripts/apply-commonplace-schema.sh
```

This will open the SQL Editor for you.

### 2. Create Storage Bucket

1. Go to: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/storage/buckets
2. Click **"New Bucket"**
3. Name: `commonplace-assets`
4. Make it **PUBLIC**
5. Click **"Create bucket"**

### 3. Configure Directus

```bash
cd ~/GitHub/directus/docker

# Create .env file
cp env.template .env

# Edit .env with your Supabase credentials:
# - DB_HOST=db.xougqdomkoisrxdnagcj.supabase.co
# - DB_USER=postgres
# - DB_PASSWORD=<your-database-password>
# - DB_DATABASE=postgres
```

**Get credentials from:**
- Settings → Database: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/settings/database

### 4. Generate Directus Keys

```bash
cd ~/GitHub/directus
./scripts/generate-directus-keys.sh

# Copy the generated keys into docker/.env:
# DIRECTUS_KEY=<generated-key>
# DIRECTUS_SECRET=<generated-secret>
```

### 5. Start Directus

```bash
cd ~/GitHub/directus/docker
docker compose up -d

# Check logs
docker logs commonplace-directus

# Check health
curl http://localhost:8055/server/health
```

### 6. Access Directus Admin

1. Visit: http://localhost:8055/admin
2. Login with credentials from `docker/.env`:
   - Email: `admin@inquiry.institute` (or what you set)
   - Password: (from ADMIN_PASSWORD in .env)

### 7. Configure Directus

**Import Schema (if available)**
- Settings → Data Model → Import Schema

**Create Roles**
- Settings → Roles & Permissions → Create:
  - Admin (full access)
  - Editor (manage reviews, decisions)
  - Reviewer (review assigned works)
  - Author (draft, submit, revise)
  - Publisher (schedule, publish)
  - Public (read published works only)

**Configure Storage**
- Settings → File Storage → Add:
  - Name: `supabase`
  - Driver: `supabase`
  - Endpoint: `https://xougqdomkoisrxdnagcj.supabase.co`
  - Key: (Supabase service role key)
  - Bucket: `commonplace-assets`

### 8. Deploy Frontend (Optional)

```bash
cd ~/GitHub/directus/frontend
npm install
cp env.template .env.local
# Edit .env.local with Directus URL and token
npm run dev
```

### 9. Production Deployment

See `docs/DEPLOYMENT.md` for complete production deployment instructions.

---

## Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj
- **SQL Editor**: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/sql/new
- **Storage**: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/storage/buckets
- **Database Settings**: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/settings/database
- **Directus Admin**: http://localhost:8055/admin (after starting Docker)

---

## Current Status

✅ **Infrastructure**: Ready  
⏳ **Database Schema**: Needs to be applied  
⏳ **Storage Bucket**: Needs to be created  
⏳ **Directus**: Needs to be configured and started  
⏳ **Frontend**: Ready for development  

---

**Next Action**: Apply database schema via Supabase Dashboard SQL Editor
