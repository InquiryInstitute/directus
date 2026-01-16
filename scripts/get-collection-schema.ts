#!/usr/bin/env tsx
/**
 * Get the schema for persons and works collections from Directus
 */

import { createDirectus, rest, authentication } from '@directus/sdk'

const directusUrl = process.env.DIRECTUS_URL || 'https://commonplace-directus-652016456291.us-central1.run.app'
const email = process.env.DIRECTUS_EMAIL || ''
const password = process.env.DIRECTUS_PASSWORD || ''

if (!email || !password) {
  console.error('❌ DIRECTUS_EMAIL and DIRECTUS_PASSWORD required')
  process.exit(1)
}

async function getSchema() {
  try {
    console.log('🔍 Getting Collection Schemas from Directus')
    console.log('==========================================')
    console.log('')

    // Authenticate
    const directus = createDirectus(directusUrl).with(rest()).with(authentication())
    await directus.login(email, password)
    const token = await directus.getToken()
    console.log('✅ Authenticated')
    console.log('')

    const collections = ['persons', 'works']
    
    for (const collection of collections) {
      console.log(`📋 Schema for: ${collection}`)
      console.log('─'.repeat(50))
      
      // Get collection info
      const collectionResponse = await fetch(`${directusUrl}/collections/${collection}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const collectionData = await collectionResponse.json()
      console.log('Collection:', JSON.stringify(collectionData.data, null, 2))
      console.log('')
      
      // Get fields
      const fieldsResponse = await fetch(`${directusUrl}/fields/${collection}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const fieldsData = await fieldsResponse.json()
      console.log('Fields:')
      if (fieldsData.data) {
        fieldsData.data.forEach((field: any) => {
          console.log(`  - ${field.field}: ${field.type}${field.schema?.is_nullable ? ' (nullable)' : ''}${field.schema?.default_value ? ` default: ${field.schema.default_value}` : ''}`)
        })
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

getSchema()
