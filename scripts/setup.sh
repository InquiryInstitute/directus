#!/bin/bash
# Commonplace Setup Script
# Initializes the Commonplace system: creates .env files, starts Docker, etc.

set -e

echo "🚀 Commonplace Setup Script"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ -f "docker/.env" ]; then
    echo -e "${YELLOW}⚠️  docker/.env already exists. Skipping creation.${NC}"
else
    echo "📝 Creating docker/.env from .env.example..."
    cp docker/.env.example docker/.env
    echo -e "${GREEN}✅ Created docker/.env${NC}"
    echo -e "${YELLOW}⚠️  Please edit docker/.env with your Supabase credentials!${NC}"
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

echo ""
echo "🐳 Starting Directus container..."
cd docker
docker-compose up -d

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit docker/.env with your Supabase credentials"
echo "2. Visit http://localhost:8055/admin to access Directus"
echo "3. Apply database migrations (see docs/DEPLOYMENT.md)"
echo ""
