#!/usr/bin/env tsx
/**
 * Fix Directus field permissions via API - Version 2
 * Sets collection-level permissions to allow all operations
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
    console.log('🔧 Fixing Directus Permissions (v2)')
    console.log('===================================')
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

    // For each collection, ensure full permissions
    for (const collection of COLLECTIONS) {
      console.log(`📦 Fixing permissions for: ${collection}`)

      // Get existing permissions for this collection and role
      const permissionsResponse = await fetch(
        `${directusUrl}/permissions?filter[collection][_eq]=${collection}&filter[role][_eq]=${adminRole.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )
      
      if (!permissionsResponse.ok) {
        console.log(`  ⚠️  Could not fetch permissions for ${collection}`)
        continue
      }

      const permissionsData = await permissionsResponse.json()
      const existingPermissions = permissionsData.data || []

      // Find collection-level permission (no fields specified)
      const collectionPermission = existingPermissions.find((p: any) => !p.fields || p.fields.length === 0)

      if (collectionPermission) {
        // Update existing permission
        const updateResponse = await fetch(`${directusUrl}/permissions/${collectionPermission.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            permissions: {
              read: 'full',
              create: 'full',
              update: 'full',
              delete: 'full',
            },
          }),
        })

        if (updateResponse.ok) {
          console.log(`  ✅ Updated collection-level permission`)
        } else {
          const error = await updateResponse.text()
          console.log(`  ⚠️  Update failed: ${error}`)
        }
      } else {
        // Create new collection-level permission
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
              read: 'full',
              create: 'full',
              update: 'full',
              delete: 'full',
            },
          }),
        })

        if (createResponse.ok) {
          console.log(`  ✅ Created collection-level permission`)
        } else {
          const error = await createResponse.text()
          console.log(`  ⚠️  Create failed: ${error}`)
        }
      }
    }

    console.log('')
    console.log('✅ Permissions fixed!')
    console.log('')
    console.log('You can now re-run the import script to import remaining articles.')
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

fixPermissions()
