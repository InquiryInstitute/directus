# Commonplace Import Scripts

## Import Inquirer Articles

Import articles from The Inquirer (inquirer-quarterly) into Commonplace.

### Prerequisites

1. **Directus Token**: Get a token from Directus admin panel
   - Go to: https://directus.inquiry.institute/admin
   - Settings → Access Tokens → Create Token
   - Give it read/write permissions

2. **Inquirer Posts**: Ensure articles are in `../Inquiry.Institute/inquirer-quarterly/posts`

### Usage

```bash
# Set your Directus token
export DIRECTUS_TOKEN="your-token-here"

# Run import
./scripts/import-inquirer-articles.sh
```

Or with custom paths:

```bash
export DIRECTUS_TOKEN="your-token-here"
export DIRECTUS_URL="https://directus.inquiry.institute"
export INQUIRER_POSTS_ROOT="/path/to/inquirer-quarterly/posts"
./scripts/import-inquirer-articles.sh
```

### What It Does

1. **Scans** all markdown files in `inquirer-quarterly/posts/{volume}/{issue}/`
2. **Parses** frontmatter and content
3. **Creates** works in Directus:
   - Original articles → `works` with type `essay`
   - Revisions → `works` with status `revised`
   - Author responses → `works` with type `essay`
   - Reviews → `works` with type `review_article`
4. **Links** revisions and responses to original articles via `work_relations`
5. **Creates** authors as `persons` if they don't exist

### Article Types

- **Original Articles**: Main published articles
- **Revisions**: Files with `-revised` in filename → linked as `revises` relation
- **Author Responses**: Files with `-author-response` → linked as `responds_to` relation
- **Reviews**: Review articles

### Example

```bash
# Import all articles
export DIRECTUS_TOKEN="abc123..."
./scripts/import-inquirer-articles.sh

# Output:
# 📚 Importing Inquirer articles to Commonplace
# Collecting articles...
# Found 25 articles
# 
# Original articles: 15
# Revisions: 5
# Author responses: 3
# Reviews: 2
# 
# Importing original articles...
# ✅ Imported: a-plato-creating-historical-avatars (uuid-123)
# ...
```

### Troubleshooting

**Error: "DIRECTUS_TOKEN environment variable is required"**
- Set the token: `export DIRECTUS_TOKEN="your-token"`

**Error: "Inquirer posts directory not found"**
- Set the path: `export INQUIRER_POSTS_ROOT="/path/to/posts"`

**Error: "Already exists"**
- The script skips duplicates. To re-import, delete works from Directus first.

**Error: "Could not find faculty person"**
- Faculty persons need to exist in `persons` table first
- Create them manually or import faculty data separately
