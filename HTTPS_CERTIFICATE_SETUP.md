# HTTPS Certificate Setup for GitHub Pages

## Current Status

✅ **DNS Configured**: `commonplace.inquiry.institute` → `InquiryInstitute.github.io` (CNAME)  
✅ **Domain Verified**: GitHub has verified the domain  
⏳ **Certificate Pending**: GitHub is issuing the SSL certificate (can take 5-60 minutes)

## Why HTTPS is Unavailable

GitHub Pages automatically issues SSL certificates via Let's Encrypt, but this process takes time:

1. **DNS Propagation** (✅ Complete)
2. **Domain Verification** (✅ Complete - shows as "verified")
3. **Certificate Issuance** (⏳ In Progress - can take 5-60 minutes)
4. **Certificate Deployment** (⏳ Waiting for step 3)

## What to Do

### Option 1: Wait (Recommended)

GitHub will automatically:
1. Issue the certificate (usually within 5-60 minutes)
2. Enable HTTPS enforcement option
3. You can then check "Enforce HTTPS" in settings

**Check status**: https://github.com/InquiryInstitute/directus/settings/pages

### Option 2: Trigger Certificate Issuance

Sometimes removing and re-adding the custom domain can trigger certificate issuance:

```bash
# Remove custom domain
gh api repos/InquiryInstitute/directus/pages -X DELETE

# Wait 30 seconds
sleep 30

# Re-add custom domain
gh api repos/InquiryInstitute/directus/pages -X PUT -f cname=commonplace.inquiry.institute
```

### Option 3: Manual Verification

1. Go to: https://github.com/InquiryInstitute/directus/settings/pages
2. Remove the custom domain (if present)
3. Wait 1-2 minutes
4. Re-add: `commonplace.inquiry.institute`
5. Save

This can trigger GitHub to re-verify and issue the certificate.

## Verify DNS

```bash
# Check CNAME record
dig commonplace.inquiry.institute CNAME +short
# Should return: inquiryinstitute.github.io.

# Check from different DNS servers
nslookup commonplace.inquiry.institute 8.8.8.8
nslookup commonplace.inquiry.institute 1.1.1.1
```

## Expected Timeline

- **DNS Propagation**: 5-60 minutes (✅ Already done)
- **Domain Verification**: Usually instant (✅ Already done)
- **Certificate Issuance**: 5-60 minutes (⏳ In progress)
- **Total**: Usually 10-120 minutes from DNS setup

## Once Certificate is Ready

1. Go to: https://github.com/InquiryInstitute/directus/settings/pages
2. You'll see "Enforce HTTPS" checkbox is now available
3. Check the box
4. Click "Save"
5. Your site will now redirect HTTP → HTTPS automatically

## Troubleshooting

### Certificate Still Not Issued After 2 Hours

1. Verify DNS is correct:
   ```bash
   dig commonplace.inquiry.institute CNAME
   # Should show: inquiryinstitute.github.io.
   ```

2. Check for conflicting records:
   ```bash
   aws route53 list-resource-record-sets \
     --hosted-zone-id Z053032935YKZE3M0E0D1 \
     --query "ResourceRecordSets[?Name=='commonplace.inquiry.institute.']"
   ```
   Should only have ONE CNAME record, no A records.

3. Try removing and re-adding the domain in GitHub Pages settings

### Still Having Issues?

- Check GitHub Pages status: https://www.githubstatus.com/
- Verify domain in GitHub: https://github.com/InquiryInstitute/directus/settings/pages
- Contact GitHub Support if certificate doesn't issue after 24 hours

---

**Current Status**: Waiting for GitHub to issue SSL certificate (normal, can take up to 60 minutes)
