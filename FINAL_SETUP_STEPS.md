# Final Setup Steps for Commonplace

## Current Status

✅ **DNS**: Correctly configured (CNAME → InquiryInstitute.github.io)  
⚠️ **Pages**: Using legacy deployment (needs to switch to GitHub Actions)  
⏳ **Custom Domain**: Needs to be re-added after switching to Actions  
⏳ **HTTPS**: Will be available after domain is configured

## Required Actions

### Step 1: Switch to GitHub Actions (REQUIRED)

1. Go to: https://github.com/InquiryInstitute/directus/settings/pages
2. Under "Source", you'll see it's set to "Deploy from a branch"
3. **Change it to**: "GitHub Actions"
4. Click "Save"

### Step 2: Add Custom Domain

1. Still in Pages settings
2. Under "Custom domain", enter:
   ```
   commonplace.inquiry.institute
   ```
3. Click "Save"

### Step 3: Wait for Certificate (5-60 minutes)

GitHub will automatically:
- Verify the domain
- Issue SSL certificate
- Enable HTTPS enforcement option

### Step 4: Enable HTTPS

1. Go back to: https://github.com/InquiryInstitute/directus/settings/pages
2. Check "Enforce HTTPS" (when it becomes available)
3. Click "Save"

## Verify DNS

```bash
# Should return: inquiryinstitute.github.io.
dig commonplace.inquiry.institute CNAME +short
```

If this is correct, you're all set - just follow the steps above.

## Quick Command Reference

```bash
# Check Pages status
gh api repos/InquiryInstitute/directus/pages | jq '{build_type, cname, https_enforced}'

# Check DNS
dig commonplace.inquiry.institute CNAME +short

# Trigger deployment
gh workflow run deploy-pages.yml --repo InquiryInstitute/directus
```

## Why This is Needed

The Pages API shows `build_type: "legacy"` which means it's using branch-based deployment instead of the GitHub Actions workflow we created. Switching to Actions will:
- Use the proper build process
- Deploy from `frontend/out/` directory
- Enable proper custom domain support
- Allow HTTPS certificate issuance

---

**Action Required**: Switch Pages source to "GitHub Actions" in the web UI (can't be done via API)
