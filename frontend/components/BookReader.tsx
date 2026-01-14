'use client'

import { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'

// Type for PageFlip (will be loaded dynamically)
declare class PageFlip {
  constructor(container: HTMLElement, options: any)
  loadFromHTML(element: HTMLElement): void
  flipNext(): void
  flipPrev(): void
}

interface Work {
  id: string
  title: string
  flipbook_mode?: string
  flipbook_manifest?: {
    pageWidth: number
    pageHeight: number
    pages: Array<{ n: number; src: string }>
  }
  content_md?: string
}

interface BookReaderProps {
  work: Work
}

export default function BookReader({ work }: BookReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pageFlipRef = useRef<PageFlip | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!containerRef.current) return

    // If flipbook_manifest exists, use it
    if (work.flipbook_manifest && work.flipbook_manifest.pages.length > 0) {
      // Dynamically import PageFlip
      import('page-flip').then((module) => {
        const { PageFlip } = module
        const pageFlip = new PageFlip(containerRef.current!, {
          width: work.flipbook_manifest!.pageWidth,
          height: work.flipbook_manifest!.pageHeight,
          showCover: true,
          maxShadowOpacity: 0.5,
        })

        // Load pages
        work.flipbook_manifest!.pages.forEach((page) => {
          const pageElement = document.createElement('div')
          pageElement.className = 'page'
          const img = document.createElement('img')
          img.src = page.src
          img.alt = `Page ${page.n}`
          img.style.width = '100%'
          img.style.height = '100%'
          img.style.objectFit = 'contain'
          pageElement.appendChild(img)
          pageFlip.addPage(pageElement)
        })

        pageFlipRef.current = pageFlip as any
        setLoading(false)
      }).catch((error) => {
        console.error('Failed to load StPageFlip:', error)
        setLoading(false)
      })
    } else if (work.content_md) {
      // Fallback: render markdown content as pages
      const pages = splitMarkdownIntoPages(work.content_md)
      
      // Dynamically import PageFlip only when needed
      import('page-flip').then((module) => {
        const { PageFlip } = module
        const pageFlip = new PageFlip(containerRef.current!, {
          width: 900,
          height: 1200,
          showCover: true,
          maxShadowOpacity: 0.5,
        })

        pages.forEach((pageContent) => {
          const pageElement = document.createElement('div')
          pageElement.className = 'page bg-white p-12'
          // Convert markdown to HTML
          const html = marked(pageContent)
          pageElement.innerHTML = `<div class="prose prose-lg max-w-none">${html}</div>`
          pageFlip.addPage(pageElement)
        })

        pageFlipRef.current = pageFlip as any
        setLoading(false)
      }).catch((error) => {
        console.error('Failed to load StPageFlip:', error)
        setLoading(false)
      })
    }
  }, [work])

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="text-xl">Loading book...</div>
      </div>
    )
  }

  return (
    <div className="w-full flex justify-center">
      <div
        ref={containerRef}
        className="book-container"
        style={{ width: '900px', height: '1200px' }}
      />
    </div>
  )
}

// Simple markdown to HTML converter (for demo)
// In production, use a proper markdown library like 'marked' or 'remark'
function splitMarkdownIntoPages(markdown: string): string[] {
  // Split by headings or paragraphs
  const chunks = markdown.split(/\n\n+/)
  const pages: string[] = []
  let currentPage = ''

  chunks.forEach((chunk) => {
    if (currentPage.length + chunk.length > 2000) {
      pages.push(currentPage)
      currentPage = chunk
    } else {
      currentPage += '\n\n' + chunk
    }
  })

  if (currentPage) {
    pages.push(currentPage)
  }

  return pages.length > 0 ? pages : [markdown]
}
