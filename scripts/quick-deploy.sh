#!/bin/bash
# Quick Deployment Script for Commonplace
# This script guides you through the deployment process

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Commonplace Deployment Script           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

MISSING=0

if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "   Install: npm install -g supabase"
    MISSING=1
else
    echo -e "${GREEN}✅ Supabase CLI found${NC}"
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found${NC}"
    MISSING=1
else
    echo -e "${GREEN}✅ Docker found${NC}"
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "   Please start Docker Desktop"
    MISSING=1
else
    echo -e "${GREEN}✅ Docker is running${NC}"
fi

if [ $MISSING -eq 1 ]; then
    echo ""
    echo -e "${RED}Please install missing prerequisites and try again.${NC}"
    exit 1
fi

echo ""

# Step 1: Supabase Setup
echo -e "${BLUE}📦 Step 1: Supabase Database Setup${NC}"
echo "=================================="

read -p "Do you want to use an existing Supabase project? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Enter your Supabase project reference ID:"
    read -p "Project Ref: " PROJECT_REF
    
    echo ""
    echo "Linking to Supabase project..."
    cd supabase
    supabase link --project-ref "$PROJECT_REF" || {
        echo -e "${YELLOW}⚠️  Not linked. Attempting to link...${NC}"
        supabase login
        supabase link --project-ref "$PROJECT_REF"
    }
    cd ..
else
    echo ""
    echo "You'll need to:"
    echo "1. Create a new Supabase project at https://supabase.com"
    echo "2. Note the project reference ID"
    echo "3. Run this script again and use that project"
    exit 0
fi

echo ""
echo "Applying database migrations..."
cd supabase
supabase db push
cd ..

echo -e "${GREEN}✅ Database migrations applied!${NC}"
echo ""

# Step 2: Create Storage Bucket
echo -e "${BLUE}🗄️  Step 2: Storage Bucket Setup${NC}"
echo "================================"
echo ""
echo "Create a storage bucket in Supabase:"
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/storage/buckets"
echo "2. Click 'New Bucket'"
echo "3. Name: commonplace-assets"
echo "4. Make it PUBLIC"
echo "5. Click 'Create bucket'"
echo ""
read -p "Press Enter after creating the bucket..." -r

# Step 3: Directus Setup
echo ""
echo -e "${BLUE}🐳 Step 3: Directus Setup${NC}"
echo "=========================="

cd docker

# Get Supabase connection details
echo ""
echo "We need your Supabase connection details."
echo "Get them from: https://supabase.com/dashboard/project/$PROJECT_REF/settings/database"
echo ""

if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp env.template .env
    echo ""
    echo -e "${YELLOW}⚠️  Please edit docker/.env with your credentials!${NC}"
    echo ""
    echo "Required values:"
    echo "  DB_HOST=db.$PROJECT_REF.supabase.co"
    echo "  DB_DATABASE=postgres"
    echo "  DB_USER=postgres"
    echo "  DB_PASSWORD=<your-database-password>"
    echo ""
    echo "Generate Directus keys:"
    echo "  ./scripts/generate-directus-keys.sh"
    echo ""
    read -p "Press Enter after editing .env file..." -r
fi

# Generate keys if needed
if grep -q "your-directus-key-here" .env 2>/dev/null; then
    echo ""
    echo "Generating Directus keys..."
    cd ..
    ./scripts/generate-directus-keys.sh
    echo ""
    echo -e "${YELLOW}⚠️  Copy the keys above into docker/.env${NC}"
    read -p "Press Enter after updating .env with keys..." -r
    cd docker
fi

echo ""
echo "Starting Directus container..."
docker compose up -d

echo ""
echo "Waiting for Directus to start..."
sleep 15

# Check health
if curl -f http://localhost:8055/server/health &> /dev/null; then
    echo -e "${GREEN}✅ Directus is running!${NC}"
else
    echo -e "${YELLOW}⚠️  Directus may still be starting...${NC}"
    echo "   Check status: docker logs commonplace-directus"
fi

cd ..

# Step 4: Summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Deployment Complete!                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Access Directus Admin:"
echo -e "   ${BLUE}http://localhost:8055/admin${NC}"
echo "   Use the ADMIN_EMAIL and ADMIN_PASSWORD from docker/.env"
echo ""
echo "2. Configure Directus:"
echo "   - Import schema (Settings → Data Model)"
echo "   - Create roles (Settings → Roles & Permissions)"
echo "   - Configure storage (Settings → File Storage)"
echo ""
echo "3. Test the API:"
echo "   curl http://localhost:8055/server/health"
echo ""
echo "4. Deploy Frontend (when ready):"
echo "   cd frontend && npm install && npm run dev"
echo ""
echo "For production deployment, see: docs/DEPLOYMENT.md"
echo ""
