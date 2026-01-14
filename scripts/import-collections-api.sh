#!/bin/bash
# Import collections using Directus REST API

set -e

DIRECTUS_URL="${DIRECTUS_URL:-https://commonplace-directus-652016456291.us-central1.run.app}"
DIRECTUS_TOKEN="${DIRECTUS_TOKEN}"

if [ -z "$DIRECTUS_TOKEN" ]; then
    echo "❌ DIRECTUS_TOKEN required"
    exit 1
fi

echo "📚 Importing Collections via Directus API"
echo "=========================================="
echo ""

TABLES=(
  "persons"
  "works"
  "work_relations"
  "sources"
  "fragments"
  "themes"
  "citations"
  "work_fragments"
  "work_themes"
  "review_rounds"
  "review_assignments"
  "reviews"
  "editor_decisions"
  "change_requests"
)

# Get existing collections
echo "Fetching existing collections..."
EXISTING=$(curl -s -H "Authorization: Bearer $DIRECTUS_TOKEN" \
  "$DIRECTUS_URL/collections" | jq -r '.data[].collection' 2>/dev/null || echo "")

for table in "${TABLES[@]}"; do
  if echo "$EXISTING" | grep -q "^${table}$"; then
    echo "⏭️  Skipping $table (already exists)"
    continue
  fi

  echo "📦 Importing $table..."
  
  # Create collection from existing table
  # Directus will auto-detect fields from the database table
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $DIRECTUS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"collection\": \"$table\",
      \"meta\": {
        \"collection\": \"$table\",
        \"icon\": \"table\",
        \"note\": \"Auto-imported from database table\"
      },
      \"schema\": {
        \"name\": \"$table\"
      }
    }" \
    "$DIRECTUS_URL/collections" 2>&1)

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Imported $table"
  elif echo "$BODY" | grep -q "already exists\|RECORD_NOT_UNIQUE"; then
    echo "⚠️  $table already exists"
  else
    echo "❌ Error importing $table (HTTP $HTTP_CODE)"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  fi
done

echo ""
echo "✅ Import complete!"
