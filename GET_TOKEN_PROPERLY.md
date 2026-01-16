# How to Get a Valid Directus Static Token

The token you generated from SQL (`b68151ac-6a4a-4cf4-9cef-9a284fd72c51-564eb8d4-f6e1-44e6-b516-3c7f6c2a94b4`) is **not a valid Directus static token**. Directus requires tokens to be created through its API or admin interface.

## Option 1: Create Token via Directus Admin UI (Recommended)

1. **Log into Directus Admin:**
   - Go to: https://commonplace-directus-652016456291.us-central1.run.app/admin
   - Log in with your admin credentials

2. **Create Static Token:**
   - Click on your profile (top right)
   - Go to **Settings** → **Access Tokens**
   - Click **Create Token**
   - Name it: "Script Access Token"
   - Leave expiration blank (never expires)
   - Click **Save**
   - **Copy the token immediately** (you won't see it again!)

3. **Use the Token:**
   ```bash
   export DIRECTUS_TOKEN="d1r3ctus_your_token_here"
   ```

## Option 2: Create Token via API Script

If you have your email/password:

```bash
cd /Users/danielmcshan/GitHub/directus
DIRECTUS_EMAIL=admin@inquiry.institute \
DIRECTUS_PASSWORD=yourpassword \
DIRECTUS_URL=https://commonplace-directus-652016456291.us-central1.run.app \
npx tsx scripts/create-token-via-api.ts
```

This will:
1. Authenticate with email/password
2. Create a static token via API
3. Display the token for you to copy

## Option 3: Use Directus SDK to Create Token

If you're already authenticated in the browser, you can use the browser console:

1. Open Directus admin in browser
2. Open browser console (F12)
3. Run:
   ```javascript
   fetch('/users/me/tokens', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       name: 'Script Token',
       expires_at: null
     })
   })
   .then(r => r.json())
   .then(d => console.log('Token:', d.data.token))
   ```

## Why Your Current Token Doesn't Work

The token format `b68151ac-6a4a-4cf4-9cef-9a284fd72c51-564eb8d4-f6e1-44e6-b516-3c7f6c2a94b4` is just two UUIDs joined together. Directus static tokens have a specific format (usually starting with `d1r3ctus_` or similar) and are created through Directus's token generation system, which includes proper encryption and validation.

## After Getting a Valid Token

Once you have a valid token, run the setup script again:

```bash
export DIRECTUS_TOKEN="d1r3ctus_your_valid_token_here"
./scripts/setup-complete.sh
```

The token test will pass AND the API calls will work!
