#!/bin/bash
# Apply Supabase Migrations
# Applies all migrations in supabase/migrations/

set -e

echo "📦 Applying Supabase Migrations"
echo "================================"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "   Install with: npm install -g supabase"
    exit 1
fi

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Supabase project not linked."
    echo "   Run: supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "Applying migrations..."
supabase db push

echo ""
echo "✅ Migrations applied successfully!"
