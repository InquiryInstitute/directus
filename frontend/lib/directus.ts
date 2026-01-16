import { createDirectus, rest, staticToken } from '@directus/sdk'

// Directus client configuration
const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055'
const directusToken = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN || ''

// Create Directus client
export const directus = createDirectus(directusUrl)
  .with(rest())
  .with(staticToken(directusToken))

// Type definitions (will be generated from Directus schema)
export interface Person {
  id: string
  name: string
  slug: string
  kind: 'faculty' | 'editor' | 'reviewer' | 'external_author'
  bio?: string
  public_domain: boolean
  links?: Record<string, any>
}

export interface Work {
  id: string
  type: 'essay' | 'note' | 'lecture' | 'fragment_collection' | 'review_article'
  title: string
  slug: string
  abstract?: string
  content_md?: string
  status: string
  visibility: 'private' | 'members' | 'public'
  primary_author_id?: string
  cover_image?: string
  flipbook_mode?: 'html' | 'images' | 'pdf'
  flipbook_manifest?: {
    pageWidth: number
    pageHeight: number
    pages: Array<{ n: number; src: string }>
  }
  published_at?: string
  publication_date?: string
}

// Helper functions
// Types are already defined below, just export them
export type Author = Person

export async function getAuthors() {
  // Use Supabase REST API directly
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pilmscrodlitdrygabvo.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_L5A4YuZm5vF4o1ubDln3Dw_uRqnGsLc'
  
  try {
    // Get persons with public_domain=true and kind in ('faculty', 'external_author')
    const personsResponse = await fetch(
      `${supabaseUrl}/rest/v1/persons?select=id,name,slug,kind,public_domain&public_domain=eq.true&kind=in.(faculty,external_author)`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      }
    )
    
    if (!personsResponse.ok) throw new Error('Failed to fetch persons')
    const persons = await personsResponse.json()
    
    // Get published works for each person
    const authorsWithWorks = await Promise.all(
      persons.map(async (person: Person) => {
        const worksResponse = await fetch(
          `${supabaseUrl}/rest/v1/works?select=id,title,slug,cover_image,status,visibility&primary_author_id=eq.${person.id}&status=eq.published&visibility=eq.public`,
          {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
            },
          }
        )
        const works = worksResponse.ok ? await worksResponse.json() : []
        return { ...person, works }
      })
    )
    
    return authorsWithWorks
  } catch (error) {
    console.error('Failed to fetch from Supabase:', error)
    // Fallback to Directus
    const directusResponse = await fetch(
      `${directusUrl}/items/persons?filter[kind][_eq]=faculty&filter[public_domain][_eq]=true`,
      {
        headers: {
          Authorization: `Bearer ${directusToken}`,
        },
      }
    )
    if (!directusResponse.ok) throw new Error('Failed to fetch authors')
    const data = await directusResponse.json()
    return data.data as Person[]
  }
}

export async function getAuthorBySlug(slug: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pilmscrodlitdrygabvo.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_L5A4YuZm5vF4o1ubDln3Dw_uRqnGsLc'
  
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/persons?slug=eq.${slug}&select=*&limit=1`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      }
    )
    if (!response.ok) throw new Error('Failed to fetch author')
    const data = await response.json()
    return data[0] as Person | undefined
  } catch (error) {
    console.error('Supabase fetch failed, falling back to Directus:', error)
    const response = await fetch(
      `${directusUrl}/items/persons?filter[slug][_eq]=${slug}&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${directusToken}`,
        },
      }
    )
    if (!response.ok) throw new Error('Failed to fetch author')
    const data = await response.json()
    return data.data[0] as Person | undefined
  }
}

export async function getWorksByAuthor(authorId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pilmscrodlitdrygabvo.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_L5A4YuZm5vF4o1ubDln3Dw_uRqnGsLc'
  
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/works?primary_author_id=eq.${authorId}&status=eq.published&visibility=eq.public&select=*`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      }
    )
    if (!response.ok) throw new Error('Failed to fetch works')
    return await response.json() as Work[]
  } catch (error) {
    console.error('Supabase fetch failed, falling back to Directus:', error)
    const directusResponse = await fetch(
      `${directusUrl}/items/works?filter[primary_author_id][_eq]=${authorId}&filter[status][_eq]=published&filter[visibility][_eq]=public`,
      {
        headers: {
          Authorization: `Bearer ${directusToken}`,
        },
      }
    )
    if (!directusResponse.ok) throw new Error('Failed to fetch works')
    const data = await directusResponse.json()
    return data.data as Work[]
  }
}

export async function getWorkBySlug(slug: string) {
  const response = await fetch(
    `${directusUrl}/items/works?filter[slug][_eq]=${slug}&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${directusToken}`,
      },
    }
  )
  if (!response.ok) throw new Error('Failed to fetch work')
  const data = await response.json()
  return data.data[0] as Work | undefined
}
