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

    if (authorSlug) {
      if (authorSlug === 'all') {
        // Get all authors with their works from Supabase directly
        const { data: authors, error } = await supabase
          .from('persons')
          .select(`
            id,
            name,
            slug,
            kind,
            public_domain,
            works (
              id,
              title,
              slug,
              cover_image,
              status,
              visibility
            )
          `)
          .eq('kind', 'faculty')
          .eq('public_domain', true)
        
        if (error) {
          throw new Error(`Supabase error: ${error.message}`)
        }
        
        return new Response(
          JSON.stringify({ authors: authors || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get all works for a specific author from Supabase
      // First get author by slug
      const { data: author, error: authorError } = await supabase
        .from('persons')
        .select('id, name, slug')
        .eq('slug', authorSlug)
        .single()

      if (authorError || !author) {
        return new Response(
          JSON.stringify({ error: 'Author not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get works for this author
      const { data: works, error: worksError } = await supabase
        .from('works')
        .select('id, title, slug, abstract, cover_image, flipbook_mode, flipbook_manifest, primary_author_id')
        .eq('primary_author_id', author.id)
        .eq('status', 'published')
        .eq('visibility', 'public')

      if (worksError) {
        throw new Error(`Supabase error: ${worksError.message}`)
      }

      return new Response(
        JSON.stringify({ works: works || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get specific work by slug from Supabase
    const { data: work, error: workError } = await supabase
      .from('works')
      .select(`
        *,
        persons (
          id,
          name,
          slug
        )
      `)
      .eq('slug', slug)
      .single()

    if (workError || !work) {
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
