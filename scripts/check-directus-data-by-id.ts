#!/usr/bin/env tsx
/**
 * Check Directus data by querying with IDs and different methods
 */

import { createDirectus, rest, authentication, readItem } from '@directus/sdk'

const directusUrl = process.env.DIRECTUS_URL || 'https://commonplace-directus-652016456291.us-central1.run.app'
const directusEmail = process.env.DIRECTUS_EMAIL || 'custodian@inquiry.institute'
const directusPassword = process.env.DIRECTUS_PASSWORD || 'Jp89zfLeRuZFYhy'

async function check() {
  try {
    console.log('🔍 Checking Directus Data by ID\n')
    
    const directus = createDirectus(directusUrl).with(rest()).with(authentication())
    await directus.login(directusEmail, directusPassword)
    const token = await directus.getToken()
    console.log('✅ Authenticated\n')
    
    // Try fetching persons using REST API directly
    console.log('👤 Fetching persons via REST API...')
    const personsResponse = await fetch(
      `${directusUrl}/items/persons?limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    
    if (personsResponse.ok) {
      const personsData = await personsResponse.json()
      console.log(`   Found ${personsData.data?.length || 0} persons`)
      if (personsData.data && personsData.data.length > 0) {
        console.log('\n   Sample persons (raw API response):')
        personsData.data.slice(0, 5).forEach((p: any, i: number) => {
          console.log(`   ${i + 1}. ID: ${p.id}`)
          console.log(`      Keys: ${Object.keys(p).join(', ')}`)
          // Try to show any non-null values
          Object.entries(p).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              console.log(`      ${key}: ${value}`)
            }
          })
          console.log('')
        })
      }
    } else {
      const errorText = await personsResponse.text()
      console.log(`   ❌ Error: ${personsResponse.status} ${personsResponse.statusText}`)
      console.log(`   ${errorText.substring(0, 200)}`)
    }
    
    // Try fetching works
    console.log('📚 Fetching works via REST API...')
    const worksResponse = await fetch(
      `${directusUrl}/items/works?limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    
    if (worksResponse.ok) {
      const worksData = await worksResponse.json()
      console.log(`   Found ${worksData.data?.length || 0} works`)
      if (worksData.data && worksData.data.length > 0) {
        console.log('\n   Sample works (raw API response):')
        worksData.data.slice(0, 5).forEach((w: any, i: number) => {
          console.log(`   ${i + 1}. ID: ${w.id}`)
          console.log(`      Keys: ${Object.keys(w).join(', ')}`)
          // Try to show any non-null values
          Object.entries(w).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              console.log(`      ${key}: ${value}`)
            }
          })
          console.log('')
        })
      }
    } else {
      const errorText = await worksResponse.text()
      console.log(`   ❌ Error: ${worksResponse.status} ${worksResponse.statusText}`)
      console.log(`   ${errorText.substring(0, 200)}`)
    }
    
    // Try to get a specific work by ID (if we found any)
    if (worksResponse.ok) {
      const worksData = await worksResponse.json()
      if (worksData.data && worksData.data.length > 0) {
        const firstWorkId = worksData.data[0].id
        console.log(`\n🔍 Fetching work by ID: ${firstWorkId}...`)
        try {
          const work = await directus.request(readItem('works', firstWorkId))
          console.log('   Work details:')
          console.log(JSON.stringify(work, null, 2))
        } catch (error: any) {
          console.log(`   ❌ Error: ${error.message}`)
        }
      }
    }
    
    // Search for William James
    console.log('\n🔍 Searching for William James...')
    const searchResponse = await fetch(
      `${directusUrl}/items/persons?filter[name][_icontains]=william&filter[name][_icontains]=james`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json()
      console.log(`   Found ${searchData.data?.length || 0} matching persons`)
      if (searchData.data && searchData.data.length > 0) {
        searchData.data.forEach((p: any) => {
          console.log(`   - ${JSON.stringify(p, null, 2)}`)
        })
      }
    }
    
    // Also try searching works for william
    console.log('\n🔍 Searching works for "william"...')
    const worksSearchResponse = await fetch(
      `${directusUrl}/items/works?filter[slug][_icontains]=william`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    
    if (worksSearchResponse.ok) {
      const worksSearchData = await worksSearchResponse.json()
      console.log(`   Found ${worksSearchData.data?.length || 0} matching works`)
      if (worksSearchData.data && worksSearchData.data.length > 0) {
        worksSearchData.data.forEach((w: any) => {
          console.log(`   - ${JSON.stringify(w, null, 2)}`)
        })
      }
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
