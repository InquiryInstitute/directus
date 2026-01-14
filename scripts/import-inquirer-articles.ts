#!/usr/bin/env tsx
/**
 * Import Inquirer articles and review/revision artifacts to Commonplace
 * 
 * This script:
 * 1. Reads markdown files from inquirer-quarterly/posts
 * 2. Parses frontmatter and content
 * 3. Creates works in Directus
 * 4. Links review/revision artifacts as related works
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, dirname, basename } from 'path'
import matter from 'gray-matter'
import { createDirectus, rest, staticToken, readItems, createItem, updateItem } from '@directus/sdk'

// Directus client
const directusUrl = process.env.DIRECTUS_URL || 'https://directus.inquiry.institute'
const directusToken = process.env.DIRECTUS_TOKEN || ''
const directus = createDirectus(directusUrl)
  .with(rest())
  .with(staticToken(directusToken))

// Paths - adjust based on where script is run from
const INQUIRER_POSTS_ROOT = process.env.INQUIRER_POSTS_ROOT || 
  join(process.cwd(), '../Inquiry.Institute/inquirer-quarterly/posts')

interface InquirerArticle {
  slug: string
  title: string
  authors: string[]
  content: string
  publicationDate?: string
  volume: string
  issue: string
  firstPage?: number
  lastPage?: number
  status?: string
  faculty?: string
  summary?: string
  filePath: string
  isRevision?: boolean
  isAuthorResponse?: boolean
  isReview?: boolean
  originalSlug?: string
}

// Get or create person by name
async function getOrCreatePerson(name: string): Promise<string> {
  // Try to find existing person
  try {
    const persons = await directus.request(
      readItems('persons', {
        filter: { name: { _eq: name } },
        limit: 1,
      })
    )
    if (persons && persons.length > 0) {
      return persons[0].id
    }
  } catch (error) {
    console.warn(`Error finding person ${name}:`, error)
  }

  // Create new person
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const person = await directus.request(
      createItem('persons', {
        name,
        slug,
        kind: 'external_author',
        public_domain: true,
        bio: null,
      })
    )
    return person.id
  } catch (error) {
    console.error(`Error creating person ${name}:`, error)
    throw error
  }
}

// Parse article from markdown file
function parseArticle(filePath: string, volume: string, issue: string): InquirerArticle | null {
  try {
    const raw = readFileSync(filePath, 'utf8')
    const { data, content } = matter(raw)

    const title = typeof data.title === 'string' ? data.title.trim() : ''
    const slug = typeof data.slug === 'string' ? data.slug.trim() : ''

    if (!title || !slug) {
      return null
    }

    const authors = Array.isArray(data.authors)
      ? data.authors.filter((a): a is string => typeof a === 'string')
      : []

    if (authors.length === 0 && !data.faculty) {
      return null
    }

    const fileName = basename(filePath, '.md')
    const isRevision = fileName.includes('revised') || fileName.includes('revision')
    const isAuthorResponse = fileName.includes('author-response') || fileName.includes('response')
    const isReview = fileName.includes('review') && !isAuthorResponse

    // Extract original slug if this is a revision/response
    let originalSlug: string | undefined
    if (isRevision || isAuthorResponse) {
      // Try multiple patterns to find original article slug
      // Pattern 1: slug-revised or slug-author-response
      let match = slug.match(/^(.+?)-(?:revised|author-response|response)$/)
      if (match) {
        originalSlug = match[1]
      } else {
        // Pattern 2: a-author-slug-revised
        match = slug.match(/^a-[^-]+-(.+?)-(?:revised|author-response|response)$/)
        if (match) {
          originalSlug = `a-${match[1]}`
        } else {
          // Pattern 3: Check if slug contains original in title
          const originalTitle = typeof data.original_slug === 'string' ? data.original_slug : undefined
          if (originalTitle) {
            originalSlug = originalTitle
          } else {
            // Pattern 4: Remove -revised or -author-response from end
            originalSlug = slug.replace(/-(?:revised|author-response|response)$/, '')
          }
        }
      }
    }

    return {
      slug,
      title,
      authors,
      content,
      publicationDate: typeof data.date_published === 'string' ? data.date_published : undefined,
      volume,
      issue,
      firstPage: typeof data.firstpage === 'number' ? data.firstpage : undefined,
      lastPage: typeof data.lastpage === 'number' ? data.lastpage : undefined,
      status: typeof data.status === 'string' ? data.status : 'published',
      faculty: typeof data.faculty === 'string' ? data.faculty : undefined,
      summary: typeof data.summary === 'string' ? data.summary : undefined,
      filePath,
      isRevision,
      isAuthorResponse,
      isReview,
      originalSlug,
    }
  } catch (error) {
    console.warn(`Failed to parse ${filePath}:`, error)
    return null
  }
}

// Collect all articles
function collectArticles(): InquirerArticle[] {
  const articles: InquirerArticle[] = []

  if (!require('fs').existsSync(INQUIRER_POSTS_ROOT)) {
    console.error(`Inquirer posts directory not found: ${INQUIRER_POSTS_ROOT}`)
    return articles
  }

  // Read volume directories
  const volumes = readdirSync(INQUIRER_POSTS_ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)

  for (const volume of volumes) {
    const volumePath = join(INQUIRER_POSTS_ROOT, volume)
    const issues = readdirSync(volumePath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)

    for (const issue of issues) {
      const issuePath = join(volumePath, issue)
      const files = readdirSync(issuePath, { withFileTypes: true })
        .filter(f => f.isFile() && f.name.endsWith('.md'))
        .map(f => join(issuePath, f.name))

      for (const filePath of files) {
        const article = parseArticle(filePath, volume, issue)
        if (article) {
          articles.push(article)
        }
      }
    }
  }

  return articles
}

// Import article to Directus
async function importArticle(article: InquirerArticle): Promise<string | null> {
  try {
    // Get or create primary author
    let primaryAuthorId: string | undefined
    if (article.authors.length > 0) {
      primaryAuthorId = await getOrCreatePerson(article.authors[0])
    } else if (article.faculty) {
      // Try to find faculty person by slug
      const facultySlug = article.faculty.replace(/^a\./, '')
      try {
        const persons = await directus.request(
          readItems('persons', {
            filter: { slug: { _eq: facultySlug } },
            limit: 1,
          })
        )
        if (persons && persons.length > 0) {
          primaryAuthorId = persons[0].id
        }
      } catch (error) {
        console.warn(`Could not find faculty person ${article.faculty}`)
      }
    }

    if (!primaryAuthorId) {
      console.warn(`Skipping ${article.slug}: no author found`)
      return null
    }

    // Determine work type
    let workType: 'essay' | 'note' | 'lecture' | 'fragment_collection' | 'review_article' = 'essay'
    if (article.isReview) {
      workType = 'review_article'
    }

    // Determine status
    let status: 'draft' | 'submitted' | 'in_review' | 'revisions_requested' | 'revised' | 'accepted' | 'scheduled' | 'published' | 'archived' | 'rejected' = 'published'
    if (article.isRevision) {
      status = 'revised'
    } else if (article.status === 'preprint') {
      status = 'submitted'
    }

    // Create work
    const work = await directus.request(
      createItem('works', {
        type: workType,
        title: article.title,
        slug: article.slug,
        abstract: article.summary || null,
        content_md: article.content,
        status,
        visibility: 'public',
        primary_author_id: primaryAuthorId,
        published_at: article.publicationDate || null,
        created_at: article.publicationDate || new Date().toISOString(),
      })
    )

    console.log(`✅ Imported: ${article.slug} (${work.id})`)
    return work.id
  } catch (error: any) {
    if (error?.extensions?.code === 'RECORD_NOT_UNIQUE') {
      console.log(`⚠️  Already exists: ${article.slug}`)
      // Try to find existing work
      try {
        const works = await directus.request(
          readItems('works', {
            filter: { slug: { _eq: article.slug } },
            limit: 1,
          })
        )
        return works && works.length > 0 ? works[0].id : null
      } catch (e) {
        return null
      }
    }
    console.error(`Error importing ${article.slug}:`, error)
    return null
  }
}

// Link revision/response to original work
async function linkRevision(originalWorkId: string, revisionWorkId: string, relationType: 'revises' | 'responds_to') {
  try {
    await directus.request(
      createItem('work_relations', {
        from_work_id: revisionWorkId,
        to_work_id: originalWorkId,
        relation_type: relationType,
        note: null,
      })
    )
    console.log(`  ✅ Linked ${relationType}: ${revisionWorkId} → ${originalWorkId}`)
  } catch (error: any) {
    if (error?.extensions?.code === 'RECORD_NOT_UNIQUE') {
      console.log(`  ⚠️  Relation already exists`)
    } else {
      console.error(`  ❌ Error linking relation:`, error)
    }
  }
}

// Main import function
async function main() {
  console.log('📚 Importing Inquirer articles to Commonplace\n')

  // Collect articles
  console.log('Collecting articles...')
  const articles = collectArticles()
  console.log(`Found ${articles.length} articles\n`)

  // Separate original articles from revisions/responses
  const originalArticles = articles.filter(a => !a.isRevision && !a.isAuthorResponse && !a.isReview)
  const revisions = articles.filter(a => a.isRevision)
  const responses = articles.filter(a => a.isAuthorResponse)
  const reviews = articles.filter(a => a.isReview)

  console.log(`Original articles: ${originalArticles.length}`)
  console.log(`Revisions: ${revisions.length}`)
  console.log(`Author responses: ${responses.length}`)
  console.log(`Reviews: ${reviews.length}\n`)

  // Import original articles first
  const workMap = new Map<string, string>() // slug -> work_id

  console.log('Importing original articles...')
  for (const article of originalArticles) {
    const workId = await importArticle(article)
    if (workId) {
      workMap.set(article.slug, workId)
    }
  }

  // Import and link revisions
  console.log('\nImporting revisions...')
  for (const revision of revisions) {
    const workId = await importArticle(revision)
    if (workId && revision.originalSlug) {
      const originalWorkId = workMap.get(revision.originalSlug)
      if (originalWorkId) {
        await linkRevision(originalWorkId, workId, 'revises')
      } else {
        console.warn(`  ⚠️  Original work not found: ${revision.originalSlug}`)
      }
    }
  }

  // Import and link author responses
  console.log('\nImporting author responses...')
  for (const response of responses) {
    const workId = await importArticle(response)
    if (workId && response.originalSlug) {
      const originalWorkId = workMap.get(response.originalSlug)
      if (originalWorkId) {
        await linkRevision(originalWorkId, workId, 'responds_to')
      } else {
        console.warn(`  ⚠️  Original work not found: ${response.originalSlug}`)
      }
    }
  }

  // Import reviews
  console.log('\nImporting reviews...')
  for (const review of reviews) {
    await importArticle(review)
  }

  console.log('\n✅ Import complete!')
}

main().catch(console.error)
