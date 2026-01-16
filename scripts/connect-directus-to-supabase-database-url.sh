#!/bin/bash
# Connect Directus to Supabase using DATABASE_URL format
# This might work better than individual DB_* variables

set -e

PROJECT_REF="xougqdomkoisrxdnagcj"
SERVICE_NAME="commonplace-directus"
REGION="us-central1"
GCP_PROJECT_ID=${GCP_PROJECT_ID:-"terpedia"}

if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "❌ SUPABASE_DB_PASSWORD environment variable required"
    exit 1
fi

echo "🔗 Connecting Directus to Supabase (DATABASE_URL format)"
echo "========================================================"
echo ""

# Set project
gcloud config set project $GCP_PROJECT_ID 2>/dev/null || echo "⚠️  Could not set project"

# Get current config to preserve
echo "📥 Getting current configuration..."
CURRENT_KEY=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$GCP_PROJECT_ID --format="value(spec.template.spec.containers[0].env[?(@.name=='KEY')].value)" 2>/dev/null || echo "")
CURRENT_SECRET=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$GCP_PROJECT_ID --format="value(spec.template.spec.containers[0].env[?(@.name=='SECRET')].value)" 2>/dev/null || echo "")
CURRENT_PUBLIC_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$GCP_PROJECT_ID --format="value(spec.template.spec.containers[0].env[?(@.name=='PUBLIC_URL')].value)" 2>/dev/null || echo "")
CURRENT_ADMIN_EMAIL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$GCP_PROJECT_ID --format="value(spec.template.spec.containers[0].env[?(@.name=='ADMIN_EMAIL')].value)" 2>/dev/null || echo "")
CURRENT_ADMIN_PASSWORD=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$GCP_PROJECT_ID --format="value(spec.template.spec.containers[0].env[?(@.name=='ADMIN_PASSWORD')].value)" 2>/dev/null || echo "")
CURRENT_CORS_ORIGIN=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$GCP_PROJECT_ID --format="value(spec.template.spec.containers[0].env[?(@.name=='CORS_ORIGIN')].value)" 2>/dev/null || echo "")

# Use existing or defaults
KEY=${CURRENT_KEY:-$(openssl rand -hex 32)}
SECRET=${CURRENT_SECRET:-$(openssl rand -hex 32)}
PUBLIC_URL=${CURRENT_PUBLIC_URL:-"https://commonplace-directus-lfrshkx55q-uc.a.run.app"}
ADMIN_EMAIL=${CURRENT_ADMIN_EMAIL:-"custodian@inquiry.institute"}
ADMIN_PASSWORD=${CURRENT_ADMIN_PASSWORD:-""}
CORS_ORIGIN=${CURRENT_CORS_ORIGIN:-"https://commonplace.inquiry.institute"}

# Try pooler connection (more reliable for Cloud Run)
# Use the pooler user format: postgres.PROJECT_REF
ENCODED_PASSWORD=$(printf '%s' "$SUPABASE_DB_PASSWORD" | python3 -c "import sys, urllib.parse; print(urllib.parse.quote(sys.stdin.read().strip()))" 2>/dev/null || echo "$SUPABASE_DB_PASSWORD")

DATABASE_URL="postgresql://postgres.${PROJECT_REF}:${ENCODED_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"

echo "📋 Using DATABASE_URL format"
echo "   Host: db.${PROJECT_REF}.supabase.co"
echo "   Port: 5432"
echo "   User: postgres"
echo ""

echo "📤 Updating Directus service..."
echo ""

# Update with DATABASE_URL instead of individual DB_* vars
gcloud run services update $SERVICE_NAME \
  --region=$REGION \
  --project=$GCP_PROJECT_ID \
  --update-env-vars "DATABASE_URL=$DATABASE_URL,KEY=$KEY,SECRET=$SECRET,PUBLIC_URL=$PUBLIC_URL,ADMIN_EMAIL=$ADMIN_EMAIL,ADMIN_PASSWORD=$ADMIN_PASSWORD,CORS_ENABLED=true,CORS_ORIGIN=$CORS_ORIGIN" \
  2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Directus updated successfully!"
    echo ""
    echo "⏳ Wait 30-60 seconds for service to restart..."
    echo ""
    echo "📋 Next steps:"
    echo "   1. Check Directus: $PUBLIC_URL/admin"
    echo "   2. Verify collections are detected"
    echo "   3. Test creating a work"
else
    echo ""
    echo "❌ Failed to update service"
    exit 1
fi
