#!/usr/bin/env tsx
/**
 * Fix Directus field permissions - Complete version
 * Grants full read/write access to all fields for admin role
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
    console.log('🔧 Fixing Directus Permissions (Complete)')
    console.log('==========================================')
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

    // For each collection, ensure full permissions with all fields
    for (const collection of COLLECTIONS) {
      console.log(`📦 Fixing permissions for: ${collection}`)

      // Get existing permissions
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

      // Delete all existing permissions for this collection/role
      for (const perm of existingPermissions) {
        const deleteResponse = await fetch(`${directusUrl}/permissions/${perm.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        if (deleteResponse.ok) {
          console.log(`  🗑️  Deleted existing permission ${perm.id}`)
        }
      }

      // Create new collection-level permission with full access
      const createResponse = await fetch(`${directusUrl}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection,
          role: adminRole.id,
          action: 'read',
          permissions: {},
          validation: {},
          presets: null,
          fields: ['*'], // All fields
        }),
      })

      if (createResponse.ok) {
        console.log(`  ✅ Created read permission (all fields)`)
      } else {
        const error = await createResponse.text()
        console.log(`  ⚠️  Create read failed: ${error.substring(0, 200)}`)
      }

      // Create create permission
      const createCreateResponse = await fetch(`${directusUrl}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection,
          role: adminRole.id,
          action: 'create',
          permissions: {},
          validation: {},
          presets: null,
          fields: ['*'],
        }),
      })

      if (createCreateResponse.ok) {
        console.log(`  ✅ Created create permission (all fields)`)
      }

      // Create update permission
      const createUpdateResponse = await fetch(`${directusUrl}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection,
          role: adminRole.id,
          action: 'update',
          permissions: {},
          validation: {},
          presets: null,
          fields: ['*'],
        }),
      })

      if (createUpdateResponse.ok) {
        console.log(`  ✅ Created update permission (all fields)`)
      }

      // Create delete permission
      const createDeleteResponse = await fetch(`${directusUrl}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection,
          role: adminRole.id,
          action: 'delete',
          permissions: {},
          validation: {},
          presets: null,
          fields: ['*'],
        }),
      })

      if (createDeleteResponse.ok) {
        console.log(`  ✅ Created delete permission (all fields)`)
      }
    }

    console.log('')
    console.log('✅ Permissions fixed!')
    console.log('')
    console.log('You can now:')
    console.log('  1. Re-run the import script to import remaining articles')
    console.log('  2. Check the library page - it should now show works')
    console.log('  3. View and edit works in Directus admin panel')
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

fixPermissions()
