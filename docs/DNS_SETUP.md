# DNS Setup for Commonplace

This document describes how to configure DNS for the Commonplace system, replacing WordPress at `commonplace.inquiry.institute`.

## Overview

The Commonplace system will be accessible at:
- **Public Library**: `commonplace.inquiry.institute` (Cloudflare Pages frontend)
- **Directus Admin**: `directus.inquiry.institute` (Directus admin panel)
- **Directus API**: `api.commonplace.inquiry.institute` (Optional: separate API domain)

## DNS Configuration (Route 53)

The domain `inquiry.institute` is already configured in AWS Route 53 (Zone ID: `Z053032935YKZE3M0E0D1`).

### Current Setup

The main domain points to GitHub Pages:
- `inquiry.institute` → GitHub Pages (A records)

### New Records Needed

#### Option 1: Cloudflare Pages (Recommended)

If using Cloudflare Pages for the frontend:

```bash
# CNAME for Commonplace frontend
aws route53 change-resource-record-sets \
  --hosted-zone-id Z053032935YKZE3M0E0D1 \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "commonplace.inquiry.institute",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "your-cloudflare-pages-url.pages.dev"}]
      }
    }]
  }'
```

#### Option 2: GCP Cloud Run / Cloudflare Workers

If using Cloud Run or Workers:

```bash
# A record pointing to Cloud Run static IP
aws route53 change-resource-record-sets \
  --hosted-zone-id Z053032935YKZE3M0E0D1 \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "commonplace.inquiry.institute",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "YOUR_STATIC_IP"}]
      }
    }]
  }'
```

### Directus Admin Panel

For the Directus admin panel:

```bash
# CNAME or A record for Directus
aws route53 change-resource-record-sets \
  --hosted-zone-id Z053032935YKZE3M0E0D1 \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "directus.inquiry.institute",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "your-directus-url"}]
      }
    }]
  }'
```

## Migration from WordPress

### Current WordPress Setup

WordPress is currently configured at `commonplace.inquiry.institute` (possibly via SiteGround or similar).

### Migration Steps

1. **Set up new infrastructure** (Directus + Supabase)
2. **Configure DNS** (update CNAME/A records)
3. **SSL/TLS certificates** (via Cloudflare or Let's Encrypt)
4. **Verify DNS propagation** (24-48 hours typically, but often faster)
5. **Test new system** before deprecating WordPress
6. **Deprecate WordPress** (after migration is complete)

## DNS Propagation

After updating DNS records:

1. **Wait for propagation** (typically 5-60 minutes, can take up to 48 hours)
2. **Check propagation status**:
   - https://www.whatsmydns.net/#CNAME/commonplace.inquiry.institute
   - https://dnschecker.org/#CNAME/commonplace.inquiry.institute
3. **Verify locally**:
   ```bash
   dig commonplace.inquiry.institute
   nslookup commonplace.inquiry.institute
   ```

## SSL/TLS Certificates

### Cloudflare (Recommended)

If using Cloudflare:
- SSL/TLS is automatic (Full or Full Strict mode)
- Certificate is provisioned automatically

### Let's Encrypt

If not using Cloudflare:
- Use certbot or similar for Let's Encrypt certificates
- Auto-renewal via cron job

## Verification

After DNS propagation:

1. **Test frontend**: `https://commonplace.inquiry.institute`
2. **Test Directus API**: `https://directus.inquiry.institute/server/health`
3. **Test Directus Admin**: `https://directus.inquiry.institute/admin`
4. **Check SSL certificate**: Verify green padlock in browser

## Troubleshooting

### DNS Not Resolving

- Wait longer for propagation
- Clear DNS cache: `sudo dscacheutil -flushcache` (macOS)
- Try different DNS servers (8.8.8.8, 1.1.1.1)

### SSL Certificate Issues

- Ensure DNS has fully propagated
- Verify CNAME/A records are correct
- Check certificate provisioning status in Cloudflare/Let's Encrypt

### Mixed Content Warnings

- Ensure all resources use HTTPS
- Update API endpoints to use HTTPS
- Check CORS configuration in Directus

## Next Steps

1. ✅ DNS records configured
2. ⏳ SSL certificates provisioned
3. ⏳ Infrastructure deployed
4. ⏳ Directus configured
5. ⏳ Frontend deployed
6. ⏳ Migration complete
