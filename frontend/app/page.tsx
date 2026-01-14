'use client'

import { useEffect, useState } from 'react'
import LibraryView from '@/components/LibraryView'
import { getAuthors, getWorksByAuthor } from '@/lib/directus'

export default function Home() {
  const [authors, setAuthors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAuthors() {
      try {
        const data = await getAuthors()
        setAuthors(data)
      } catch (error) {
        console.error('Failed to load authors:', error)
      } finally {
        setLoading(false)
      }
    }
    loadAuthors()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading library...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <LibraryView authors={authors} />
    </main>
  )
}
