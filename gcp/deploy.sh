#!/bin/bash
# Deploy Directus to Google Cloud Run

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 Deploying Directus to Google Cloud Run"
echo "=========================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed${NC}"
    echo "Install: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}⚠️  Not logged in to gcloud${NC}"
    echo "Running: gcloud auth login"
    gcloud auth login
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  No project set${NC}"
    echo "Available projects:"
    gcloud projects list
    read -p "Enter project ID: " PROJECT_ID
    gcloud config set project "$PROJECT_ID"
fi

echo -e "${GREEN}✅ Using project: $PROJECT_ID${NC}"
echo ""

# Check if Cloud Build API is enabled
echo "Checking required APIs..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com --project="$PROJECT_ID" 2>/dev/null || true

# Get environment variables
echo ""
echo "Enter Supabase database credentials:"
read -p "DB_HOST (e.g., db.xxxxx.supabase.co): " DB_HOST
read -p "DB_PORT [5432 or 6543 for pooler]: " DB_PORT
DB_PORT=${DB_PORT:-5432}
read -p "DB_DATABASE [postgres]: " DB_DATABASE
DB_DATABASE=${DB_DATABASE:-postgres}
read -p "DB_USER [postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}
read -sp "DB_PASSWORD: " DB_PASSWORD
echo ""

echo ""
echo "Enter Directus configuration:"
read -p "DIRECTUS_KEY (or press Enter to generate): " DIRECTUS_KEY
if [ -z "$DIRECTUS_KEY" ]; then
    DIRECTUS_KEY=$(openssl rand -hex 32)
    echo "Generated KEY: $DIRECTUS_KEY"
fi
read -p "DIRECTUS_SECRET (or press Enter to generate): " DIRECTUS_SECRET
if [ -z "$DIRECTUS_SECRET" ]; then
    DIRECTUS_SECRET=$(openssl rand -hex 32)
    echo "Generated SECRET: $DIRECTUS_SECRET"
fi

read -p "ADMIN_EMAIL [admin@inquiry.institute]: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@inquiry.institute}
read -sp "ADMIN_PASSWORD: " ADMIN_PASSWORD
echo ""

read -p "PUBLIC_URL (e.g., https://directus.inquiry.institute): " PUBLIC_URL
read -p "CORS_ORIGIN [https://commonplace.inquiry.institute]: " CORS_ORIGIN
CORS_ORIGIN=${CORS_ORIGIN:-https://commonplace.inquiry.institute}

# Set substitution variables
echo ""
echo "Setting Cloud Build substitution variables..."
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_DB_HOST="$DB_HOST",_DB_PORT="$DB_PORT",_DB_DATABASE="$DB_DATABASE",_DB_USER="$DB_USER",_DB_PASSWORD="$DB_PASSWORD",_DIRECTUS_KEY="$DIRECTUS_KEY",_DIRECTUS_SECRET="$DIRECTUS_SECRET",_ADMIN_EMAIL="$ADMIN_EMAIL",_ADMIN_PASSWORD="$ADMIN_PASSWORD",_PUBLIC_URL="$PUBLIC_URL",_CORS_ORIGIN="$CORS_ORIGIN" \
  --project="$PROJECT_ID"

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Get your service URL:"
gcloud run services describe commonplace-directus --region=us-central1 --format="value(status.url)" --project="$PROJECT_ID"
