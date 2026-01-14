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
}

// Helper functions
export async function getAuthors() {
  const response = await fetch(
    `${directusUrl}/items/persons?filter[kind][_eq]=faculty&filter[public_domain][_eq]=true`,
    {
      headers: {
        Authorization: `Bearer ${directusToken}`,
      },
    }
  )
  if (!response.ok) throw new Error('Failed to fetch authors')
  const data = await response.json()
  return data.data as Person[]
}

export async function getAuthorBySlug(slug: string) {
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

export async function getWorksByAuthor(authorId: string) {
  const response = await fetch(
    `${directusUrl}/items/works?filter[primary_author_id][_eq]=${authorId}&filter[status][_eq]=published&filter[visibility][_eq]=public`,
    {
      headers: {
        Authorization: `Bearer ${directusToken}`,
      },
    }
  )
  if (!response.ok) throw new Error('Failed to fetch works')
  const data = await response.json()
  return data.data as Work[]
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
