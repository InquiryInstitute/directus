#!/usr/bin/env tsx
/**
 * Check what works and authors exist in Supabase directly
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xougqdomkoisrxdnagcj.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  try {
    console.log('🔍 Checking Supabase database directly...\n')
    
    // Check all persons
    console.log('📋 Checking persons...')
    const { data: persons, error: personsError } = await supabase
      .from('persons')
      .select('id, name, slug, kind, public_domain')
      .limit(100)
    
    if (personsError) {
      console.error('❌ Error fetching persons:', personsError)
    } else {
      console.log(`   Total persons: ${persons?.length || 0}`)
      
      if (persons && persons.length > 0) {
        console.log('\n   Sample persons:')
        persons.slice(0, 10).forEach(p => {
          console.log(`   - ${p.name || '(no name)'}: slug=${p.slug || 'null'}, kind=${p.kind || 'null'}, public_domain=${p.public_domain}`)
        })
        
        // Check for William James
        const williamJames = persons.filter(p => 
          (p.name && p.name.toLowerCase().includes('william james')) ||
          (p.slug && p.slug.toLowerCase().includes('william'))
        )
        if (williamJames.length > 0) {
          console.log('\n   🎯 William James found:')
          williamJames.forEach(p => {
            console.log(`   - ${p.name}: slug=${p.slug}, kind=${p.kind}, public_domain=${p.public_domain}`)
          })
        }
        
        // Count by kind
        const byKind = persons.reduce((acc, p) => {
          const kind = p.kind || 'null'
          acc[kind] = (acc[kind] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        console.log('\n   By kind:')
        Object.entries(byKind).forEach(([kind, count]) => {
          console.log(`   - ${kind}: ${count}`)
        })
        
        // Count matching query criteria
        const matching = persons.filter(p => 
          (p.kind === 'faculty' || p.kind === 'external_author') && 
          p.public_domain === true
        )
        console.log(`\n   ✅ Matching query (faculty/external_author + public_domain): ${matching.length}`)
        if (matching.length > 0) {
          console.log('   Matching authors:')
          matching.slice(0, 5).forEach(p => {
            console.log(`   - ${p.name} (${p.kind}, slug: ${p.slug})`)
          })
        }
      }
    }
    
    // Check all works
    console.log('\n📚 Checking works...')
    const { data: works, error: worksError } = await supabase
      .from('works')
      .select('id, title, slug, status, visibility, primary_author_id')
      .limit(100)
    
    if (worksError) {
      console.error('❌ Error fetching works:', worksError)
    } else {
      console.log(`   Total works: ${works?.length || 0}`)
      
      if (works && works.length > 0) {
        console.log('\n   Sample works:')
        works.slice(0, 10).forEach(w => {
          console.log(`   - ${w.title || '(no title)'}: slug=${w.slug || 'null'}, status=${w.status || 'null'}, visibility=${w.visibility || 'null'}, author_id=${w.primary_author_id || 'none'}`)
        })
        
        // Check for William James works
        const williamWorks = works.filter(w => 
          (w.slug && w.slug.toLowerCase().includes('william')) ||
          (w.title && w.title.toLowerCase().includes('william'))
        )
        if (williamWorks.length > 0) {
          console.log('\n   🎯 Works with "william" in title/slug:')
          williamWorks.forEach(w => {
            console.log(`   - ${w.title}: slug=${w.slug}, status=${w.status}, visibility=${w.visibility}, author_id=${w.primary_author_id}`)
          })
        }
        
        // Count by status
        const byStatus = works.reduce((acc, w) => {
          const status = w.status || 'null'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        console.log('\n   By status:')
        Object.entries(byStatus).forEach(([status, count]) => {
          console.log(`   - ${status}: ${count}`)
        })
        
        // Count published + public
        const publishedPublic = works.filter(w => 
          w.status === 'published' && w.visibility === 'public'
        )
        console.log(`\n   ✅ Published + public: ${publishedPublic.length}`)
        if (publishedPublic.length > 0) {
          console.log('   Published public works:')
          publishedPublic.slice(0, 5).forEach(w => {
            console.log(`   - ${w.title} (slug: ${w.slug}, author_id: ${w.primary_author_id})`)
          })
        }
        
        // Check works with authors
        const withAuthors = works.filter(w => w.primary_author_id)
        console.log(`\n   Works with primary_author_id: ${withAuthors.length}`)
      }
    }
    
    // Check if William James author exists and has works
    console.log('\n🔍 Checking William James specifically...')
    const { data: williamPerson, error: williamError } = await supabase
      .from('persons')
      .select('id, name, slug, kind, public_domain')
      .or('name.ilike.%william james%,slug.ilike.%william%')
      .limit(5)
    
    if (williamError) {
      console.error('   Error:', williamError)
    } else if (williamPerson && williamPerson.length > 0) {
      console.log(`   Found ${williamPerson.length} matching person(s):`)
      for (const p of williamPerson) {
        console.log(`   - ${p.name}: slug=${p.slug}, kind=${p.kind}, public_domain=${p.public_domain}, id=${p.id}`)
        
        // Check works for this author
        if (p.id) {
          const { data: authorWorks, error: worksErr } = await supabase
            .from('works')
            .select('id, title, slug, status, visibility')
            .eq('primary_author_id', p.id)
          
          if (!worksErr) {
            console.log(`     Works: ${authorWorks?.length || 0}`)
            if (authorWorks && authorWorks.length > 0) {
              authorWorks.forEach(w => {
                console.log(`       - ${w.title}: status=${w.status}, visibility=${w.visibility}`)
              })
            }
          }
        }
      }
    } else {
      console.log('   No William James person found')
    }
    
    console.log('\n✅ Check complete!')
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
    process.exit(1)
  }
}

check()
