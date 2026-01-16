import { getAuthorBySlug, getWorksByAuthor } from '@/lib/directus'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  
  if (!author) {
    notFound()
  }
  
  const works = await getWorksByAuthor(author.id)
  
  // Format author name for display (e.g., "Plato", "Darwin")
  const getDisplayName = (name: string): string => {
    const parts = name.split(' ')
    return parts.length === 1 ? parts[0] : parts[parts.length - 1]
  }
  
  const displayName = getDisplayName(author.name)

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="text-amber-600 hover:text-amber-800 text-sm mb-2 inline-block">
            ← Back to Library
          </Link>
          <h1 className="text-4xl font-serif text-amber-900">
            {displayName}&apos;s Commonplace Book
          </h1>
          <p className="text-amber-700 mt-1">{author.name}</p>
        </div>
      </header>

      {/* Bio Section */}
      {author.bio && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-amber-200 p-6">
            <h2 className="text-lg font-serif text-amber-900 mb-3">About</h2>
            <p className="text-amber-800 leading-relaxed">{author.bio}</p>
          </div>
        </div>
      )}

      {/* Works Collection */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <h2 className="text-xl font-serif text-amber-800 mb-6">
          Contents ({works.length} {works.length === 1 ? 'entry' : 'entries'})
        </h2>
        
        {works.length === 0 ? (
          <div className="text-center py-12 text-amber-600">
            No published works yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {works.map((work) => (
              <Link
                key={work.id}
                href={`/book?slug=${work.slug}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-sm border border-amber-200 p-6 hover:shadow-md hover:border-amber-400 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-serif text-amber-900 group-hover:text-amber-700 transition-colors">
                        {work.title}
                      </h3>
                      {work.abstract && (
                        <p className="text-amber-700 mt-2 text-sm line-clamp-2">
                          {work.abstract}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-4 text-xs text-amber-500">
                        {work.type && (
                          <span className="capitalize">{work.type.replace('_', ' ')}</span>
                        )}
                        {work.published_at && (
                          <span>{new Date(work.published_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 text-amber-400 group-hover:text-amber-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
