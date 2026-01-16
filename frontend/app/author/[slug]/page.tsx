import { getAuthors, getAuthorBySlug, getWorksByAuthor } from '@/lib/directus'
import CommonplaceBook from '@/components/CommonplaceBook'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Generate static params for all authors at build time
export async function generateStaticParams() {
  try {
    const authors = await getAuthors()
    return authors
      .filter(a => (a.works?.length || 0) > 0)
      .map(author => ({ slug: author.slug }))
  } catch (error) {
    console.error('Failed to generate static params:', error)
    return []
  }
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  
  if (!author) {
    notFound()
  }
  
  const works = await getWorksByAuthor(author.id)
  
  // Filter to only published, public works
  const publishedWorks = works.filter(
    (w: any) => w.status === 'published' && w.visibility === 'public'
  )

  return (
    <CommonplaceBook 
      author={author} 
      works={publishedWorks}
    />
  )
}
// Rebuild Fri Jan 16 15:53:28 MST 2026
