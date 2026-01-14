# Commonplace Deployment Guide

Complete deployment instructions for the Commonplace system (Directus + Supabase).

---

## Prerequisites

- **Supabase Account**: Create project at https://supabase.com
- **Docker & Docker Compose**: For running Directus
- **Domain**: `commonplace.inquiry.institute` (DNS configured in Route 53)
- **Cloudflare Account** (optional): For CDN and SSL
- **GitHub Account**: For repository access

---

## 1. Supabase Setup

### 1.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name**: `commonplace`
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait for project to initialize (2-3 minutes)

### 1.2 Enable Extensions

1. Go to **Database** → **Extensions**
2. Enable:
   - `uuid-ossp`
   - `pgcrypto`
   - `vector` (optional, for future AI features)

### 1.3 Apply Migrations

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
cd supabase
supabase db push
```

Or apply manually via Supabase SQL Editor:

1. Go to **SQL Editor** → **New Query**
2. Copy contents of `supabase/migrations/20260113000000_commonplace_schema.sql`
3. Paste and run

### 1.4 Create Storage Bucket

1. Go to **Storage** → **Buckets**
2. Click **"New Bucket"**
3. Name: `commonplace-assets`
4. Make it **public** (for published works)
5. Click **"Create bucket"**

### 1.5 Get Connection Details

1. Go to **Settings** → **Database**
2. Note:
   - **Host**: `db.xxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: (your project password)

---

## 2. Directus Setup (Docker)

### 2.1 Configure Environment

```bash
cd docker
cp .env.example .env
# Edit .env with your Supabase credentials
```

Required environment variables:

```env
# Database (Supabase)
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USER=postgres
DB_PASSWORD=your-supabase-password

# Directus Keys (generate with: npx directus key generate)
DIRECTUS_KEY=your-directus-key
DIRECTUS_SECRET=your-directus-secret

# Admin User (first-time setup)
ADMIN_EMAIL=admin@inquiry.institute
ADMIN_PASSWORD=your-secure-password

# Public URL
PUBLIC_URL=https://directus.inquiry.institute
```

### 2.2 Start Directus

```bash
docker-compose up -d
```

### 2.3 Verify Installation

1. Visit: `http://localhost:8055/admin`
2. Log in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`
3. You should see the Directus admin panel

### 2.4 Import Schema (Optional)

If you have a Directus schema export:

1. Go to **Settings** → **Data Model**
2. Import schema from `docker/directus/schema.yaml` (if available)
3. Or manually create collections matching the database schema

---

## 3. Directus Configuration

### 3.1 Configure Collections

Directus will auto-detect tables from Supabase. Configure each collection:

1. Go to **Settings** → **Data Model**
2. For each table (persons, works, sources, etc.):
   - Set display template
   - Configure fields (visibility, interfaces)
   - Set relationships

### 3.2 Create Roles

1. Go to **Settings** → **Roles & Permissions**
2. Create roles:
   - **Admin**: Full access
   - **Editor**: Manage reviews, decisions
   - **Reviewer**: Review assigned works
   - **Author**: Draft, submit, revise
   - **Copyeditor**: Edit accepted works
   - **Publisher**: Schedule, publish
   - **Public**: Read published works only

### 3.3 Configure Permissions

For each role, set permissions:

- **Public**: Read access to `works` where `status = 'published'`
- **Author**: Create/read/update own `works` where `status = 'draft'`
- **Reviewer**: Read `works` assigned in `review_assignments`
- **Editor**: Read/update `works`, manage `review_rounds`, `editor_decisions`
- **Publisher**: Update `works.status` to `published`, set `published_at`

### 3.4 Configure Storage

1. Go to **Settings** → **File Storage**
2. Add storage location:
   - **Name**: `supabase`
   - **Driver**: `supabase`
   - **Endpoint**: `https://xxxxx.supabase.co`
   - **Bucket**: `commonplace-assets`
   - **Key**: (Supabase service role key)

---

## 4. Frontend Setup (Future)

The frontend will be a static JS app (Next.js/Astro/SvelteKit) deployed to Cloudflare Pages.

### 4.1 Development

```bash
cd frontend
npm install
npm run dev
```

### 4.2 Production Build

```bash
npm run build
npm run preview
```

### 4.3 Deploy to Cloudflare Pages

1. Connect repository to Cloudflare Pages
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Output directory**: `.next/out` (or similar)
3. Add environment variables:
   - `DIRECTUS_URL`: `https://directus.inquiry.institute`
   - `DIRECTUS_TOKEN`: (public read token)

---

## 5. DNS Configuration

See `docs/DNS_SETUP.md` for complete DNS setup instructions.

Quick setup:

1. **Route 53**: Update CNAME records for:
   - `commonplace.inquiry.institute` → Cloudflare Pages URL
   - `directus.inquiry.institute` → Directus deployment URL

2. **Wait for propagation**: 5-60 minutes (can take up to 48 hours)

3. **Verify DNS**:
   ```bash
   dig commonplace.inquiry.institute
   dig directus.inquiry.institute
   ```

---

## 6. SSL/TLS Certificates

### Cloudflare (Recommended)

If using Cloudflare:
- SSL/TLS is automatic (Full or Full Strict mode)
- Certificate is provisioned automatically

### Let's Encrypt

If not using Cloudflare:

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d commonplace.inquiry.institute -d directus.inquiry.institute

# Auto-renewal (already configured via cron)
sudo certbot renew --dry-run
```

---

## 7. Production Checklist

- [ ] Supabase project created
- [ ] Database migrations applied
- [ ] Storage bucket created
- [ ] Directus running (Docker)
- [ ] Directus admin user created
- [ ] Collections configured
- [ ] Roles and permissions configured
- [ ] Storage adapters configured
- [ ] DNS records updated
- [ ] SSL certificates provisioned
- [ ] Frontend deployed (when ready)
- [ ] Health checks passing
- [ ] Backup strategy configured

---

## 8. Monitoring & Maintenance

### Health Checks

- **Directus**: `https://directus.inquiry.institute/server/health`
- **Frontend**: `https://commonplace.inquiry.institute`
- **Database**: Monitor in Supabase dashboard

### Backups

- **Database**: Supabase automatic backups (daily)
- **Storage**: Configure lifecycle rules in Supabase Storage
- **Directus**: Export schema periodically (`directus schema snapshot`)

### Logs

- **Directus**: `docker logs commonplace-directus`
- **Supabase**: Monitor in Supabase dashboard
- **Frontend**: Cloudflare Pages logs

---

## 9. Troubleshooting

### Directus Not Starting

- Check environment variables in `.env`
- Verify database connection: `psql -h DB_HOST -U DB_USER -d DB_DATABASE`
- Check logs: `docker logs commonplace-directus`

### Database Connection Issues

- Verify Supabase connection string
- Check firewall/security group rules
- Ensure IP is allowlisted in Supabase (if using IP restrictions)

### CORS Issues

- Configure `CORS_ORIGIN` in Directus `.env`
- Verify frontend URL is included
- Check browser console for CORS errors

### Schema Not Detected

- Directus should auto-detect tables from Supabase
- If not, check database connection
- Verify tables exist: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`

---

## 10. Next Steps

1. ✅ Infrastructure deployed
2. ⏳ Initial content migration (from WordPress)
3. ⏳ User accounts created
4. ⏳ Workflow tested
5. ⏳ Production launch

---

## Support

For issues or questions:
- Check Directus documentation: https://docs.directus.io
- Check Supabase documentation: https://supabase.com/docs
- Contact Inquiry Institute technical team
