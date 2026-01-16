'use client'

import { useState, useRef, useEffect } from 'react'
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
  const libraryRef = useRef<HTMLDivElement>(null)

  // Filter authors based on search (only show authors with works)
  const filteredAuthors = authors.filter(author => {
    const hasWorks = (author.works?.length || 0) > 0
    if (!hasWorks) return false
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      author.name.toLowerCase().includes(query) ||
      author.slug.toLowerCase().includes(query)
    )
  })

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
            placeholder="Search authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Library Shelf - One book per author */}
      <div ref={libraryRef} className="max-w-7xl mx-auto px-6 pb-12">
        <h2 className="text-xl font-serif text-amber-800 mb-6">Commonplace Books</h2>
        <div className="flex flex-wrap gap-8 justify-center">
          {filteredAuthors.map((author) => (
            <AuthorBook key={author.id} author={author} />
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

interface AuthorBookProps {
  author: AuthorWithWorks
}

function AuthorBook({ author }: AuthorBookProps) {
  const workCount = author.works?.length || 0
  
  // Format author name for spine (e.g., "Plato", "Darwin")
  const getSpineName = (name: string): string => {
    const parts = name.split(' ')
    // For single names (Plato, Herodotus), use as-is
    // For multi-word names (Charles Darwin), use last name
    return parts.length === 1 ? parts[0] : parts[parts.length - 1]
  }
  
  const spineName = getSpineName(author.name)
  const spineColor = getAuthorColor(author.slug)
  
  return (
    <Link
      href={`/author/${author.slug}`}
      className="group flex flex-col items-center"
    >
      {/* Book Spine */}
      <div
        className="w-20 h-72 rounded-sm shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer relative overflow-hidden"
        style={{ backgroundColor: spineColor }}
      >
        {/* Decorative top band */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-black bg-opacity-20" />
        
        {/* Spine Text (Vertical) */}
        <div className="absolute inset-0 flex items-center justify-center p-3">
          <div
            className="text-white font-serif text-base writing-vertical-rl transform rotate-180 text-center font-semibold tracking-wider"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            {spineName}
          </div>
        </div>
        
        {/* Decorative bottom band */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-black bg-opacity-20" />

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
      </div>
      
      {/* Work count below spine */}
      <div className="mt-3 text-center">
        <div className="text-xs text-amber-600">
          {workCount} {workCount === 1 ? 'entry' : 'entries'}
        </div>
      </div>
    </Link>
  )
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
