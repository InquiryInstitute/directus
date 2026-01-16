#!/usr/bin/env tsx
/**
 * Import collections using Directus API with email/password authentication
 */

import { createDirectus, rest, authentication } from '@directus/sdk'

const directusUrl = process.env.DIRECTUS_URL || 'https://commonplace-directus-652016456291.us-central1.run.app'
const email = process.env.DIRECTUS_EMAIL || ''
const password = process.env.DIRECTUS_PASSWORD || ''

if (!email || !password) {
  console.error('❌ DIRECTUS_EMAIL and DIRECTUS_PASSWORD required')
  process.exit(1)
}

const TABLES = [
  'persons',
  'works',
  'work_relations',
  'sources',
  'fragments',
  'themes',
  'citations',
  'work_fragments',
  'work_themes',
  'review_rounds',
  'review_assignments',
  'reviews',
  'editor_decisions',
  'change_requests',
]

async function importCollections() {
  try {
    console.log('📚 Importing Collections via Directus API')
    console.log('==========================================')
    console.log('')

    // Authenticate
    console.log('🔐 Authenticating...')
    const directus = createDirectus(directusUrl).with(rest()).with(authentication())
    await directus.login(email, password)
    console.log('✅ Authenticated successfully')
    console.log('')

    // Get existing collections
    console.log('Fetching existing collections...')
    const existingResponse = await fetch(`${directusUrl}/collections`, {
      headers: {
        'Authorization': `Bearer ${await directus.getToken()}`,
      },
    })
    const existingData = await existingResponse.json()
    const existing = existingData.data?.map((c: any) => c.collection) || []

    // Import each table
    for (const table of TABLES) {
      if (existing.includes(table)) {
        console.log(`⏭️  Skipping ${table} (already exists)`)
        continue
      }

      console.log(`📦 Importing ${table}...`)

      try {
        const response = await fetch(`${directusUrl}/collections`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${await directus.getToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collection: table,
            meta: {
              collection: table,
              icon: 'table',
              note: 'Auto-imported from database table',
            },
            schema: {
              name: table,
            },
          }),
        })

        if (response.ok) {
          console.log(`✅ Imported ${table}`)
        } else {
          const error = await response.text()
          if (error.includes('already exists') || error.includes('RECORD_NOT_UNIQUE')) {
            console.log(`⚠️  ${table} already exists`)
          } else {
            console.error(`❌ Error importing ${table}: ${response.status} ${error}`)
          }
        }
      } catch (error: any) {
        console.error(`❌ Error importing ${table}:`, error.message)
      }
    }

    console.log('')
    console.log('✅ Import complete!')
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

importCollections()
