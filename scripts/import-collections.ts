#!/usr/bin/env tsx
/**
 * Automatically import existing database tables as Directus collections
 * 
 * This script uses the Directus API to create collections from existing tables
 */

import { createDirectus, rest, staticToken, readCollections } from '@directus/sdk'

const directusUrl = process.env.DIRECTUS_URL || 'https://commonplace-directus-652016456291.us-central1.run.app'
const directusToken = process.env.DIRECTUS_TOKEN || ''

if (!directusToken) {
  console.error('❌ DIRECTUS_TOKEN environment variable is required')
  process.exit(1)
}

const directus = createDirectus(directusUrl)
  .with(rest())
  .with(staticToken(directusToken))

// All tables that should be imported
const tablesToImport = [
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
  console.log('📚 Importing Collections into Directus\n')

  try {
    // Get existing collections
    const existingCollections = await directus.request(readCollections())
    const existingNames = new Set(
      existingCollections.map((c: any) => c.collection)
    )

    console.log(`Found ${existingCollections.length} existing collections\n`)

    let imported = 0
    let skipped = 0

    for (const tableName of tablesToImport) {
      if (existingNames.has(tableName)) {
        console.log(`⏭️  Skipping ${tableName} (already exists)`)
        skipped++
        continue
      }

      try {
        console.log(`📦 Importing ${tableName}...`)
        
        // Create collection from existing table
        await directus.request(
          createCollection({
            collection: tableName,
            meta: {
              collection: tableName,
              icon: 'table',
              note: `Auto-imported from database table: ${tableName}`,
            },
            schema: {
              name: tableName,
            },
          })
        )

        console.log(`✅ Imported ${tableName}`)
        imported++
      } catch (error: any) {
        if (error?.extensions?.code === 'RECORD_NOT_UNIQUE') {
          console.log(`⚠️  ${tableName} already exists`)
          skipped++
        } else {
          console.error(`❌ Error importing ${tableName}:`, error.message)
        }
      }
    }

    console.log(`\n✅ Done! Imported: ${imported}, Skipped: ${skipped}`)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.response) {
      console.error('Response:', await error.response.text())
    }
    process.exit(1)
  }
}

importCollections()
