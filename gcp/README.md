# Deploy Directus to Google Cloud Run

This guide helps you deploy the Commonplace Directus instance to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **gcloud CLI** installed: https://cloud.google.com/sdk/docs/install
3. **Supabase Database** credentials ready

## Quick Deploy

```bash
cd gcp
chmod +x deploy.sh
./deploy.sh
```

## Manual Deploy

### 1. Set Up GCP Project

```bash
# Login
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com
```

### 2. Configure Environment Variables

Edit `cloudbuild.yaml` and set substitution variables, or use the deploy script.

### 3. Deploy

```bash
# Build and deploy
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_DB_HOST="db.xxxxx.supabase.co",_DB_PORT="5432",_DB_DATABASE="postgres",_DB_USER="postgres",_DB_PASSWORD="your-password",_DIRECTUS_KEY="your-key",_DIRECTUS_SECRET="your-secret",_PUBLIC_URL="https://directus.inquiry.institute",_ADMIN_EMAIL="admin@inquiry.institute",_ADMIN_PASSWORD="your-admin-password",_CORS_ORIGIN="https://commonplace.inquiry.institute"
```

## Environment Variables

Required variables (set via Cloud Build substitutions):

- `_DB_HOST`: Supabase database host
- `_DB_PORT`: Database port (5432 or 6543 for pooler)
- `_DB_DATABASE`: Database name (usually `postgres`)
- `_DB_USER`: Database user
- `_DB_PASSWORD`: Database password
- `_DIRECTUS_KEY`: Directus key (generate with `openssl rand -hex 32`)
- `_DIRECTUS_SECRET`: Directus secret (generate with `openssl rand -hex 32`)
- `_ADMIN_EMAIL`: Admin email
- `_ADMIN_PASSWORD`: Admin password
- `_PUBLIC_URL`: Public URL for Directus (e.g., `https://directus.inquiry.institute`)
- `_CORS_ORIGIN`: CORS allowed origins

## Using Secret Manager (Recommended)

For production, use Secret Manager instead of build substitutions:

### 1. Create Secrets

```bash
# Database password
echo -n "your-db-password" | gcloud secrets create db-password --data-file=-

# Directus secret
echo -n "your-directus-secret" | gcloud secrets create directus-secret --data-file=-

# Admin password
echo -n "your-admin-password" | gcloud secrets create admin-password --data-file=-
```

### 2. Grant Access

```bash
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding db-password \
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Update cloudbuild.yaml

Add secret references in the deploy step:

```yaml
--set-secrets=DB_PASSWORD=db-password:latest,DIRECTUS_SECRET=directus-secret:latest,ADMIN_PASSWORD=admin-password:latest
```

## Custom Domain

### 1. Map Domain to Cloud Run

```bash
gcloud run domain-mappings create \
  --service commonplace-directus \
  --domain directus.inquiry.institute \
  --region us-central1
```

### 2. Update DNS

Add the CNAME record provided by Cloud Run to your DNS provider.

## Monitoring

```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=commonplace-directus" --limit 50

# View service status
gcloud run services describe commonplace-directus --region=us-central1
```

## Scaling

Cloud Run automatically scales based on traffic. Configured limits:

- **Min instances**: 1 (always warm)
- **Max instances**: 10
- **Memory**: 2Gi
- **CPU**: 2

Adjust in `cloudbuild.yaml`:

```yaml
--min-instances=1
--max-instances=10
--memory=2Gi
--cpu=2
```

## Cost Estimation

Cloud Run pricing:
- **CPU**: $0.00002400 per vCPU-second
- **Memory**: $0.00000250 per GiB-second
- **Requests**: $0.40 per million requests

With 1 min instance always running:
- ~$15-30/month (depending on traffic)

## Troubleshooting

### Service won't start

```bash
# Check logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=commonplace-directus" --limit 100

# Check service status
gcloud run services describe commonplace-directus --region=us-central1
```

### Database connection issues

- Verify DB_HOST, DB_USER, DB_PASSWORD are correct
- Check if using pooler (port 6543) or direct (port 5432)
- Ensure Supabase project is active (not paused)

### Environment variables not set

- Check Cloud Run service environment variables:
  ```bash
  gcloud run services describe commonplace-directus --region=us-central1 --format="value(spec.template.spec.containers[0].env)"
  ```

## Next Steps

After deployment:

1. Access Directus Admin: `https://your-service-url.run.app/admin`
2. Configure collections and roles
3. Set up storage adapters
4. Map custom domain (optional)
