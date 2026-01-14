// Supabase Edge Function: Get Flipbook Data
// Fetches work data and flipbook manifest from Directus/Supabase

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get work slug from query params
    const url = new URL(req.url)
    const slug = url.searchParams.get('slug')
    const authorSlug = url.searchParams.get('author')

    if (!slug && !authorSlug) {
      return new Response(
        JSON.stringify({ error: 'Missing slug or author parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Directus API URL
    const directusUrl = Deno.env.get('DIRECTUS_URL') || 'https://directus.inquiry.institute'
    const directusToken = Deno.env.get('DIRECTUS_TOKEN') || ''

    if (authorSlug) {
      if (authorSlug === 'all') {
        // Get all authors with their works
        const authorsResponse = await fetch(
          `${directusUrl}/items/persons?filter[kind][_eq]=faculty&filter[public_domain][_eq]=true&fields=id,name,slug`,
          {
            headers: {
              'Authorization': `Bearer ${directusToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
        
        if (!authorsResponse.ok) {
          throw new Error(`Directus API error: ${authorsResponse.status}`)
        }
        
        const authorsData = await authorsResponse.json()
        return new Response(
          JSON.stringify({ authors: authorsData.data || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get all works for a specific author
      // First get author by slug
      const authorResponse = await fetch(
        `${directusUrl}/items/persons?filter[slug][_eq]=${authorSlug}&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${directusToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!authorResponse.ok) {
        throw new Error(`Directus API error: ${authorResponse.status}`)
      }

      const authorData = await authorResponse.json()
      const author = authorData.data?.[0]

      if (!author) {
        return new Response(
          JSON.stringify({ error: 'Author not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get works for this author
      const worksResponse = await fetch(
        `${directusUrl}/items/works?filter[primary_author_id][_eq]=${author.id}&filter[status][_eq]=published&filter[visibility][_eq]=public&fields=id,title,slug,abstract,cover_image,flipbook_mode,flipbook_manifest,primary_author_id`,
        {
          headers: {
            'Authorization': `Bearer ${directusToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!worksResponse.ok) {
        throw new Error(`Directus API error: ${worksResponse.status}`)
      }

      const worksData = await worksResponse.json()
      return new Response(
        JSON.stringify({ works: worksData.data || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get specific work by slug
    const response = await fetch(
      `${directusUrl}/items/works?filter[slug][_eq]=${slug}&limit=1&fields=*,primary_author_id.*`,
      {
        headers: {
          'Authorization': `Bearer ${directusToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Directus API error: ${response.status}`)
    }

    const data = await response.json()
    const work = data.data?.[0]

    if (!work) {
      return new Response(
        JSON.stringify({ error: 'Work not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate Table of Contents from content_md if available
    let toc = []
    if (work.content_md) {
      const headings = work.content_md.match(/^#{1,3}\s+(.+)$/gm) || []
      toc = headings.map((heading, index) => {
        const level = heading.match(/^#+/)[0].length
        const text = heading.replace(/^#+\s+/, '')
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        return { id, text, level, index }
      })
    }

    // Return work with TOC
    return new Response(
      JSON.stringify({
        work: {
          ...work,
          toc,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
