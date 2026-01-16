#!/usr/bin/env tsx
/**
 * Test Directus permissions endpoint access
 */

import { createDirectus, rest, authentication } from '@directus/sdk'

const directusUrl = process.env.DIRECTUS_URL || 'https://commonplace-directus-652016456291.us-central1.run.app'
const email = process.env.DIRECTUS_EMAIL || ''
const password = process.env.DIRECTUS_PASSWORD || ''

if (!email || !password) {
  console.error('❌ DIRECTUS_EMAIL and DIRECTUS_PASSWORD required')
  process.exit(1)
}

async function testPermissions() {
  try {
    console.log('🔍 Testing Directus Permissions Endpoint')
    console.log('=====================================')
    console.log('')

    // Authenticate
    console.log('🔐 Authenticating...')
    const directus = createDirectus(directusUrl).with(rest()).with(authentication())
    await directus.login(email, password)
    const token = await directus.getToken()
    console.log('✅ Authenticated')
    console.log('')

    // Test various endpoints
    const endpoints = [
      '/permissions',
      '/permissions?limit=1',
      '/roles',
      '/roles?filter[name][_eq]=Administrator',
      '/collections',
      '/collections/persons',
    ]

    for (const endpoint of endpoints) {
      console.log(`📡 Testing: ${endpoint}`)
      try {
        const response = await fetch(`${directusUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        
        console.log(`   Status: ${response.status} ${response.statusText}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log(`   ✅ Success: ${JSON.stringify(data).substring(0, 200)}...`)
        } else {
          const error = await response.text()
          console.log(`   ❌ Error: ${error.substring(0, 200)}`)
        }
      } catch (error: any) {
        console.log(`   ❌ Exception: ${error.message}`)
      }
      console.log('')
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

testPermissions()
