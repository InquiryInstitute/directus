'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import BookReader from '@/components/BookReader'
import TableOfContents from '@/components/TableOfContents'

interface Work {
  id: string
  title: string
  slug: string
  content_md?: string
  flipbook_mode?: string
  flipbook_manifest?: {
    pageWidth: number
    pageHeight: number
    pages: Array<{ n: number; src: string }>
  }
  toc?: Array<{ id: string; text: string; level: number }>
}

export default function BookPageClient() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string[] | undefined
  const workSlug = slug?.[slug.length - 1] || ''
  
  const [work, setWork] = useState<Work | null>(null)
  const [loading, setLoading] = useState(true)
  const [showToc, setShowToc] = useState(false)

  useEffect(() => {
    if (!workSlug) {
      router.push('/')
      return
    }

    async function loadWork() {
      try {
        const response = await fetch(
          `https://xougqdomkoisrxdnagcj.supabase.co/functions/v1/get-flipbook?slug=${workSlug}`
        )
        const data = await response.json()
        setWork(data.work)
      } catch (error) {
        console.error('Failed to load work:', error)
      } finally {
        setLoading(false)
      }
    }
    loadWork()
  }, [workSlug, router])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading book...</div>
      </main>
    )
  }

  if (!work) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Book not found</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-amber-50">
      <header className="bg-white shadow-sm border-b border-amber-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-amber-600 hover:text-amber-800">
              ← Back to Library
            </Link>
            <h1 className="text-2xl font-serif text-amber-900 mt-1">{work.title}</h1>
          </div>
          <button
            onClick={() => setShowToc(!showToc)}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            {showToc ? 'Hide' : 'Show'} Table of Contents
          </button>
        </div>
      </header>

      <div className="flex">
        {showToc && work.toc && (
          <aside className="w-64 bg-white border-r border-amber-200 min-h-screen p-6">
            <TableOfContents toc={work.toc} />
          </aside>
        )}

        <div className="flex-1 flex justify-center items-center p-8">
          <BookReader work={work} />
        </div>
      </div>
    </main>
  )
}
