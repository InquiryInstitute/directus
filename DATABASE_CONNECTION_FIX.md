# Database Connection Fix

Directus is running but can't connect to Supabase. Here's how to fix it:

## Issue

The error shows: `ENETUNREACH` - Directus can't reach the database.

## Solution

### Option 1: Use Connection Pooler (Recommended)

Supabase provides a connection pooler that's more reliable. Update `docker/.env`:

```env
# Use connection pooler instead of direct connection
DB_HOST=db.xougqdomkoisrxdnagcj.supabase.co
DB_PORT=6543
DB_DATABASE=postgres
DB_USER=postgres.xougqdomkoisrxdnagcj
DB_PASSWORD=<your-database-password>
```

**Get connection details from:**
https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/settings/database

Look for:
- **Connection string** (use the pooler port: 6543)
- **Database password** (if you forgot it, you can reset it)

### Option 2: Use Direct Connection

If pooler doesn't work, try direct connection:

```env
DB_HOST=db.xougqdomkoisrxdnagcj.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USER=postgres
DB_PASSWORD=<your-database-password>
```

## Steps to Fix

1. **Get your database password**:
   - Go to: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/settings/database
   - If you forgot it, click "Reset database password"
   - Save the new password securely

2. **Edit `docker/.env`**:
   ```bash
   cd ~/GitHub/directus/docker
   # Open .env in your editor
   # Update DB_PASSWORD with your actual password
   ```

3. **Restart Directus**:
   ```bash
   docker compose restart
   # Or
   docker compose down
   docker compose up -d
   ```

4. **Check logs**:
   ```bash
   docker logs commonplace-directus
   ```

5. **Verify connection**:
   ```bash
   curl http://localhost:8055/server/health
   ```

## Connection String Format

If you want to use the full connection string format:

**Pooler (recommended):**
```
postgresql://postgres.xougqdomkoisrxdnagcj:[PASSWORD]@db.xougqdomkoisrxdnagcj.supabase.co:6543/postgres
```

**Direct:**
```
postgresql://postgres:[PASSWORD]@db.xougqdomkoisrxdnagcj.supabase.co:5432/postgres
```

## Troubleshooting

### Still can't connect?

1. **Check Supabase project status**:
   - Make sure project is not paused
   - Go to: https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj
   - If paused, click "Resume"

2. **Check firewall/network**:
   - Ensure your network allows outbound connections
   - Try from a different network if possible

3. **Verify credentials**:
   - Double-check DB_HOST, DB_USER, DB_PASSWORD
   - Make sure there are no extra spaces or quotes

4. **Try IPv4 only**:
   - Some networks have IPv6 issues
   - Docker might need IPv4 configuration

## After Fixing

Once connected, Directus will:
1. Auto-detect all Commonplace tables
2. Create collections automatically
3. Be ready to use at http://localhost:8055/admin

---

**Quick Test:**
```bash
# Test database connection from your machine
psql "postgresql://postgres:[PASSWORD]@db.xougqdomkoisrxdnagcj.supabase.co:5432/postgres" -c "SELECT 1"
```

If this works, Directus should be able to connect too.
