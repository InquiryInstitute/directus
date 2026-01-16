-- Check and create Directus static token properly
-- Run this in Supabase SQL Editor

-- Step 1: Check if directus_access_tokens table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'directus_access_tokens'
) AS tokens_table_exists;

-- Step 2: Check current user and their token
SELECT 
  id,
  email,
  role,
  token AS user_token,
  (SELECT COUNT(*) FROM directus_access_tokens WHERE user = directus_users.id) AS access_token_count
FROM directus_users 
WHERE email = 'admin@inquiry.institute';

-- Step 3: Check existing access tokens for this user
SELECT 
  id,
  name,
  token,
  expires_at,
  date_created
FROM directus_access_tokens 
WHERE user = (SELECT id FROM directus_users WHERE email = 'admin@inquiry.institute')
ORDER BY date_created DESC
LIMIT 5;

-- Step 4: Create a new static token (if directus_access_tokens table exists)
-- Uncomment and run this if the table exists:
/*
INSERT INTO directus_access_tokens (
  user,
  name,
  token,
  expires_at,
  date_created
) VALUES (
  (SELECT id FROM directus_users WHERE email = 'admin@inquiry.institute'),
  'Script Access Token',
  gen_random_uuid()::text || '-' || gen_random_uuid()::text,
  NULL, -- Never expires
  NOW()
)
RETURNING token;
*/

-- Step 5: Alternative - Update user token directly (if Directus uses this)
-- Uncomment if needed:
/*
UPDATE directus_users
SET token = gen_random_uuid()::text || '-' || gen_random_uuid()::text
WHERE email = 'admin@inquiry.institute'
RETURNING token;
*/
