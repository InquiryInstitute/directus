#!/usr/bin/env tsx
/**
 * Fix Directus field permissions via API
 * Grants read access to all fields in collections
 */

import { createDirectus, rest, authentication } from '@directus/sdk'

const directusUrl = process.env.DIRECTUS_URL || 'https://commonplace-directus-652016456291.us-central1.run.app'
const email = process.env.DIRECTUS_EMAIL || ''
const password = process.env.DIRECTUS_PASSWORD || ''

if (!email || !password) {
  console.error('❌ DIRECTUS_EMAIL and DIRECTUS_PASSWORD required')
  process.exit(1)
}

const COLLECTIONS = [
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

async function fixPermissions() {
  try {
    console.log('🔧 Fixing Directus Permissions')
    console.log('==============================')
    console.log('')

    // Authenticate
    console.log('🔐 Authenticating...')
    const directus = createDirectus(directusUrl).with(rest()).with(authentication())
    await directus.login(email, password)
    const token = await directus.getToken()
    console.log('✅ Authenticated successfully')
    console.log('')

    // Get administrator role ID
    console.log('📋 Getting administrator role...')
    const rolesResponse = await fetch(`${directusUrl}/roles?filter[name][_eq]=Administrator`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    const rolesData = await rolesResponse.json()
    const adminRole = rolesData.data?.[0]
    
    if (!adminRole) {
      throw new Error('Administrator role not found')
    }
    console.log(`✅ Found role: ${adminRole.name} (ID: ${adminRole.id})`)
    console.log('')

    // For each collection, get fields and set permissions
    for (const collection of COLLECTIONS) {
      console.log(`📦 Fixing permissions for: ${collection}`)

      // Get all fields for this collection
      const fieldsResponse = await fetch(`${directusUrl}/fields/${collection}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!fieldsResponse.ok) {
        console.log(`  ⚠️  Could not fetch fields for ${collection} (might not exist yet)`)
        continue
      }

      const fieldsData = await fieldsResponse.json()
      const fields = fieldsData.data || []

      // Get existing permissions for this collection
      const permissionsResponse = await fetch(
        `${directusUrl}/permissions?filter[collection][_eq]=${collection}&filter[role][_eq]=${adminRole.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )
      const permissionsData = await permissionsResponse.json()
      const existingPermissions = permissionsData.data || []

      // Create/update permissions for each field
      let updated = 0
      let created = 0

      for (const field of fields) {
        // Skip system fields
        if (field.field.startsWith('_') || field.field === 'id') {
          continue
        }

        // Check if permission already exists
        const existing = existingPermissions.find(
          (p: any) => p.collection === collection && p.fields?.includes(field.field)
        )

        if (existing) {
          // Update existing permission to ensure read access
          const updateResponse = await fetch(`${directusUrl}/permissions/${existing.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              permissions: {
                read: 'full', // Full read access
              },
              fields: [field.field],
            }),
          })

          if (updateResponse.ok) {
            updated++
          }
        } else {
          // Create new permission
          const createResponse = await fetch(`${directusUrl}/permissions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              collection,
              role: adminRole.id,
              permissions: {
                read: 'full', // Full read access
              },
              fields: [field.field],
            }),
          })

          if (createResponse.ok) {
            created++
          }
        }
      }

      // Also ensure collection-level permission exists
      const collectionPermission = existingPermissions.find(
        (p: any) => p.collection === collection && !p.fields
      )

      if (!collectionPermission) {
        await fetch(`${directusUrl}/permissions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collection,
            role: adminRole.id,
            permissions: {
              read: 'full',
              create: 'full',
              update: 'full',
              delete: 'full',
            },
          }),
        })
      }

      console.log(`  ✅ ${collection}: ${created} created, ${updated} updated`)
    }

    console.log('')
    console.log('✅ Permissions fixed!')
    console.log('')
    console.log('You can now re-run the import script to import remaining articles.')
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.response) {
      const errorData = await error.response.json()
      console.error('Details:', JSON.stringify(errorData, null, 2))
    }
    process.exit(1)
  }
}

fixPermissions()
