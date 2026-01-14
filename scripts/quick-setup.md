# Quick Setup Guide

## Automated Setup (Recommended)

### One-Command Setup

```bash
cd /Users/danielmcshan/GitHub/directus
./scripts/setup-complete.sh
```

This will:
1. Generate a static token in Supabase
2. Import all collections automatically
3. Import all Inquirer articles

### Manual Steps (If Needed)

#### 1. Generate Token in Supabase

Go to: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/sql/new

Run:
```sql
UPDATE directus_users 
SET token = gen_random_uuid()::text || '-' || gen_random_uuid()::text 
WHERE email = 'your-email@example.com';

SELECT token FROM directus_users WHERE email = 'your-email@example.com';
```

Copy the token.

#### 2. Import Collections

```bash
export DIRECTUS_TOKEN='your-token-here'
./scripts/import-collections-api.sh
```

#### 3. Import Articles

```bash
export DIRECTUS_TOKEN='your-token-here'
./scripts/import-inquirer-articles.sh
```

## Troubleshooting

### Token Not Working
- Make sure token was saved in database
- Try refreshing token in Directus UI (User Details → Token → Refresh)
- Verify email matches your Directus admin account

### Collections Not Importing
- Check token has admin permissions
- Verify tables exist in Supabase
- Try manual import in Directus UI as fallback
