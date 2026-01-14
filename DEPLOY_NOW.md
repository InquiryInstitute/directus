# Deploy Commonplace Now 🚀

Quick deployment guide for the Commonplace system.

## Option 1: Use Existing Supabase Project

If you want to use your existing Supabase project (`xougqdomkoisrxdnagcj`):

```bash
cd ~/GitHub/directus

# Link to existing project
cd supabase
supabase link --project-ref xougqdomkoisrxdnagcj

# Apply migrations
supabase db push
cd ..
```

**Note:** This will add the Commonplace tables to your existing database. If you prefer a separate database for Commonplace, use Option 2.

## Option 2: Create New Supabase Project

1. **Create new project**:
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Name: `commonplace`
   - Save the project reference ID

2. **Link and migrate**:
```bash
cd ~/GitHub/directus/supabase
supabase link --project-ref YOUR_NEW_PROJECT_REF
supabase db push
cd ..
```

## Step 2: Configure Directus

```bash
cd ~/GitHub/directus/docker

# Create .env file
cp env.template .env

# Edit .env with your Supabase credentials:
# DB_HOST=db.YOUR_PROJECT_REF.supabase.co
# DB_USER=postgres
# DB_PASSWORD=your-password
# DB_DATABASE=postgres
```

**Get credentials from:**
- Supabase Dashboard → Settings → Database
- Database password: You set this when creating the project

## Step 3: Generate Directus Keys

```bash
cd ~/GitHub/directus
./scripts/generate-directus-keys.sh

# Copy the keys into docker/.env:
# DIRECTUS_KEY=<generated-key>
# DIRECTUS_SECRET=<generated-secret>
```

## Step 4: Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Click "New Bucket"
3. Name: `commonplace-assets`
4. Make it **PUBLIC**
5. Click "Create bucket"

## Step 5: Start Directus

```bash
cd ~/GitHub/directus/docker
docker compose up -d

# Check logs
docker logs commonplace-directus

# Check health
curl http://localhost:8055/server/health
```

## Step 6: Access Directus Admin

1. Visit: http://localhost:8055/admin
2. Login with:
   - Email: `admin@inquiry.institute` (or what you set in .env)
   - Password: (from ADMIN_PASSWORD in .env)

## Step 7: Configure Directus

### Import Schema (Optional)

If you have a Directus schema export, import it via:
- Settings → Data Model → Import Schema

### Create Roles

Go to Settings → Roles & Permissions and create:

- **Admin**: Full access
- **Editor**: Manage reviews, decisions
- **Reviewer**: Review assigned works
- **Author**: Draft, submit, revise
- **Publisher**: Schedule, publish
- **Public**: Read published works only

### Configure Storage

1. Go to Settings → File Storage
2. Add Supabase Storage location:
   - Name: `supabase`
   - Driver: `supabase`
   - Endpoint: `https://YOUR_PROJECT_REF.supabase.co`
   - Key: (Supabase service role key)
   - Bucket: `commonplace-assets`

## Step 8: Test the System

```bash
# Test Directus API
curl http://localhost:8055/items/persons

# Should return JSON (may be empty until you add data)
```

## Production Deployment

For production:

1. **Deploy Directus**:
   - Use Cloud Run, Railway, Render, or similar
   - Update PUBLIC_URL in .env
   - Configure DNS (see docs/DNS_SETUP.md)

2. **Deploy Frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   # Deploy to Cloudflare Pages
   ```

3. **Configure DNS**:
   - Update Route 53 records (see docs/DNS_SETUP.md)
   - Point `commonplace.inquiry.institute` to your frontend
   - Point `directus.inquiry.institute` to your Directus instance

## Troubleshooting

### Directus won't start
- Check Docker logs: `docker logs commonplace-directus`
- Verify .env file has all required variables
- Check database connection string

### Database connection errors
- Verify Supabase credentials in .env
- Check Supabase project is active (not paused)
- Verify firewall allows connections

### Migrations fail
- Check Supabase SQL Editor for detailed errors
- Ensure project is active
- Verify you have admin access to the project

## Next Steps

- [ ] Migrations applied ✅
- [ ] Directus running ✅
- [ ] Storage bucket created ✅
- [ ] Roles configured
- [ ] Permissions set up
- [ ] First content added
- [ ] Frontend deployed
- [ ] DNS configured

---

**Need help?** Check `docs/DEPLOYMENT.md` for detailed instructions.
