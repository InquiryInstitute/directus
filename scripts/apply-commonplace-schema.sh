#!/bin/bash
# Apply Commonplace Schema to Supabase
# This script applies the schema directly via SQL

set -e

echo "📦 Applying Commonplace Schema to Supabase"
echo "==========================================="
echo ""

# Check if project is linked
if [ ! -f "supabase/.temp/project-ref" ]; then
    echo "⚠️  Supabase project not linked."
    echo "Linking to project xougqdomkoisrxdnagcj..."
    cd supabase
    supabase link --project-ref xougqdomkoisrxdnagcj
    cd ..
fi

PROJECT_REF=$(cat supabase/.temp/project-ref 2>/dev/null || echo "xougqdomkoisrxdnagcj")

echo "Project: $PROJECT_REF"
echo ""
echo "Applying schema via SQL Editor..."
echo ""

# Read the migration file
MIGRATION_FILE="supabase/migrations/20260113000000_commonplace_schema.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "SQL file: $MIGRATION_FILE"
echo ""
echo "Option 1: Apply via Supabase Dashboard (Recommended)"
echo "----------------------------------------------------"
echo "1. Open: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo "2. Copy the contents of: $MIGRATION_FILE"
echo "3. Paste into SQL Editor"
echo "4. Click 'Run'"
echo ""
read -p "Press Enter to open SQL Editor..." -r

# Open SQL Editor in browser
open "https://supabase.com/dashboard/project/$PROJECT_REF/sql/new" 2>/dev/null || \
  xdg-open "https://supabase.com/dashboard/project/$PROJECT_REF/sql/new" 2>/dev/null || \
  echo "Please open: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"

echo ""
echo "Option 2: Apply via psql (requires connection string)"
echo "------------------------------------------------------"
echo "If you have a database connection string, you can run:"
echo ""
echo "psql \"your-connection-string\" < $MIGRATION_FILE"
echo ""
echo "Get connection string from:"
echo "https://supabase.com/dashboard/project/$PROJECT_REF/settings/database"
echo ""

# Show migration file location
echo "Migration file is ready at:"
echo "$(pwd)/$MIGRATION_FILE"
echo ""
