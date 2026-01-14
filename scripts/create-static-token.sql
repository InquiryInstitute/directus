-- Create or update a static token for a Directus user
-- Run this in Supabase SQL Editor

-- Option 1: Update token for user by email
UPDATE directus_users
SET token = gen_random_uuid()::text || '-' || gen_random_uuid()::text
WHERE email = 'your-email@example.com';

-- Option 2: Update token for user by ID (if you know the user ID)
-- UPDATE directus_users
-- SET token = gen_random_uuid()::text || '-' || gen_random_uuid()::text
-- WHERE id = '3c86d17a-a998-45dd-be0c-e0287c658f09';

-- Option 3: View current token (for verification)
-- SELECT id, email, token FROM directus_users WHERE email = 'your-email@example.com';

-- After running, copy the token from the query result or refresh the user page in Directus
