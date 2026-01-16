#!/usr/bin/env tsx
/**
 * Create a demo work in Commonplace to demonstrate faculty posting
 * This creates a test work that should appear on the frontend
 */

import { createDirectus, rest, authentication, createItem, readItems } from '@directus/sdk'

const directusUrl = process.env.DIRECTUS_URL || 'https://commonplace-directus-652016456291.us-central1.run.app'
const email = process.env.DIRECTUS_EMAIL || ''
const password = process.env.DIRECTUS_PASSWORD || ''

if (!email || !password) {
  console.error('❌ DIRECTUS_EMAIL and DIRECTUS_PASSWORD required')
  process.exit(1)
}

async function createDemoWork() {
  try {
    console.log('📚 Creating Demo Work for Commonplace')
    console.log('=====================================')
    console.log('')

    // Authenticate
    console.log('🔐 Authenticating...')
    const directus = createDirectus(directusUrl).with(rest()).with(authentication())
    await directus.login(email, password)
    console.log('✅ Authenticated')
    console.log('')

    // First, check if we have a faculty person, or create one
    console.log('👤 Checking for faculty person...')
    let facultyPersonId: string
    
    try {
      const persons = await directus.request(
        readItems('persons', {
          filter: { kind: { _eq: 'faculty' } },
          limit: 1,
        })
      )
      
      if (persons && persons.length > 0) {
        facultyPersonId = persons[0].id
        console.log(`✅ Found faculty person: ${persons[0].name || persons[0].id}`)
      } else {
        // Create a test faculty person
        console.log('   No faculty person found, creating one...')
        const newPerson = await directus.request(
          createItem('persons', {
            name: 'Test Faculty Member',
            slug: 'test-faculty-member',
            kind: 'faculty',
            public_domain: true,
            bio: 'A test faculty member for demonstration purposes',
          })
        )
        facultyPersonId = newPerson.id
        console.log(`✅ Created faculty person: ${newPerson.id}`)
      }
    } catch (error: any) {
      console.error('❌ Error with persons:', error.message)
      // Try to create anyway with a dummy ID
      const newPerson = await directus.request(
        createItem('persons', {
          name: 'Test Faculty Member',
          slug: 'test-faculty-member',
          kind: 'faculty',
          public_domain: true,
        })
      )
      facultyPersonId = newPerson.id
      console.log(`✅ Created faculty person: ${newPerson.id}`)
    }
    console.log('')

    // Create a demo work
    console.log('📖 Creating demo work...')
    const workData = {
      title: 'A Demonstration of Faculty Publishing',
      slug: 'demo-faculty-publishing',
      primary_author_id: facultyPersonId,
      status: 'published',
      visibility: 'public',
      abstract: 'This is a demonstration work created to show that faculty can publish to Commonplace. This work was created programmatically via the Directus API.',
      content_md: `# A Demonstration of Faculty Publishing

This is a demonstration work created to show that faculty can publish to Commonplace.

## Purpose

This work demonstrates:
- Faculty can create works in Commonplace
- Works can be published and made public
- Works appear on the Commonplace frontend

## Content

This is sample content that would typically be written by faculty members. In a real scenario, this would contain scholarly work, research findings, or other academic content.

## Conclusion

Faculty publishing to Commonplace is working! 🎉`,
    }

    try {
      const work = await directus.request(
        createItem('works', workData)
      )
      console.log('✅ Created work successfully!')
      console.log('')
      console.log('Work Details:')
      console.log(`  ID: ${work.id}`)
      console.log(`  Title: ${work.title || 'N/A'}`)
      console.log(`  Slug: ${work.slug || 'N/A'}`)
      console.log(`  Status: ${work.status || 'N/A'}`)
      console.log(`  Visibility: ${work.visibility || 'N/A'}`)
      console.log('')
      console.log('🌐 View on frontend:')
      console.log(`   https://commonplace.inquiry.institute/authors/test-faculty-member/demo-faculty-publishing`)
      console.log('')
      console.log('📝 Next steps:')
      console.log('   1. Check if work appears in Supabase')
      console.log('   2. Verify it shows on the frontend')
      console.log('   3. If not, check Directus-Supabase connection')
    } catch (error: any) {
      console.error('❌ Error creating work:', error.message)
      if (error.extensions) {
        console.error('   Extensions:', JSON.stringify(error.extensions, null, 2))
      }
      throw error
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

createDemoWork()
