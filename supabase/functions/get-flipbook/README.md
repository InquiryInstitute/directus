# Get Flipbook Edge Function

Supabase Edge Function that fetches flipbook data from Directus.

## Deployment

```bash
cd supabase/functions/get-flipbook
supabase functions deploy get-flipbook --project-ref xougqdomkoisrxdnagcj
```

## Environment Variables

Set in Supabase Dashboard → Edge Functions → get-flipbook → Settings:

- `DIRECTUS_URL`: https://directus.inquiry.institute
- `DIRECTUS_TOKEN`: (Directus public read token)
- `SUPABASE_URL`: (auto-set)
- `SUPABASE_SERVICE_ROLE_KEY`: (auto-set)

## Usage

### Get all authors

```
GET /functions/v1/get-flipbook?author=all
```

### Get works by author

```
GET /functions/v1/get-flipbook?author={authorSlug}
```

### Get specific work

```
GET /functions/v1/get-flipbook?slug={workSlug}
```

## Response Format

### Authors
```json
{
  "authors": [
    {
      "id": "uuid",
      "name": "Author Name",
      "slug": "author-slug"
    }
  ]
}
```

### Works by Author
```json
{
  "works": [
    {
      "id": "uuid",
      "title": "Work Title",
      "slug": "work-slug",
      "flipbook_manifest": { ... }
    }
  ]
}
```

### Single Work
```json
{
  "work": {
    "id": "uuid",
    "title": "Work Title",
    "content_md": "...",
    "flipbook_manifest": { ... },
    "toc": [
      {
        "id": "heading-id",
        "text": "Heading Text",
        "level": 1
      }
    ]
  }
}
```
