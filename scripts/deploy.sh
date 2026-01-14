#!/bin/bash
# Commonplace Deployment Script
# Deploys the complete Commonplace system: Supabase + Directus + Frontend

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🚀 Commonplace Deployment Script"
echo "================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI is not installed.${NC}"
    echo "   Install with: npm install -g supabase"
    exit 1
fi
echo -e "${GREEN}✅ Supabase CLI found${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker found${NC}"

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not available.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose found${NC}"

echo ""

# Step 1: Supabase setup
echo "📦 Step 1: Supabase Setup"
echo "-------------------------"

if [ ! -f ".supabase/config.toml" ]; then
    echo -e "${YELLOW}⚠️  Supabase project not linked.${NC}"
    echo ""
    echo "Please link your Supabase project:"
    echo "  supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    read -p "Have you linked your Supabase project? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please link your project first and run this script again."
        exit 1
    fi
fi

echo "Applying database migrations..."
cd supabase
supabase db push
cd ..
echo -e "${GREEN}✅ Migrations applied${NC}"
echo ""

# Step 2: Directus setup
echo "🐳 Step 2: Directus Setup"
echo "-------------------------"

cd docker

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found.${NC}"
    echo "Creating from template..."
    cp env.template .env
    echo -e "${YELLOW}⚠️  Please edit docker/.env with your credentials!${NC}"
    echo ""
    read -p "Press Enter after editing .env file..." -r
fi

echo "Starting Directus container..."
docker compose up -d

echo "Waiting for Directus to start..."
sleep 10

# Check if Directus is healthy
if curl -f http://localhost:8055/server/health &> /dev/null; then
    echo -e "${GREEN}✅ Directus is running${NC}"
else
    echo -e "${YELLOW}⚠️  Directus may still be starting. Check with: docker logs commonplace-directus${NC}"
fi

cd ..
echo ""

# Step 3: Frontend setup (optional)
echo "🌐 Step 3: Frontend Setup (Optional)"
echo "-------------------------------------"

read -p "Do you want to set up the frontend? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd frontend
    
    if [ ! -f "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi
    
    if [ ! -f ".env.local" ]; then
        echo "Creating .env.local from template..."
        cp env.template .env.local
        echo -e "${YELLOW}⚠️  Please edit frontend/.env.local with your Directus URL and token!${NC}"
    fi
    
    echo "Frontend setup complete. Run 'npm run dev' to start development server."
    cd ..
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Visit Directus admin: http://localhost:8055/admin"
echo "2. Configure collections, roles, and permissions in Directus"
echo "3. Set up storage adapters for Supabase Storage"
echo "4. Configure DNS (see docs/DNS_SETUP.md)"
echo "5. Deploy frontend to Cloudflare Pages (when ready)"
echo ""
