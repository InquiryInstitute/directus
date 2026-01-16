#!/bin/bash
# Connect Directus to Supabase using connection pooler
# Pooler uses different user format: postgres.PROJECT_REF

set -e

PROJECT_REF="xougqdomkoisrxdnagcj"
SERVICE_NAME="commonplace-directus"
REGION="us-central1"
GCP_PROJECT_ID=${GCP_PROJECT_ID:-"terpedia"}
PASSWORD="QZTzbxbx688sAWfS"

echo "🔗 Connect Directus to Supabase (Connection Pooler)"
echo "=================================================="
echo ""

# Set project
gcloud config set project $GCP_PROJECT_ID 2>/dev/null || echo "⚠️  Could not set project"

# Get current config
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
PUBLIC_URL=${CURRENT_PUBLIC_URL:-"https://commonplace-directus-652016456291.us-central1.run.app"}
ADMIN_EMAIL=${CURRENT_ADMIN_EMAIL:-"custodian@inquiry.institute"}
ADMIN_PASSWORD=${CURRENT_ADMIN_PASSWORD:-""}
CORS_ORIGIN=${CURRENT_CORS_ORIGIN:-"https://commonplace.inquiry.institute"}

# URL encode password for connection string
ENCODED_PASSWORD=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$PASSWORD'))" 2>/dev/null || echo "$PASSWORD")

# Use connection pooler (recommended by Supabase)
# Pooler uses port 6543 and user format: postgres.PROJECT_REF
DB_HOST="aws-0-us-east-1.pooler.supabase.com"
DB_PORT="6543"
DB_DATABASE="postgres"
DB_USER="postgres.${PROJECT_REF}"

DATABASE_URL="postgresql://${DB_USER}:${ENCODED_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?sslmode=require"

echo "📋 Connection Details (Pooler):"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_DATABASE"
echo "   User: $DB_USER"
echo "   Password: ${PASSWORD:0:4}..."
echo ""

echo "📤 Updating Directus service..."
echo "   Using connection pooler (recommended by Supabase)"
echo ""

# Update with pooler connection
gcloud run services update $SERVICE_NAME \
  --region=$REGION \
  --project=$GCP_PROJECT_ID \
  --update-env-vars "DB_CLIENT=pg,DB_HOST=$DB_HOST,DB_PORT=$DB_PORT,DB_DATABASE=$DB_DATABASE,DB_USER=$DB_USER,DB_PASSWORD=$PASSWORD,DB_SSL=true,DATABASE_URL=$DATABASE_URL,KEY=$KEY,SECRET=$SECRET,PUBLIC_URL=$PUBLIC_URL,ADMIN_EMAIL=$ADMIN_EMAIL,ADMIN_PASSWORD=$ADMIN_PASSWORD,CORS_ENABLED=true,CORS_ORIGIN=$CORS_ORIGIN" \
  2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Service updated!"
    echo ""
    echo "⏳ Waiting 45 seconds for service to start and health check..."
    sleep 45
    
    echo ""
    echo "🔍 Checking service status..."
    LATEST_REVISION=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$GCP_PROJECT_ID --format="value(status.latestCreatedRevisionName)" 2>/dev/null)
    READY_REVISION=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$GCP_PROJECT_ID --format="value(status.latestReadyRevisionName)" 2>/dev/null)
    
    if [ "$LATEST_REVISION" = "$READY_REVISION" ] && [ -n "$READY_REVISION" ]; then
        echo "✅ New revision is READY and ACTIVE!"
        echo ""
        echo "🌐 Check Directus: $PUBLIC_URL/admin"
        echo "📊 Verify collections are detected from Supabase"
    else
        echo "⚠️  Latest: $LATEST_REVISION"
        echo "   Ready: $READY_REVISION"
        echo "   Check logs for details"
    fi
    
    echo ""
    echo "📋 Check logs:"
    echo "   gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\" --limit 20 --project=$GCP_PROJECT_ID"
else
    echo ""
    echo "❌ Failed to update service"
    exit 1
fi
