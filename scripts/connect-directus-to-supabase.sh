#!/bin/bash
# Connect Directus to Supabase database
# This updates the Cloud Run service to use Supabase instead of its current database

set -e

PROJECT_REF="xougqdomkoisrxdnagcj"
SERVICE_NAME="commonplace-directus"
REGION="us-central1"

# Detect the project from the service URL
# The service URL is: commonplace-directus-652016456291.us-central1.run.app
# Project number 652016456291 can help identify the project
if [ -z "$GCP_PROJECT_ID" ]; then
    # Check if we can find it by project number
    DETECTED_PROJECT=$(gcloud projects list --filter="projectNumber:652016456291" --format="value(projectId)" 2>/dev/null || echo "")
    if [ -n "$DETECTED_PROJECT" ]; then
        GCP_PROJECT_ID="$DETECTED_PROJECT"
        echo "✅ Detected Directus project: $GCP_PROJECT_ID (from service URL)"
    else
        echo "⚠️  Could not auto-detect project"
        echo "   Available projects:"
        gcloud projects list --format="table(projectId,projectNumber,name)" | head -10
        echo ""
        read -p "Enter the GCP project ID where Directus is deployed: " GCP_PROJECT_ID
    fi
fi

echo "🔗 Connecting Directus to Supabase"
echo "==================================="
echo ""
echo "This will update Directus to use Supabase as its database."
echo "All existing Directus data will remain in the old database."
echo ""

# Get database password
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "Enter your Supabase database password:"
    echo "   (Get it from: https://supabase.com/dashboard/project/$PROJECT_REF/settings/database)"
    echo "   If you don't have it, you can reset it in the Supabase dashboard"
    echo ""
    read -sp "Password: " SUPABASE_DB_PASSWORD
    echo ""
    echo ""
fi

if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "❌ Database password required"
    exit 1
fi

# Use connection pooler (more reliable for Cloud Run)
DB_HOST="aws-0-us-east-1.pooler.supabase.com"
DB_PORT="6543"
DB_DATABASE="postgres"
DB_USER="postgres.${PROJECT_REF}"

echo "📋 Connection Details:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_DATABASE"
echo "   User: $DB_USER"
echo ""

# Set the correct project
echo "🔧 Using GCP project: $GCP_PROJECT_ID"
echo "   If this is wrong, update GCP_PROJECT_ID in the script"
gcloud config set project $GCP_PROJECT_ID 2>/dev/null || {
    echo "⚠️  Could not set project: $GCP_PROJECT_ID"
    echo "   Available projects:"
    gcloud projects list --format="table(projectId,projectNumber,name)" | head -10
    echo ""
    read -p "Enter the correct project ID: " GCP_PROJECT_ID
    gcloud config set project $GCP_PROJECT_ID
}

# Get current environment variables to preserve non-DB vars
echo "📥 Getting current environment variables..."
CURRENT_ENV=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$GCP_PROJECT_ID --format="value(spec.template.spec.containers[0].env)" 2>/dev/null || echo "")

# Extract non-DB environment variables
# We'll preserve: KEY, SECRET, PUBLIC_URL, ADMIN_EMAIL, ADMIN_PASSWORD, CORS_ENABLED, CORS_ORIGIN, PORT

echo "🔍 Checking current configuration..."
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

# Update environment variables
# Note: We need to URL-encode the password for gcloud
ENCODED_PASSWORD=$(printf '%s' "$SUPABASE_DB_PASSWORD" | jq -sRr @uri)

gcloud run services update $SERVICE_NAME \
  --region=$REGION \
  --update-env-vars "DB_CLIENT=pg,DB_HOST=$DB_HOST,DB_PORT=$DB_PORT,DB_DATABASE=$DB_DATABASE,DB_USER=$DB_USER,DB_PASSWORD=$SUPABASE_DB_PASSWORD,KEY=$KEY,SECRET=$SECRET,PUBLIC_URL=$PUBLIC_URL,ADMIN_EMAIL=$ADMIN_EMAIL,ADMIN_PASSWORD=$ADMIN_PASSWORD,CORS_ENABLED=true,CORS_ORIGIN=$CORS_ORIGIN,PORT=8080" \
  2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Directus updated successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Wait a few seconds for the service to restart"
    echo "   2. Check Directus admin: $PUBLIC_URL/admin"
    echo "   3. Verify collections are detected (persons, works, etc.)"
    echo "   4. Test creating a work in Directus"
    echo "   5. Verify it appears in Supabase and on the frontend"
    echo ""
    echo "🔍 Check logs:"
    echo "   gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\" --limit 20 --region=$REGION"
else
    echo ""
    echo "❌ Failed to update service"
    echo ""
    echo "💡 Alternative: Update manually via Cloud Console"
    echo "   https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME"
    exit 1
fi
