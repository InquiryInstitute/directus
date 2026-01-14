# ✅ Commonplace Deployment Complete!

## Status: DEPLOYED

Directus is now running and connected to Supabase!

## Access Points

- **Directus Admin Panel**: http://localhost:8055/admin
- **Directus API**: http://localhost:8055
- **API Health Check**: http://localhost:8055/server/health
- **API Documentation**: http://localhost:8055/server/specs/oas

## Login Credentials

- **Email**: `admin@inquiry.institute`
- **Password**: (from ADMIN_PASSWORD in docker/.env)

## What's Ready

✅ **Database Schema**: Applied (via `APPLY_THIS_SQL.sql`)  
✅ **Directus Container**: Running  
✅ **Database Connection**: Connected  
✅ **Collections**: Auto-detected from database  

## Next Steps

### 1. Verify Collections

1. Go to: http://localhost:8055/admin
2. Navigate to: **Settings → Data Model**
3. You should see these collections:
   - persons
   - works
   - sources
   - fragments
   - themes
   - work_relations
   - citations
   - work_fragments
   - work_themes
   - review_rounds
   - review_assignments
   - reviews
   - editor_decisions
   - change_requests

### 2. Create Storage Bucket

1. Go to: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/storage/buckets
2. Click **"New Bucket"**
3. Name: `commonplace-assets`
4. Make it **PUBLIC** ✅
5. Click **"Create bucket"**

### 3. Configure Directus Storage

1. In Directus Admin: **Settings → File Storage**
2. Add Supabase Storage:
   - Name: `supabase`
   - Driver: `supabase`
   - Endpoint: `https://xougqdomkoisrxdnagcj.supabase.co`
   - Key: (Get from Supabase Dashboard → Settings → API → service_role key)
   - Bucket: `commonplace-assets`

### 4. Create Roles

Go to: **Settings → Roles & Permissions**

Create these roles:

- **Admin**: Full access
- **Editor**: Manage reviews, decisions
- **Reviewer**: Review assigned works
- **Author**: Draft, submit, revise
- **Publisher**: Schedule, publish
- **Public**: Read published works only

### 5. Add First Content

1. Go to: **Content → Persons**
2. Create a person (e.g., "Test Author")
3. Go to: **Content → Works**
4. Create a work linked to that person

## Testing

```bash
# Test API
curl http://localhost:8055/items/persons

# Test with authentication (get token from Directus)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8055/items/works
```

## Production Deployment

When ready for production:

1. **Deploy Directus** to Cloud Run, Railway, or similar
2. **Update PUBLIC_URL** in .env to production URL
3. **Deploy Frontend** to Cloudflare Pages
4. **Configure DNS** (see `docs/DNS_SETUP.md`)

## Useful Commands

```bash
# View logs
docker logs commonplace-directus

# Restart Directus
cd ~/GitHub/directus/docker && docker compose restart

# Stop Directus
cd ~/GitHub/directus/docker && docker compose down

# Start Directus
cd ~/GitHub/directus/docker && docker compose up -d
```

## Documentation

- `QUICK_START.md` - Quick reference
- `NEXT_STEPS.md` - Detailed next steps
- `docs/DEPLOYMENT.md` - Complete deployment guide
- `docs/DNS_SETUP.md` - DNS configuration
- `DESIGN.md` - System design document

---

**🎉 Commonplace is now live and ready for content!**
