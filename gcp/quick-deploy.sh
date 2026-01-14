#!/bin/bash
# Quick deploy to Cloud Run with pre-configured values

set -e

PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"

# Database credentials (from earlier setup)
DB_HOST="db.xougqdomkoisrxdnagcj.supabase.co"
DB_PORT="6543"  # Using pooler
DB_DATABASE="postgres"
DB_USER="postgres.xougqdomkoisrxdnagcj"
DB_PASSWORD="xmJxxPpPJsSOAf7y"

# Directus keys (from earlier)
DIRECTUS_KEY="49c49a255d79af8bb7f6656aced1a329c7427df3097252ffe229ab29dfe10583"
DIRECTUS_SECRET="994d7188e34e04df628fe5a032c5950490ccb9aca68baeb9494d85a80ae4a7a5"

# Admin
ADMIN_EMAIL="admin@inquiry.institute"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-ChangeMe123!}"  # Set this or it will use default

# URLs
PUBLIC_URL="${PUBLIC_URL:-https://directus.inquiry.institute}"
CORS_ORIGIN="https://commonplace.inquiry.institute https://inquiry.institute"

echo "🚀 Deploying Directus to Cloud Run"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Enable APIs
echo "Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com --project="$PROJECT_ID" 2>/dev/null || true

# Deploy
echo "Building and deploying..."
cd "$(dirname "$0")"

gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_DB_HOST="$DB_HOST",_DB_PORT="$DB_PORT",_DB_DATABASE="$DB_DATABASE",_DB_USER="$DB_USER",_DB_PASSWORD="$DB_PASSWORD",_DIRECTUS_KEY="$DIRECTUS_KEY",_DIRECTUS_SECRET="$DIRECTUS_SECRET",_ADMIN_EMAIL="$ADMIN_EMAIL",_ADMIN_PASSWORD="$ADMIN_PASSWORD",_PUBLIC_URL="$PUBLIC_URL",_CORS_ORIGIN="$CORS_ORIGIN" \
  --project="$PROJECT_ID"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Getting service URL..."
SERVICE_URL=$(gcloud run services describe commonplace-directus --region="$REGION" --format="value(status.url)" --project="$PROJECT_ID" 2>/dev/null || echo "")
if [ -n "$SERVICE_URL" ]; then
    echo "Service URL: $SERVICE_URL"
    echo "Admin Panel: $SERVICE_URL/admin"
else
    echo "Service is deploying. Check status with:"
    echo "gcloud run services describe commonplace-directus --region=$REGION"
fi
