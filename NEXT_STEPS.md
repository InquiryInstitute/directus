# Next Steps: Complete Commonplace Deployment

## ✅ Step 1: Database Schema (If not done yet)
- [ ] Copy `APPLY_THIS_SQL.sql` 
- [ ] Paste into Supabase SQL Editor: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/sql/new
- [ ] Click "Run"

## 📦 Step 2: Create Storage Bucket

1. **Open Storage Dashboard** (should be open in your browser):
   https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/storage/buckets

2. **Click "New Bucket"**

3. **Configure**:
   - **Name**: `commonplace-assets`
   - **Public bucket**: ✅ **Check this** (make it public)
   - **File size limit**: Leave default or set to 50MB
   - **Allowed MIME types**: Leave empty (allows all)

4. **Click "Create bucket"**

## ⚙️ Step 3: Configure Directus Environment

```bash
cd ~/GitHub/directus/docker

# Create .env file if it doesn't exist
cp env.template .env
```

**Edit `docker/.env` with these values:**

### Database Connection
Get from: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/settings/database

```env
DB_HOST=db.xougqdomkoisrxdnagcj.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USER=postgres
DB_PASSWORD=<your-database-password>
```

### Directus Keys
Run this to generate keys:
```bash
cd ~/GitHub/directus
./scripts/generate-directus-keys.sh
```

Copy the generated keys into `docker/.env`:
```env
DIRECTUS_KEY=<generated-key>
DIRECTUS_SECRET=<generated-secret>
```

### Admin User
```env
ADMIN_EMAIL=admin@inquiry.institute
ADMIN_PASSWORD=<choose-a-secure-password>
```

### Public URL (for local development)
```env
PUBLIC_URL=http://localhost:8055
```

### CORS
```env
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:3000,https://commonplace.inquiry.institute
```

## 🐳 Step 4: Start Directus

```bash
cd ~/GitHub/directus/docker
docker compose up -d
```

**Check if it's running:**
```bash
# Check logs
docker logs commonplace-directus

# Check health
curl http://localhost:8055/server/health
```

**Expected output**: `{"status":"ok"}`

## 🔐 Step 5: Access Directus Admin

1. **Open**: http://localhost:8055/admin

2. **Login with**:
   - Email: `admin@inquiry.institute` (or what you set in .env)
   - Password: (from ADMIN_PASSWORD in .env)

3. **First-time setup**: Directus will auto-detect your database tables!

## 🎨 Step 6: Configure Directus Collections

Directus should automatically detect the Commonplace tables. Verify:

1. **Go to**: Settings → Data Model
2. **Check that these collections exist**:
   - ✅ persons
   - ✅ works
   - ✅ sources
   - ✅ fragments
   - ✅ themes
   - ✅ work_relations
   - ✅ citations
   - ✅ work_fragments
   - ✅ work_themes
   - ✅ review_rounds
   - ✅ review_assignments
   - ✅ reviews
   - ✅ editor_decisions
   - ✅ change_requests

## 👥 Step 7: Create Roles

1. **Go to**: Settings → Roles & Permissions

2. **Create these roles**:

   **Admin**
   - Full access to all collections

   **Editor**
   - Read/Update: works, review_rounds, editor_decisions
   - Read: persons, reviews

   **Reviewer**
   - Read: works, review_rounds
   - Create/Update: reviews (own reviews only)

   **Author**
   - Create/Read/Update: works (own works only, status = draft)
   - Read: persons

   **Publisher**
   - Read/Update: works (status changes to published)
   - Read: persons

   **Public**
   - Read: works (where status = 'published' AND visibility = 'public')
   - Read: persons (where public_domain = true)

## 📁 Step 8: Configure Storage

1. **Go to**: Settings → File Storage

2. **Add Supabase Storage**:
   - Click "Create Storage Location"
   - **Name**: `supabase`
   - **Driver**: `supabase`
   - **Endpoint**: `https://xougqdomkoisrxdnagcj.supabase.co`
   - **Key**: (Get from Settings → API → service_role key)
   - **Bucket**: `commonplace-assets`
   - **Region**: `us-east-1` (or your region)

## ✅ Step 9: Test the System

```bash
# Test Directus API
curl http://localhost:8055/items/persons

# Should return JSON (may be empty until you add data)
```

## 🚀 Step 10: Add First Content (Optional)

1. **Go to**: Content → Persons
2. **Create a person**:
   - Name: "Test Author"
   - Slug: "test-author"
   - Kind: "faculty"
   - Public Domain: true

3. **Go to**: Content → Works
4. **Create a work**:
   - Title: "Test Essay"
   - Slug: "test-essay"
   - Type: "essay"
   - Status: "published"
   - Visibility: "public"
   - Primary Author: (select the person you created)

## 📝 Quick Reference

- **Directus Admin**: http://localhost:8055/admin
- **Directus API**: http://localhost:8055
- **API Docs**: http://localhost:8055/server/specs/oas
- **Supabase Dashboard**: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj

## 🐛 Troubleshooting

### Directus won't start
```bash
docker logs commonplace-directus
# Check for errors in .env file
```

### Database connection errors
- Verify DB_HOST, DB_USER, DB_PASSWORD in .env
- Check Supabase project is active (not paused)
- Verify connection string format

### Collections not showing
- Directus auto-detects tables on startup
- Refresh the admin panel
- Check database connection

### Storage not working
- Verify bucket name: `commonplace-assets`
- Check bucket is public
- Verify service_role key is correct

---

**Ready for production?** See `docs/DEPLOYMENT.md` for production deployment steps.
