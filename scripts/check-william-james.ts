#!/usr/bin/env tsx
/**
 * Check for William James author and works
 */

import { createDirectus, rest, authentication, readItems } from '@directus/sdk'

const directusUrl = process.env.DIRECTUS_URL || 'https://commonplace-directus-652016456291.us-central1.run.app'
const directusEmail = process.env.DIRECTUS_EMAIL || 'custodian@inquiry.institute'
const directusPassword = process.env.DIRECTUS_PASSWORD || 'Jp89zfLeRuZFYhy'

async function check() {
  try {
    const directus = createDirectus(directusUrl).with(rest()).with(authentication())
    await directus.login(directusEmail, directusPassword)
    console.log('✅ Authenticated\n')
    
    // Check for William James
    console.log('🔍 Searching for William James...')
    const persons = await directus.request(readItems('persons', { 
      filter: { name: { _icontains: 'William James' } },
      limit: 10 
    }))
    console.log(`Found ${persons.length} persons:`)
    persons.forEach(p => {
      console.log(`  - ${p.name}: slug=${p.slug}, kind=${p.kind}, public_domain=${p.public_domain}`)
    })
    
    // Check works with william in slug
    console.log('\n🔍 Searching for works with "william" in slug...')
    const works = await directus.request(readItems('works', { 
      filter: { slug: { _icontains: 'william' } },
      limit: 10 
    }))
    console.log(`Found ${works.length} works:`)
    works.forEach(w => {
      console.log(`  - ${w.title}: slug=${w.slug}, status=${w.status}, visibility=${w.visibility}, author_id=${w.primary_author_id}`)
    })
    
    // Check all persons with kind faculty or external_author
    console.log('\n🔍 Checking all faculty/external_author persons...')
    const allAuthors = await directus.request(readItems('persons', {
      filter: {
        _or: [
          { kind: { _eq: 'faculty' } },
          { kind: { _eq: 'external_author' } }
        ]
      },
      limit: 20
    }))
    console.log(`Found ${allAuthors.length} authors:`)
    allAuthors.forEach(a => {
      console.log(`  - ${a.name}: slug=${a.slug}, kind=${a.kind}, public_domain=${a.public_domain}`)
    })
    
    // Check published works
    console.log('\n🔍 Checking published public works...')
    const publishedWorks = await directus.request(readItems('works', {
      filter: {
        status: { _eq: 'published' },
        visibility: { _eq: 'public' }
      },
      limit: 10
    }))
    console.log(`Found ${publishedWorks.length} published public works:`)
    publishedWorks.forEach(w => {
      console.log(`  - ${w.title}: slug=${w.slug}, author_id=${w.primary_author_id}`)
    })
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
    process.exit(1)
  }
}

check()
