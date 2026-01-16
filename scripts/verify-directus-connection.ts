#!/usr/bin/env tsx
/**
 * Verify Directus database connection by checking what it can access
 */

import { createDirectus, rest, authentication, readItems } from '@directus/sdk'

const directusUrl = process.env.DIRECTUS_URL || 'https://commonplace-directus-652016456291.us-central1.run.app'
const directusEmail = process.env.DIRECTUS_EMAIL || 'custodian@inquiry.institute'
const directusPassword = process.env.DIRECTUS_PASSWORD || 'Jp89zfLeRuZFYhy'

async function verify() {
  try {
    console.log('🔍 Verifying Directus Connection')
    console.log('================================\n')
    console.log(`Directus URL: ${directusUrl}\n`)
    
    // Authenticate
    console.log('🔐 Authenticating...')
    const directus = createDirectus(directusUrl).with(rest()).with(authentication())
    await directus.login(directusEmail, directusPassword)
    console.log('✅ Authenticated successfully\n')
    
    // Check server health
    console.log('🏥 Checking server health...')
    const healthResponse = await fetch(`${directusUrl}/server/health`)
    const health = await healthResponse.json()
    console.log(`   Status: ${health.status || 'unknown'}\n`)
    
    // List all collections
    console.log('📦 Checking collections...')
    try {
      const collections = await directus.request(
        readItems('directus_collections', { limit: 100 })
      )
      console.log(`   Found ${collections.length} collections:`)
      collections.slice(0, 20).forEach((c: any) => {
        console.log(`   - ${c.collection}`)
      })
      if (collections.length > 20) {
        console.log(`   ... and ${collections.length - 20} more`)
      }
    } catch (error: any) {
      console.log(`   ⚠️  Could not list collections: ${error.message}`)
    }
    console.log('')
    
    // Check if persons collection exists and is accessible
    console.log('👤 Checking persons collection...')
    try {
      const persons = await directus.request(
        readItems('persons', { limit: 5 })
      )
      console.log(`   ✅ persons collection accessible`)
      console.log(`   Found ${persons.length} persons (showing first 5)`)
      persons.forEach((p: any) => {
        console.log(`   - ID: ${p.id}, Name: ${p.name || '(no name)'}, Slug: ${p.slug || '(no slug)'}`)
      })
    } catch (error: any) {
      console.log(`   ❌ Error accessing persons: ${error.message}`)
      if (error.response) {
        const errorText = await error.response.text().catch(() => 'Could not read error')
        console.log(`   Response: ${errorText.substring(0, 200)}`)
      }
    }
    console.log('')
    
    // Check if works collection exists and is accessible
    console.log('📚 Checking works collection...')
    try {
      const works = await directus.request(
        readItems('works', { limit: 5 })
      )
      console.log(`   ✅ works collection accessible`)
      console.log(`   Found ${works.length} works (showing first 5)`)
      works.forEach((w: any) => {
        console.log(`   - ID: ${w.id}, Title: ${w.title || '(no title)'}, Slug: ${w.slug || '(no slug)'}, Status: ${w.status || 'unknown'}`)
      })
    } catch (error: any) {
      console.log(`   ❌ Error accessing works: ${error.message}`)
      if (error.response) {
        const errorText = await error.response.text().catch(() => 'Could not read error')
        console.log(`   Response: ${errorText.substring(0, 200)}`)
      }
    }
    console.log('')
    
    // Try to query database directly via Directus server info
    console.log('🗄️  Checking database connection...')
    try {
      const serverInfo = await fetch(`${directusUrl}/server/info`, {
        headers: {
          'Authorization': `Bearer ${await directus.getToken()}`,
        },
      })
      if (serverInfo.ok) {
        const info = await serverInfo.json()
        console.log(`   ✅ Server info accessible`)
        if (info.data?.database) {
          console.log(`   Database: ${info.data.database}`)
        }
      }
    } catch (error: any) {
      console.log(`   ⚠️  Could not get server info: ${error.message}`)
    }
    console.log('')
    
    console.log('✅ Verification complete!')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
    process.exit(1)
  }
}

verify()
