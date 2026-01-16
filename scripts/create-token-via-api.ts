#!/usr/bin/env tsx
/**
 * Create a Directus static token via API
 * This requires email/password authentication first
 */

import { createDirectus, rest, authentication, staticToken } from '@directus/sdk'

const directusUrl = process.env.DIRECTUS_URL || 'https://commonplace-directus-652016456291.us-central1.run.app'
const email = process.env.DIRECTUS_EMAIL || ''
const password = process.env.DIRECTUS_PASSWORD || ''

if (!email || !password) {
  console.error('❌ DIRECTUS_EMAIL and DIRECTUS_PASSWORD environment variables required')
  console.error('Usage: DIRECTUS_EMAIL=admin@inquiry.institute DIRECTUS_PASSWORD=yourpassword tsx scripts/create-token-via-api.ts')
  process.exit(1)
}

async function createToken() {
  try {
    // Step 1: Authenticate with email/password
    console.log('🔐 Authenticating with Directus...')
    const directus = createDirectus(directusUrl).with(rest()).with(authentication())
    
    await directus.login(email, password)
    console.log('✅ Authenticated successfully')
    
    // Step 2: Create a static token
    console.log('🔑 Creating static token...')
    const response = await fetch(`${directusUrl}/users/me/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await directus.getToken()}`,
      },
      body: JSON.stringify({
        name: 'Script Access Token',
        expires_at: null, // Never expires
      }),
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create token: ${response.status} ${error}`)
    }
    
    const data = await response.json()
    const token = data.data.token
    
    console.log('')
    console.log('✅ Static token created successfully!')
    console.log('')
    console.log('Token:')
    console.log(token)
    console.log('')
    console.log('Save this token and use it in your scripts:')
    console.log(`export DIRECTUS_TOKEN="${token}"`)
    
    return token
  } catch (error: any) {
    console.error('❌ Error creating token:', error.message)
    process.exit(1)
  }
}

createToken()
