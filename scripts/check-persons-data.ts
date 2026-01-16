#!/usr/bin/env tsx
/**
 * Check what persons and works exist in the database
 */

import { createDirectus, rest, authentication, readItems } from '@directus/sdk'

const directusUrl = process.env.DIRECTUS_URL || 'https://commonplace-directus-652016456291.us-central1.run.app'
const directusEmail = process.env.DIRECTUS_EMAIL || 'custodian@inquiry.institute'
const directusPassword = process.env.DIRECTUS_PASSWORD || 'Jp89zfLeRuZFYhy'

async function checkData() {
  try {
    console.log('🔍 Checking database data...\n')
    
    const directus = createDirectus(directusUrl)
      .with(rest())
      .with(authentication())
    
    await directus.login(directusEmail, directusPassword)
    console.log('✅ Authenticated\n')
    
    // Check all persons
    console.log('📋 Checking persons...')
    const allPersons = await directus.request(
      readItems('persons', { limit: 100 })
    )
    console.log(`   Total persons: ${allPersons.length}`)
    
    if (allPersons.length > 0) {
      console.log('\n   Sample persons:')
      allPersons.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name}: kind=${p.kind}, public_domain=${p.public_domain}, slug=${p.slug}`)
      })
      
      // Count by kind
      const byKind = allPersons.reduce((acc, p) => {
        acc[p.kind] = (acc[p.kind] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      console.log('\n   By kind:')
      Object.entries(byKind).forEach(([kind, count]) => {
        console.log(`   - ${kind}: ${count}`)
      })
      
      // Count public_domain
      const publicDomainCount = allPersons.filter(p => p.public_domain === true).length
      console.log(`\n   Public domain: ${publicDomainCount}`)
      
      // Count matching our query criteria
      const matching = allPersons.filter(p => 
        (p.kind === 'faculty' || p.kind === 'external_author') && 
        p.public_domain === true
      )
      console.log(`   Matching query (faculty/external_author + public_domain): ${matching.length}`)
    }
    
    // Check works
    console.log('\n📚 Checking works...')
    const allWorks = await directus.request(
      readItems('works', { limit: 100 })
    )
    console.log(`   Total works: ${allWorks.length}`)
    
    if (allWorks.length > 0) {
      console.log('\n   Sample works:')
      allWorks.slice(0, 10).forEach(w => {
        console.log(`   - ${w.title}: status=${w.status}, visibility=${w.visibility}, author_id=${w.primary_author_id || 'none'}`)
      })
      
      // Count by status
      const byStatus = allWorks.reduce((acc, w) => {
        acc[w.status] = (acc[w.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      console.log('\n   By status:')
      Object.entries(byStatus).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count}`)
      })
      
      // Count published + public
      const publishedPublic = allWorks.filter(w => 
        w.status === 'published' && w.visibility === 'public'
      )
      console.log(`\n   Published + public: ${publishedPublic.length}`)
      
      // Check works with authors
      const withAuthors = allWorks.filter(w => w.primary_author_id)
      console.log(`   With primary_author_id: ${withAuthors.length}`)
    }
    
    console.log('\n✅ Check complete!')
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.response) {
      console.error('   Response:', error.response)
    }
    process.exit(1)
  }
}

checkData()
