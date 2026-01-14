# Cloud Run Deployment Status

## Current Issue

Directus container is failing to start on Cloud Run. The error indicates:
1. Database connection issues
2. Container startup timeout

## Solutions

### Option 1: Use Direct Connection (Not Pooler)

The pooler connection might be causing issues. Try using direct connection:

Edit `quick-deploy.sh`:
```bash
DB_PORT="5432"  # Direct connection
DB_USER="postgres"  # Not pooler user
```

### Option 2: Deploy Manually with Correct Settings

```bash
# Build and push image
gcloud builds submit --tag gcr.io/terpedia/commonplace-directus

# Deploy with environment variables
gcloud run deploy commonplace-directus \
  --image gcr.io/terpedia/commonplace-directus \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "DB_CLIENT=pg,DB_HOST=db.xougqdomkoisrxdnagcj.supabase.co,DB_PORT=5432,DB_DATABASE=postgres,DB_USER=postgres,DB_PASSWORD=xmJxxPpPJsSOAf7y,KEY=49c49a255d79af8bb7f6656aced1a329c7427df3097252ffe229ab29dfe10583,SECRET=994d7188e34e04df628fe5a032c5950490ccb9aca68baeb9494d85a80ae4a7a5,PUBLIC_URL=https://directus.inquiry.institute,ADMIN_EMAIL=admin@inquiry.institute,ADMIN_PASSWORD=ChangeMe123!,CORS_ENABLED=true,CORS_ORIGIN=https://commonplace.inquiry.institute,PORT=8080" \
  --port 8080 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --min-instances 0 \
  --max-instances 10
```

### Option 3: Check Database Connection

Test database connection first:
```bash
# Test from your machine
psql "postgresql://postgres:xmJxxPpPJsSOAf7y@db.xougqdomkoisrxdnagcj.supabase.co:5432/postgres" -c "SELECT 1"
```

### Option 4: Use Secret Manager (Recommended for Production)

Store sensitive values in Secret Manager instead of environment variables.

## Next Steps

1. Verify database credentials are correct
2. Test database connection from Cloud Run's network
3. Check Supabase project is not paused
4. Verify firewall/network rules allow connections
