'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Author, Work, getWorksByAuthor } from '@/lib/directus'

interface LibraryViewProps {
  authors: Author[]
}

export default function LibraryView({ authors }: LibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null)
  const libraryRef = useRef<HTMLDivElement>(null)

  // Filter authors/works based on search
  const filteredAuthors = authors.filter(author => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      author.name.toLowerCase().includes(query) ||
      author.slug.toLowerCase().includes(query)
    )
  })

  // Scroll to selected author
  useEffect(() => {
    if (selectedAuthor && libraryRef.current) {
      const element = document.getElementById(`author-${selectedAuthor}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [selectedAuthor])

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    // Auto-select first match
    if (query && filteredAuthors.length > 0) {
      setSelectedAuthor(filteredAuthors[0].slug)
    } else {
      setSelectedAuthor(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-4xl font-serif text-amber-900 mb-2">
            Commonplace
          </h1>
          <p className="text-amber-700">Digital Scholarly Library</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search authors or works..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-3 pl-12 text-lg border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Library Shelf */}
      <div
        ref={libraryRef}
        className="max-w-7xl mx-auto px-6 pb-12"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredAuthors.map((author) => (
            <AuthorBookshelf
              key={author.id}
              author={author}
              isSelected={selectedAuthor === author.slug}
              onSelect={() => setSelectedAuthor(author.slug)}
            />
          ))}
        </div>

        {filteredAuthors.length === 0 && (
          <div className="text-center py-12 text-amber-600">
            No authors found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  )
}

interface AuthorBookshelfProps {
  author: Author
  isSelected: boolean
  onSelect: () => void
}

function AuthorBookshelf({ author, isSelected, onSelect }: AuthorBookshelfProps) {
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWorks() {
      try {
        // Use author slug instead of ID for Edge Function
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xougqdomkoisrxdnagcj.supabase.co'
        const response = await fetch(
          `${supabaseUrl}/functions/v1/get-flipbook?author=${author.slug}`
        )
        if (response.ok) {
          const data = await response.json()
          setWorks(data.works || [])
        } else {
          // Fallback to Directus
          const data = await getWorksByAuthor(author.id)
          setWorks(data)
        }
      } catch (error) {
        console.error('Failed to load works:', error)
        // Fallback to Directus
        try {
          const data = await getWorksByAuthor(author.id)
          setWorks(data)
        } catch (e) {
          console.error('Directus fallback also failed:', e)
        }
      } finally {
        setLoading(false)
      }
    }
    loadWorks()
  }, [author.id, author.slug])

  if (loading) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="w-16 h-48 bg-amber-200 animate-pulse rounded" />
        <div className="text-sm text-amber-600">Loading...</div>
      </div>
    )
  }

  if (works.length === 0) {
    return null
  }

  return (
    <div
      id={`author-${author.slug}`}
      className={`flex flex-col items-center space-y-2 ${isSelected ? 'ring-4 ring-amber-400 rounded-lg p-2' : ''}`}
    >
      {works.map((work) => (
        <BookSpine
          key={work.id}
          work={work}
          author={author}
          onClick={onSelect}
        />
      ))}
      <div className="text-center mt-2">
        <div className="text-sm font-semibold text-amber-900">{author.name}</div>
        <div className="text-xs text-amber-600">{works.length} {works.length === 1 ? 'work' : 'works'}</div>
      </div>
    </div>
  )
}

interface BookSpineProps {
  work: Work
  author: Author
  onClick: () => void
}

function BookSpine({ work, author, onClick }: BookSpineProps) {
  const spineColor = getSpineColor(work.type)
  
  return (
    <Link
      href={`/book?slug=${work.slug}`}
      onClick={onClick}
      className="group relative"
    >
      <div
        className="w-16 h-64 bg-gradient-to-r from-amber-700 to-amber-800 rounded-sm shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
        style={{ backgroundColor: spineColor }}
      >
        {/* Spine Text (Vertical) */}
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <div
            className="text-white font-serif text-xs writing-vertical-rl transform rotate-180 text-center"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            {work.title}
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-sm" />
      </div>
    </Link>
  )
}

// Generate spine color based on work type
function getSpineColor(type: string): string {
  const colors: Record<string, string> = {
    essay: '#92400e',      // Amber-800
    note: '#78350f',       // Amber-900
    lecture: '#a16207',   // Amber-700
    fragment_collection: '#854d0e', // Amber-900
    review_article: '#713f12', // Amber-950
  }
  return colors[type] || '#92400e'
}
