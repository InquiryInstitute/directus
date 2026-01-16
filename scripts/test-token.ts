#!/usr/bin/env tsx
/**
 * Test Directus token authentication
 */

const directusUrl = process.env.DIRECTUS_URL || 'https://commonplace-directus-652016456291.us-central1.run.app'
const token = process.env.DIRECTUS_TOKEN || 'kir7NvZd3DxSS3ezId8nN7dTS9k3hNeq'

async function testToken() {
  console.log('Testing token:', token.substring(0, 10) + '...')
  console.log('URL:', directusUrl)
  console.log('')

  // Test 1: Server health (public)
  console.log('1. Testing /server/health (public endpoint)...')
  const health = await fetch(`${directusUrl}/server/health`)
  console.log('   Status:', health.status, health.ok ? '✅' : '❌')
  console.log('')

  // Test 2: Users/me (requires auth)
  console.log('2. Testing /users/me (requires auth)...')
  const me = await fetch(`${directusUrl}/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  const meData = await me.json()
  console.log('   Status:', me.status)
  console.log('   Response:', JSON.stringify(meData, null, 2))
  console.log('')

  // Test 3: Collections (requires auth)
  console.log('3. Testing /collections (requires auth)...')
  const collections = await fetch(`${directusUrl}/collections`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  const collectionsData = await collections.json()
  console.log('   Status:', collections.status)
  console.log('   Response:', JSON.stringify(collectionsData, null, 2).substring(0, 500))
  console.log('')

  // Test 4: Try with different auth header format
  console.log('4. Testing with "Token" header instead of "Bearer"...')
  const tokenAuth = await fetch(`${directusUrl}/users/me`, {
    headers: {
      'Authorization': `Token ${token}`,
    },
  })
  const tokenData = await tokenAuth.json()
  console.log('   Status:', tokenAuth.status)
  console.log('   Response:', JSON.stringify(tokenData, null, 2))
  console.log('')

  // Test 5: Check if token is in directus_users table
  console.log('5. SQL to check token in database:')
  console.log('   Run this in Supabase SQL Editor:')
  console.log(`   SELECT id, email, token, role FROM directus_users WHERE token = '${token}';`)
  console.log('')
}

testToken().catch(console.error)
