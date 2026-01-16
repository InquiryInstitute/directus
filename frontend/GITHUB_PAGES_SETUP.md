# GitHub Pages Setup for Commonplace

## Overview

The Commonplace frontend is deployed to GitHub Pages, serving the static library and book pages.

## Repository Structure

- **Repository**: `InquiryInstitute/directus`
- **Branch**: `main`
- **Source**: `frontend/` directory
- **Output**: `frontend/out/` (Next.js static export)

## Deployment

### Automatic Deployment

Deployment happens automatically via GitHub Actions when you push to `main`:

1. **Workflow**: `.github/workflows/deploy-pages.yml`
2. **Builds**: Next.js static export
3. **Deploys**: To GitHub Pages

### Manual Setup (First Time)

1. **Enable GitHub Pages**:
   - Go to: https://github.com/InquiryInstitute/directus/settings/pages
   - Source: Select **"GitHub Actions"**
   - Save

2. **Add Secrets** (Settings → Secrets and variables → Actions):
   - `DIRECTUS_URL`: `https://directus.inquiry.institute`
   - `DIRECTUS_TOKEN`: (Directus public read token)
   - `SUPABASE_URL`: `https://pilmscrodlitdrygabvo.supabase.co`

3. **Deploy**:
   ```bash
   git push origin main
   ```

## Custom Domain Setup

### 1. Configure in GitHub Pages

1. Go to: https://github.com/InquiryInstitute/directus/settings/pages
2. Under "Custom domain", enter:
   ```
   commonplace.inquiry.institute
   ```
3. Check **"Enforce HTTPS"**
4. Save

### 2. Configure DNS (Route 53)

```bash
cd aws
./route53-commonplace.sh
```

Or manually:

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z053032935YKZE3M0E0D1 \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "commonplace.inquiry.institute",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "InquiryInstitute.github.io"}]
      }
    }]
  }'
```

### 3. Wait for DNS Propagation

- Usually 5-60 minutes
- Check: https://dnschecker.org/#CNAME/commonplace.inquiry.institute

## URL Structure

- **Library**: `https://commonplace.inquiry.institute/`
- **Author Bookshelf**: `https://commonplace.inquiry.institute/authors/{authorSlug}`
- **Book Reader**: `https://commonplace.inquiry.institute/authors/{authorSlug}/{workSlug}`

## Features

✅ **Library View**: 3D book spines with author names  
✅ **Search**: Scrolls to selected author/work  
✅ **Page-flip Reader**: StPageFlip integration  
✅ **Table of Contents**: Auto-generated from markdown headings  
✅ **Dynamic Content**: Fetched from Supabase Edge Function  

## Development

```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:3000
```

## Build Locally

```bash
cd frontend
npm run build
# Output in frontend/out/
```

## Troubleshooting

### Build Fails

- Check GitHub Actions logs
- Verify all environment variables are set
- Check `next.config.js` configuration

### Pages Not Loading

- Verify GitHub Pages is enabled
- Check custom domain is configured
- Verify DNS has propagated

### API Errors

- Check Supabase Edge Function is deployed
- Verify Directus is accessible
- Check browser console for errors
