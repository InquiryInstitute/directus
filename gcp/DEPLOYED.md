# ✅ Directus Deployed to Google Cloud Run!

## Service Information

- **Service URL**: https://commonplace-directus-652016456291.us-central1.run.app
- **Admin Panel**: https://commonplace-directus-652016456291.us-central1.run.app/admin
- **API Endpoint**: https://commonplace-directus-652016456291.us-central1.run.app
- **Region**: us-central1
- **Project**: terpedia

## Login Credentials

- **Email**: `admin@inquiry.institute`
- **Password**: `ChangeMe123!` (change this immediately!)

## Next Steps

### 1. Change Admin Password

1. Log in to the admin panel
2. Go to Settings → User Management
3. Change your password

### 2. Verify Collections

1. Go to Settings → Data Model
2. Verify all Commonplace tables are detected:
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

### 3. Configure Storage

1. Create storage bucket in Supabase: `commonplace-assets`
2. In Directus: Settings → File Storage
3. Add Supabase Storage adapter

### 4. Set Up Custom Domain (Optional)

```bash
gcloud run domain-mappings create \
  --service commonplace-directus \
  --domain directus.inquiry.institute \
  --region us-central1 \
  --project terpedia
```

Then update DNS with the CNAME record provided.

### 5. Update Environment Variables

To update configuration:

```bash
gcloud run services update commonplace-directus \
  --region us-central1 \
  --update-env-vars "KEY=value" \
  --project terpedia
```

## Useful Commands

```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=commonplace-directus" --limit 50 --project terpedia

# View service details
gcloud run services describe commonplace-directus --region us-central1 --project terpedia

# Update service
gcloud run services update commonplace-directus --region us-central1 --project terpedia

# Delete service (if needed)
gcloud run services delete commonplace-directus --region us-central1 --project terpedia
```

## Testing

```bash
# Health check
curl https://commonplace-directus-652016456291.us-central1.run.app/server/health

# API test
curl https://commonplace-directus-652016456291.us-central1.run.app/items/persons
```

## Cost

Cloud Run charges based on:
- CPU time (while handling requests)
- Memory allocated
- Number of requests

With current settings (min-instances=0):
- **Free tier**: 2 million requests/month
- **After free tier**: ~$0.40 per million requests
- **Compute**: Only charged when handling requests (scales to zero)

Estimated cost: **$0-5/month** for low traffic

---

**🎉 Commonplace Directus is now live on Google Cloud Run!**
