# ✅ GitHub Pages Configured

## Status

GitHub Pages has been configured for the Commonplace frontend.

## Configuration

- **Repository**: `InquiryInstitute/directus`
- **Source**: GitHub Actions workflow (`.github/workflows/deploy-pages.yml`)
- **Build Type**: Workflow
- **Branch**: `main`
- **Output Directory**: `frontend/out/`
- **Custom Domain**: `commonplace.inquiry.institute` (to be configured)

## Next Steps

### 1. Configure Custom Domain

After the first deployment completes:

1. Go to: https://github.com/InquiryInstitute/directus/settings/pages
2. Under "Custom domain", enter:
   ```
   commonplace.inquiry.institute
   ```
3. Check **"Enforce HTTPS"**
4. Save

### 2. Update DNS

Once custom domain is configured in GitHub, update Route 53:

```bash
cd aws
./setup-commonplace-dns.sh
```

Or manually update the CNAME record to point to the GitHub Pages domain provided.

### 3. Add Secrets

Add these secrets in GitHub (Settings → Secrets and variables → Actions):

- `DIRECTUS_URL`: `https://directus.inquiry.institute`
- `DIRECTUS_TOKEN`: (Directus public read token)
- `SUPABASE_URL`: `https://xougqdomkoisrxdnagcj.supabase.co`

### 4. Trigger Deployment

Push to main or manually trigger:

```bash
gh workflow run deploy-pages.yml
```

## Verify Deployment

1. **Check Actions**: https://github.com/InquiryInstitute/directus/actions
2. **Check Pages**: https://github.com/InquiryInstitute/directus/settings/pages
3. **Visit Site**: After deployment, visit the Pages URL

## Troubleshooting

### Pages Not Deploying

- Check GitHub Actions workflow is running
- Verify `frontend/out/` directory is being created
- Check workflow logs for errors

### Custom Domain Not Working

- Verify DNS has propagated
- Check GitHub Pages custom domain status
- Ensure CNAME record matches GitHub's requirements
