# Enable HTTPS for Commonplace

## Current Situation

✅ **DNS**: Correctly configured (CNAME → InquiryInstitute.github.io)  
✅ **Domain**: Verified by GitHub  
⏳ **Certificate**: Being issued (this is automatic, takes 5-60 minutes)

## The Issue

GitHub Pages shows "Enforce HTTPS — Unavailable" because:
- The SSL certificate hasn't been issued yet
- This is **normal** and **automatic** - GitHub will issue it within 5-60 minutes

## Solution: Wait for Certificate

GitHub automatically:
1. ✅ Verifies DNS (done)
2. ✅ Verifies domain ownership (done)
3. ⏳ Issues SSL certificate (in progress - 5-60 minutes)
4. ⏳ Enables HTTPS enforcement option (after step 3)

## What You Need to Do

### Step 1: Wait (5-60 minutes)

The certificate is being issued automatically. You can check status:

```bash
gh api repos/InquiryInstitute/directus/pages | jq .https_enforced
```

### Step 2: Enable HTTPS (Once Certificate is Ready)

1. Go to: https://github.com/InquiryInstitute/directus/settings/pages
2. Look for "Enforce HTTPS" checkbox
3. When it becomes available (not grayed out), check it
4. Click "Save"

## Verify DNS is Correct

```bash
# Should return: inquiryinstitute.github.io.
dig commonplace.inquiry.institute CNAME +short
```

If this is correct, you just need to wait for GitHub to issue the certificate.

## Alternative: Manual Domain Re-configuration

If certificate doesn't issue after 2 hours, try:

1. Go to: https://github.com/InquiryInstitute/directus/settings/pages
2. Remove custom domain (if present)
3. Wait 2 minutes
4. Re-add: `commonplace.inquiry.institute`
5. Save

This can trigger certificate issuance.

## Monitor Certificate Status

```bash
# Check if HTTPS is available
gh api repos/InquiryInstitute/directus/pages | jq '{cname, https_enforced, protected_domain_state}'

# Test HTTPS directly
curl -I https://commonplace.inquiry.institute
```

Once `https_enforced` can be set to `true`, the certificate is ready!

---

**Bottom Line**: DNS is correct. Just wait 5-60 minutes for GitHub to automatically issue the SSL certificate. Then enable HTTPS enforcement in the Pages settings.
