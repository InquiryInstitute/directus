#!/bin/bash
# Connect Directus to Supabase database (non-interactive version)
# Usage: SUPABASE_DB_PASSWORD="your-password" ./connect-directus-to-supabase-noninteractive.sh

set -e

PROJECT_REF="xougqdomkoisrxdnagcj"
SERVICE_NAME="commonplace-directus"
REGION="us-central1"

# Use environment variable if set, otherwise default to terpedia (where service actually is)
GCP_PROJECT_ID=${GCP_PROJECT_ID:-"terpedia"}

echo "🔗 Connecting Directus to Supabase (Non-Interactive)"
echo "===================================================="
echo ""

# Check for password
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "❌ SUPABASE_DB_PASSWORD environment variable required"
    echo ""
    echo "Usage:"
    echo "  SUPABASE_DB_PASSWORD=\"your-password\" ./connect-directus-to-supabase-noninteractive.sh"
    echo ""
    echo "Get password from:"
    echo "  https://supabase.com/dashboard/project/$PROJECT_REF/settings/database"
    exit 1
fi

# Set project
echo "🔧 Using GCP project: $GCP_PROJECT_ID"
gcloud config set project $GCP_PROJECT_ID 2>/dev/null || {
    echo "⚠️  Could not set project, continuing anyway..."
}

# Connection details - try direct connection (pooler gives "Tenant or user not found")
# Direct connection uses simpler user format
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_PORT="5432"
DB_DATABASE="postgres"
DB_USER="postgres"

echo "📋 Connection Details:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_DATABASE"
echo "   User: $DB_USER"
echo ""

# Get current environment variables to preserve
echo "📥 Getting current configuration..."
CURRENT_KEY=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$GCP_PROJECT_ID --format="value(spec.template.spec.containers[0].env[?(@.name=='KEY')].value)" 2>/dev/null || echo "")
CURRENT_SECRET=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$GCP_PROJECT_ID --format="value(spec.template.spec.containers[0].env[?(@.name=='SECRET')].value)" 2>/dev/null || echo "")
CURRENT_PUBLIC_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$GCP_PROJECT_ID --format="value(spec.template.spec.containers[0].env[?(@.name=='PUBLIC_URL')].value)" 2>/dev/null || echo "")
CURRENT_ADMIN_EMAIL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$GCP_PROJECT_ID --format="value(spec.template.spec.containers[0].env[?(@.name=='ADMIN_EMAIL')].value)" 2>/dev/null || echo "")
CURRENT_ADMIN_PASSWORD=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$GCP_PROJECT_ID --format="value(spec.template.spec.containers[0].env[?(@.name=='ADMIN_PASSWORD')].value)" 2>/dev/null || echo "")
CURRENT_CORS_ORIGIN=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$GCP_PROJECT_ID --format="value(spec.template.spec.containers[0].env[?(@.name=='CORS_ORIGIN')].value)" 2>/dev/null || echo "")

# Use existing values or defaults
KEY=${CURRENT_KEY:-$(openssl rand -hex 32)}
SECRET=${CURRENT_SECRET:-$(openssl rand -hex 32)}
PUBLIC_URL=${CURRENT_PUBLIC_URL:-"https://commonplace-directus-652016456291.us-central1.run.app"}
ADMIN_EMAIL=${CURRENT_ADMIN_EMAIL:-"custodian@inquiry.institute"}
ADMIN_PASSWORD=${CURRENT_ADMIN_PASSWORD:-""}
CORS_ORIGIN=${CURRENT_CORS_ORIGIN:-"https://commonplace.inquiry.institute"}

if [ -z "$ADMIN_PASSWORD" ]; then
    echo "⚠️  ADMIN_PASSWORD not found in current config"
    echo "   You may need to set it manually after deployment"
fi

echo ""
echo "📤 Updating Directus service..."
echo ""

# Update environment variables (PORT is reserved by Cloud Run, don't set it)
gcloud run services update $SERVICE_NAME \
  --region=$REGION \
  --project=$GCP_PROJECT_ID \
  --update-env-vars "DB_CLIENT=pg,DB_HOST=$DB_HOST,DB_PORT=$DB_PORT,DB_DATABASE=$DB_DATABASE,DB_USER=$DB_USER,DB_PASSWORD=$SUPABASE_DB_PASSWORD,KEY=$KEY,SECRET=$SECRET,PUBLIC_URL=$PUBLIC_URL,ADMIN_EMAIL=$ADMIN_EMAIL,ADMIN_PASSWORD=$ADMIN_PASSWORD,CORS_ENABLED=true,CORS_ORIGIN=$CORS_ORIGIN" \
  2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Directus updated successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Wait 30-60 seconds for the service to restart"
    echo "   2. Check Directus admin: $PUBLIC_URL/admin"
    echo "   3. Verify collections are detected (persons, works, etc.)"
    echo "   4. Test creating a work in Directus"
    echo "   5. Verify it appears in Supabase and on the frontend"
    echo ""
    echo "🔍 Check logs:"
    echo "   gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\" --limit 20 --project=$GCP_PROJECT_ID"
else
    echo ""
    echo "❌ Failed to update service"
    echo ""
    echo "💡 Check:"
    echo "   - Are you authenticated? (gcloud auth login)"
    echo "   - Do you have permissions for project $GCP_PROJECT_ID?"
    echo "   - Is the service name correct?"
    exit 1
fi
