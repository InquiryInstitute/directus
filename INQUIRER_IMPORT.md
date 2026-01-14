# Import Inquirer Articles to Commonplace

## Overview

This script imports articles from The Inquirer (stored in `inquirer-quarterly/posts`) into the Commonplace system via Directus.

## What Gets Imported

### Article Types

1. **Original Articles** → `works` with type `essay`
   - Main published articles
   - Status: `published`
   - Visibility: `public`

2. **Revisions** → `works` with type `essay`
   - Files with `-revised` in filename
   - Status: `revised`
   - Linked to original via `work_relations` with type `revises`

3. **Author Responses** → `works` with type `essay`
   - Files with `-author-response` in filename
   - Status: `published` or `draft` (based on frontmatter)
   - Linked to original via `work_relations` with type `responds_to`

4. **Reviews** → `works` with type `review_article`
   - Files in `reviews/` subdirectory or with `review` in filename
   - Status: `published`
   - Standalone works (not linked to originals)

## Setup

### 1. Get Directus Token

1. Go to: https://directus.inquiry.institute/admin
2. Settings → Access Tokens
3. Create Token
4. Give it read/write permissions for:
   - `persons` (read/write)
   - `works` (read/write)
   - `work_relations` (read/write)

### 2. Set Environment Variables

```bash
export DIRECTUS_URL="https://directus.inquiry.institute"
export DIRECTUS_TOKEN="your-token-here"
export INQUIRER_POSTS_ROOT="../Inquiry.Institute/inquirer-quarterly/posts"  # Optional
```

### 3. Run Import

```bash
cd /Users/danielmcshan/GitHub/directus
./scripts/import-inquirer-articles.sh
```

## What the Script Does

1. **Scans** all markdown files in `inquirer-quarterly/posts/{volume}/{issue}/`
2. **Parses** YAML frontmatter and markdown content
3. **Creates** authors as `persons` if they don't exist
4. **Imports** articles as `works` in Directus
5. **Links** revisions and responses to original articles
6. **Handles** duplicates (skips if work already exists)

## Example Output

```
📚 Importing Inquirer articles to Commonplace

Collecting articles...
Found 45 articles

Original articles: 20
Revisions: 12
Author responses: 8
Reviews: 5

Importing original articles...
✅ Imported: a-plato-creating-historical-avatars (uuid-123)
✅ Imported: a-darwin-the-platypus-and-the-intelligence-of-evolution (uuid-456)
...

Importing revisions...
✅ Imported: a-plato-creating-historical-avatars-revised (uuid-789)
  ✅ Linked revises: uuid-789 → uuid-123
...

Importing author responses...
✅ Imported: a-plato-creating-historical-avatars-author-response (uuid-abc)
  ✅ Linked responds_to: uuid-abc → uuid-123
...

✅ Import complete!
```

## Article Mapping

### Frontmatter → Directus Fields

| Frontmatter | Directus Field | Notes |
|------------|----------------|-------|
| `title` | `works.title` | Required |
| `slug` | `works.slug` | Required, must be unique |
| `authors[0]` | `works.primary_author_id` | Creates person if needed |
| `summary` | `works.abstract` | |
| Content | `works.content_md` | Markdown content |
| `date_published` | `works.published_at` | |
| `status` | `works.status` | `published` → `published`, `preprint` → `submitted` |
| `faculty` | Used to find faculty person | e.g., `a.plato` → finds person with slug `plato` |

### Work Relations

- **Revisions**: `from_work_id` (revision) → `to_work_id` (original), `relation_type: 'revises'`
- **Author Responses**: `from_work_id` (response) → `to_work_id` (original), `relation_type: 'responds_to'`

## Troubleshooting

### "DIRECTUS_TOKEN environment variable is required"
- Set the token: `export DIRECTUS_TOKEN="your-token"`

### "Inquirer posts directory not found"
- Set the path: `export INQUIRER_POSTS_ROOT="/path/to/posts"`

### "Already exists" warnings
- The script skips duplicates. To re-import, delete works from Directus first.

### "Original work not found" warnings
- The script tries multiple patterns to match revisions/responses to originals
- If it can't find the original, the revision/response will still be imported but not linked
- Check the slug patterns in the articles

### "Could not find faculty person"
- Faculty persons need to exist in `persons` table first
- Create them manually in Directus or import faculty data separately

## After Import

Once imported, articles will be available in:
- **Directus Admin**: https://directus.inquiry.institute/admin
- **Commonplace Library**: https://commonplace.inquiry.institute
- **API**: `GET /items/works?filter[status][_eq]=published`

## Next Steps

1. Review imported works in Directus
2. Verify work relations are correct
3. Add any missing metadata
4. Generate flipbook manifests for published works
5. Publish to Commonplace library
