#!/usr/bin/env tsx
/**
 * Check what persons and works exist in Supabase directly
 * This bypasses Directus to see the actual database state
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xougqdomkoisrxdnagcj.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  try {
    console.log('🔍 Checking Supabase database directly...\n')
    
    // Check all persons
    console.log('📋 Checking persons...')
    const { data: allPersons, error: personsError } = await supabase
      .from('persons')
      .select('id, name, slug, kind, public_domain')
      .limit(100)
    
    if (personsError) {
      console.error('❌ Error fetching persons:', personsError)
      return
    }
    
    console.log(`   Total persons: ${allPersons?.length || 0}`)
    
    if (allPersons && allPersons.length > 0) {
      console.log('\n   Sample persons:')
      allPersons.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name || '(no name)'}: kind=${p.kind || 'null'}, public_domain=${p.public_domain}, slug=${p.slug || 'null'}`)
      })
      
      // Count by kind
      const byKind = allPersons.reduce((acc, p) => {
        const kind = p.kind || 'null'
        acc[kind] = (acc[kind] || 0) + 1
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
      
      if (matching.length > 0) {
        console.log('\n   Matching authors:')
        matching.slice(0, 5).forEach(p => {
          console.log(`   - ${p.name} (${p.kind}, slug: ${p.slug})`)
        })
      }
    }
    
    // Check works
    console.log('\n📚 Checking works...')
    const { data: allWorks, error: worksError } = await supabase
      .from('works')
      .select('id, title, slug, status, visibility, primary_author_id')
      .limit(100)
    
    if (worksError) {
      console.error('❌ Error fetching works:', worksError)
      return
    }
    
    console.log(`   Total works: ${allWorks?.length || 0}`)
    
    if (allWorks && allWorks.length > 0) {
      console.log('\n   Sample works:')
      allWorks.slice(0, 10).forEach(w => {
        console.log(`   - ${w.title || '(no title)'}: status=${w.status || 'null'}, visibility=${w.visibility || 'null'}, author_id=${w.primary_author_id || 'none'}`)
      })
      
      // Count by status
      const byStatus = allWorks.reduce((acc, w) => {
        const status = w.status || 'null'
        acc[status] = (acc[status] || 0) + 1
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
    process.exit(1)
  }
}

checkData()
