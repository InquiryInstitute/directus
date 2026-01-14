# How to Get Directus Token

## Quick Steps

### 1. Access Directus Admin Panel

**URL**: https://commonplace-directus-652016456291.us-central1.run.app/admin

### 2. Log In or Create Admin Account

**First Time?**
- You'll see a setup screen
- Create your admin account (email + password)
- This is your master admin account

**Already Have Account?**
- Enter your email and password
- Click "Sign In"

### 3. Create Access Token

1. **Go to Settings**
   - Click the gear icon (⚙️) in the top right
   - Or navigate to: Settings → Access Tokens

2. **Create New Token**
   - Click "Create Token" button
   - Fill in:
     - **Name**: `Inquirer Import` (or any descriptive name)
     - **Permissions**: Select the following:
       - `persons` - Read/Write
       - `works` - Read/Write
       - `work_relations` - Read/Write
     - **Expiration**: Leave empty for no expiration, or set a date
   
3. **Save and Copy Token**
   - Click "Save"
   - **IMPORTANT**: Copy the token immediately
   - You'll only see it once! If you lose it, delete and create a new one

### 4. Use the Token

```bash
# Set environment variable
export DIRECTUS_TOKEN='your-token-here'

# Run import script
./scripts/import-inquirer-articles.sh
```

## Token Format

Directus tokens look like:
```
d1r3ctus_abc123xyz789...
```

They start with `d1r3ctus_` followed by a long string of characters.

## Troubleshooting

### "Invalid token" error
- Make sure you copied the entire token (it's long!)
- Check for extra spaces before/after
- Verify the token hasn't expired (if you set expiration)

### "Insufficient permissions" error
- Go back to Settings → Access Tokens
- Edit your token
- Make sure it has Read/Write permissions for:
  - `persons`
  - `works`
  - `work_relations`

### Can't access admin panel
- Make sure you're using the Cloud Run URL:
  - https://commonplace-directus-652016456291.us-central1.run.app/admin
- If SSL error: Try incognito window or wait a few minutes
- Check service is running:
  ```bash
  gcloud run services list --project terpedia
  ```

## Security Notes

- **Never commit tokens to git**
- **Don't share tokens publicly**
- **Use different tokens for different purposes**
- **Rotate tokens periodically**
- **Delete unused tokens**

## Alternative: Use Admin Credentials Directly

If you prefer, you can also use your admin email/password with the Directus SDK, but access tokens are recommended for scripts and automation.
