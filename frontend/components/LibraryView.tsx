'use client'

import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { Author, Work } from '@/lib/directus'

// Extended Author type that includes works from the API
interface AuthorWithWorks extends Author {
  works?: Work[]
}

interface LibraryViewProps {
  authors: AuthorWithWorks[]
}

export default function LibraryView({ authors }: LibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const shelfRef = useRef<HTMLDivElement>(null)

  // Filter and sort authors alphabetically (only those with works)
  const sortedAuthors = useMemo(() => {
    return authors
      .filter(author => (author.works?.length || 0) > 0)
      .sort((a, b) => {
        const nameA = getDisplayName(a.name).toLowerCase()
        const nameB = getDisplayName(b.name).toLowerCase()
        return nameA.localeCompare(nameB)
      })
  }, [authors])

  // Find matching author for search
  const findMatchingAuthor = (query: string) => {
    if (!query) return null
    const q = query.toLowerCase()
    return sortedAuthors.find(author => 
      author.name.toLowerCase().includes(q) ||
      getDisplayName(author.name).toLowerCase().includes(q)
    )
  }

  const matchingAuthor = useMemo(() => findMatchingAuthor(searchQuery), [searchQuery, sortedAuthors])

  // Handle search input and scroll
  const handleSearch = (value: string) => {
    setSearchQuery(value)
    
    // Find and scroll to matching author
    const match = findMatchingAuthor(value)
    if (match) {
      // Find the index of the matching author
      const index = sortedAuthors.findIndex(a => a.slug === match.slug)
      if (index !== -1) {
        // Use setTimeout to ensure state update and DOM are ready
        setTimeout(() => {
          const shelf = shelfRef.current
          if (shelf) {
            // Each book is about 68px wide (56px + 12px gap)  
            const bookWidth = 68
            const containerWidth = shelf.clientWidth
            const targetScrollLeft = Math.max(0, (index * bookWidth) - (containerWidth / 2) + (bookWidth / 2))
            
            // Force scroll
            shelf.scrollLeft = targetScrollLeft
          }
        }, 50)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900">
      {/* Header */}
      <header className="bg-stone-950 shadow-lg border-b border-amber-900/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-serif text-amber-100 mb-1 tracking-wide">
            Commonplace
          </h1>
          <p className="text-amber-200/60 text-sm">Digital Scholarly Library</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search authors..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-5 py-4 pl-14 text-lg bg-stone-800/50 border-2 border-amber-900/40 rounded-xl focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 text-amber-100 placeholder-amber-200/40"
          />
          <svg
            className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && matchingAuthor && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-amber-400">
              → {getDisplayName(matchingAuthor.name)}
            </div>
          )}
        </div>
      </div>

      {/* Bookshelf */}
      <div className="relative px-4 py-8">
        {/* Shelf background */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-amber-950/40 to-transparent pointer-events-none" />
        
        {/* Horizontal scrolling shelf */}
        <div
          ref={shelfRef}
          className="flex gap-3 overflow-x-auto pb-8 px-8 scroll-smooth"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#92400e #1c1917'
          }}
        >
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-stone-900 to-transparent pointer-events-none z-10" />
          
          {sortedAuthors.map((author) => (
            <div
              key={author.id}
              id={`book-${author.slug}`}
            >
              <AuthorBook 
                author={author} 
                isHighlighted={matchingAuthor?.slug === author.slug}
              />
            </div>
          ))}
          
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-stone-900 to-transparent pointer-events-none z-10" />
        </div>

        {/* Wooden shelf */}
        <div className="mx-4 h-6 bg-gradient-to-b from-amber-800 via-amber-900 to-amber-950 rounded-b-sm shadow-lg" />
        <div className="mx-4 h-2 bg-gradient-to-b from-amber-950 to-stone-900 rounded-b-lg" />
      </div>

      {/* Empty state */}
      {sortedAuthors.length === 0 && (
        <div className="text-center py-12 text-amber-200/60">
          No authors with published works found.
        </div>
      )}

      {/* Instructions */}
      <div className="text-center py-6 text-amber-200/40 text-sm">
        <p>Scroll horizontally to browse • Type to search • Click a book to read</p>
      </div>
    </div>
  )
}

interface AuthorBookProps {
  author: AuthorWithWorks
  isHighlighted: boolean
}

function AuthorBook({ author, isHighlighted }: AuthorBookProps) {
  const spineName = getDisplayName(author.name)
  const spineColor = getAuthorColor(author.slug)
  
  return (
    <Link
      href={`/author/${author.slug}`}
      className="group flex flex-col items-center flex-shrink-0"
    >
      {/* Book */}
      <div
        className={`
          w-14 h-56 rounded-sm shadow-xl cursor-pointer relative overflow-hidden
          transform transition-all duration-300 
          hover:scale-105 hover:-translate-y-2 hover:shadow-2xl
          ${isHighlighted ? 'scale-110 -translate-y-4 ring-2 ring-amber-400 shadow-amber-400/30' : ''}
        `}
        style={{ backgroundColor: spineColor }}
      >
        {/* Book edge effect (left) */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black/30 to-transparent" />
        
        {/* Decorative gold band top */}
        <div className="absolute top-3 left-1 right-1 h-0.5 bg-gradient-to-r from-amber-400/40 via-amber-300/60 to-amber-400/40" />
        
        {/* Spine Text (Vertical) */}
        <div className="absolute inset-0 flex items-center justify-center px-2">
          <div
            className="text-amber-100/90 font-serif text-xs writing-vertical-rl transform rotate-180 text-center font-medium tracking-wider whitespace-nowrap overflow-hidden"
            style={{ 
              writingMode: 'vertical-rl', 
              textOrientation: 'mixed',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            {spineName}
          </div>
        </div>
        
        {/* Decorative gold band bottom */}
        <div className="absolute bottom-3 left-1 right-1 h-0.5 bg-gradient-to-r from-amber-400/40 via-amber-300/60 to-amber-400/40" />

        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-amber-400/0 group-hover:bg-amber-400/10 transition-colors" />
      </div>
    </Link>
  )
}

// Get display name (last name or single name)
function getDisplayName(name: string): string {
  const parts = name.split(' ')
  return parts.length === 1 ? parts[0] : parts[parts.length - 1]
}

// Generate unique color for each author based on their slug
function getAuthorColor(slug: string): string {
  const colors = [
    '#7c2d12', // Orange-900
    '#78350f', // Amber-900
    '#713f12', // Yellow-900
    '#365314', // Lime-900
    '#14532d', // Green-900
    '#134e4a', // Teal-900
    '#164e63', // Cyan-900
    '#0c4a6e', // Sky-900
    '#1e3a8a', // Blue-900
    '#312e81', // Indigo-900
    '#4c1d95', // Violet-900
    '#581c87', // Purple-900
    '#701a75', // Fuchsia-900
    '#831843', // Pink-900
    '#881337', // Rose-900
  ]
  
  // Simple hash function to pick a color
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
