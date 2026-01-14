# AWS Route 53 DNS Setup for Commonplace

DNS configuration for mapping domains to Commonplace services.

## Current Setup

- **Hosted Zone ID**: `Z053032935YKZE3M0E0D1`
- **Domain**: `inquiry.institute`
- **Directus**: `directus.inquiry.institute` → Cloud Run
- **Commonplace**: `commonplace.inquiry.institute` → (Frontend - TBD)

## Quick Setup

### 1. Setup Directus DNS

```bash
cd aws
chmod +x route53-setup.sh
./route53-setup.sh
```

This creates:
- `directus.inquiry.institute` → Cloud Run service

### 2. Setup Commonplace Frontend DNS

```bash
chmod +x route53-commonplace.sh
./route53-commonplace.sh
```

This creates:
- `commonplace.inquiry.institute` → Frontend (update URL when deployed)

## Manual Setup

### Directus DNS Record

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z053032935YKZE3M0E0D1 \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "directus.inquiry.institute",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "commonplace-directus-652016456291.us-central1.run.app"}]
      }
    }]
  }'
```

### Commonplace Frontend DNS Record

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
        "ResourceRecords": [{"Value": "your-cloudflare-pages-url.pages.dev"}]
      }
    }]
  }'
```

## Verify DNS

```bash
# Check DNS resolution
dig directus.inquiry.institute
dig commonplace.inquiry.institute

# Check from specific DNS server
dig @8.8.8.8 directus.inquiry.institute
```

## DNS Propagation

- Usually takes 5-60 minutes
- Can take up to 48 hours in rare cases
- Check propagation: https://dnschecker.org/#CNAME/directus.inquiry.institute

## SSL/TLS Certificates

Cloud Run automatically provisions SSL certificates for custom domains.

To map a custom domain:

```bash
# Map directus.inquiry.institute to Cloud Run
gcloud run domain-mappings create \
  --service commonplace-directus \
  --domain directus.inquiry.institute \
  --region us-central1 \
  --project terpedia
```

Then update DNS with the CNAME record provided by Cloud Run.

## Troubleshooting

### DNS not resolving

1. Wait for propagation (5-60 minutes)
2. Clear DNS cache: `sudo dscacheutil -flushcache` (macOS)
3. Check Route 53 console for record status

### SSL certificate issues

1. Ensure DNS has fully propagated
2. Verify CNAME record is correct
3. Check Cloud Run domain mapping status

## Current DNS Records

- `inquiry.institute` → GitHub Pages (A records)
- `directus.inquiry.institute` → Cloud Run (CNAME) - **To be created**
- `commonplace.inquiry.institute` → Frontend (CNAME) - **To be created**
