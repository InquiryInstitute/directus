'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { marked } from 'marked'
import Link from 'next/link'

interface Work {
  id: string
  title: string
  slug: string
  content_md?: string
  abstract?: string
  type?: string
  published_at?: string
  publication_date?: string
}

interface Author {
  id: string
  name: string
  slug: string
  bio?: string
}

interface CommonplaceBookProps {
  author: Author
  works: Work[]
}

// Format date in a handwritten journal style
function formatJournalDate(dateStr?: string): string {
  if (!dateStr) {
    // Return a plausible historical-looking date
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December']
    const month = months[Math.floor(Math.random() * 12)]
    const day = Math.floor(Math.random() * 28) + 1
    return `${month} ${day}`
  }
  
  try {
    const date = new Date(dateStr)
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    return date.toLocaleDateString('en-US', options)
  } catch {
    return dateStr
  }
}

export default function CommonplaceBook({ author, works }: CommonplaceBookProps) {
  const bookRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [pages, setPages] = useState<string[]>([])

  // Get display name (last name or single name)
  const getDisplayName = (name: string): string => {
    const parts = name.split(' ')
    return parts.length === 1 ? parts[0] : parts[parts.length - 1]
  }

  // Build pages from works
  useEffect(() => {
    const allPages: string[] = []

    // Cover page
    allPages.push(`
      <div class="cover-page">
        <div class="cover-ornament top"></div>
        <h1>${getDisplayName(author.name)}</h1>
        <p class="subtitle">Commonplace Book</p>
        <div class="author-full">${author.name}</div>
        <div class="cover-ornament bottom"></div>
      </div>
    `)

    // Table of Contents
    let tocHtml = `
      <div class="toc-page">
        <h2>Contents</h2>
        <ul class="toc-list">
    `
    works.forEach((work, index) => {
      tocHtml += `<li><span class="toc-title">${work.title}</span><span class="toc-dots"></span><span class="toc-page-num">${index + 3}</span></li>`
    })
    tocHtml += `</ul></div>`
    allPages.push(tocHtml)

    // Bio page if exists
    if (author.bio) {
      allPages.push(`
        <div class="bio-page">
          <h2>About the Author</h2>
          <p>${author.bio}</p>
        </div>
      `)
    }

    // Each work as pages
    works.forEach((work) => {
      const workDate = formatJournalDate(work.publication_date || work.published_at)
      
      // Title page for each work
      allPages.push(`
        <div class="work-title-page">
          <div class="work-date">${workDate}</div>
          <h2>${work.title}</h2>
          ${work.type ? `<p class="work-type">${work.type.replace('_', ' ')}</p>` : ''}
          ${work.abstract ? `<p class="work-abstract">${work.abstract}</p>` : ''}
        </div>
      `)

      // Content pages with date headers
      if (work.content_md) {
        const contentPages = splitContentIntoPages(work.content_md)
        contentPages.forEach((pageContent, pageIndex) => {
          const html = marked(pageContent) as string
          allPages.push(`
            <div class="content-page">
              <div class="page-date-header">${workDate}</div>
              ${html}
            </div>
          `)
        })
      }
    })

    // Back cover
    allPages.push(`
      <div class="back-cover">
        <div class="cover-ornament top"></div>
        <p class="finis">— Finis —</p>
        <div class="cover-ornament bottom"></div>
      </div>
    `)

    setPages(allPages)
  }, [author, works])

  const flipNext = useCallback(() => {
    if (currentPage < pages.length - 2 && !isFlipping) {
      setIsFlipping(true)
      setCurrentPage(prev => prev + 2)
      setTimeout(() => setIsFlipping(false), 500)
    }
  }, [currentPage, pages.length, isFlipping])

  const flipPrev = useCallback(() => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true)
      setCurrentPage(prev => prev - 2)
      setTimeout(() => setIsFlipping(false), 500)
    }
  }, [currentPage, isFlipping])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        flipNext()
      } else if (e.key === 'ArrowLeft') {
        flipPrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [flipNext, flipPrev])

  const leftPage = pages[currentPage] || ''
  const rightPage = pages[currentPage + 1] || ''

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 py-8">
      {/* Google Fonts for handwriting */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Kalam:wght@300;400;700&display=swap" 
        rel="stylesheet" 
      />
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <Link href="/" className="text-amber-400 hover:text-amber-300 text-sm inline-flex items-center gap-2">
          ← Back to Library
        </Link>
      </div>

      {/* Book Container */}
      <div className="flex justify-center">
        <div 
          ref={bookRef}
          className="book-wrapper relative"
          style={{ perspective: '2000px' }}
        >
          {/* Book */}
          <div className="book flex shadow-2xl" style={{ transformStyle: 'preserve-3d' }}>
            {/* Left Page */}
            <div 
              className="page left-page bg-amber-50 relative overflow-hidden rounded-l-sm"
              onClick={flipPrev}
              style={{ 
                width: '420px', 
                height: '560px',
                cursor: currentPage > 0 ? 'pointer' : 'default'
              }}
            >
              <div 
                className="page-content h-full overflow-hidden"
                dangerouslySetInnerHTML={{ __html: leftPage }}
              />
              {currentPage > 0 && (
                <div className="absolute bottom-4 left-4 text-amber-400/60 text-xs font-sans">
                  ← Previous
                </div>
              )}
              <div className="absolute bottom-4 right-4 text-amber-600/40 text-xs font-sans">
                {currentPage + 1}
              </div>
              {/* Page edge shadow */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
            </div>

            {/* Spine */}
            <div 
              className="spine bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900"
              style={{ width: '30px', height: '560px' }}
            />

            {/* Right Page */}
            <div 
              className="page right-page bg-amber-50 relative overflow-hidden rounded-r-sm"
              onClick={flipNext}
              style={{ 
                width: '420px', 
                height: '560px',
                cursor: currentPage < pages.length - 2 ? 'pointer' : 'default'
              }}
            >
              <div 
                className="page-content h-full overflow-hidden"
                dangerouslySetInnerHTML={{ __html: rightPage }}
              />
              {currentPage < pages.length - 2 && (
                <div className="absolute bottom-4 right-4 text-amber-400/60 text-xs font-sans">
                  Next →
                </div>
              )}
              <div className="absolute bottom-4 left-4 text-amber-600/40 text-xs font-sans">
                {currentPage + 2}
              </div>
              {/* Page edge shadow */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Navigation hint */}
          <div className="text-center mt-6 text-amber-200/50 text-sm">
            Click pages or use arrow keys to turn • Page {Math.floor(currentPage/2) + 1} of {Math.ceil(pages.length/2)}
          </div>
        </div>
      </div>

      {/* Page styles */}
      <style jsx global>{`
        .page-content {
          padding: 2rem 2.5rem;
          font-family: 'Kalam', cursive;
          color: #2c1810;
          line-height: 1.9;
        }

        .page-date-header {
          font-family: 'Caveat', cursive;
          font-size: 1.1rem;
          color: #78350f;
          text-align: right;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #d4a373;
          font-weight: 500;
        }

        .cover-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fef3c7 100%);
        }

        .cover-page h1 {
          font-size: 3rem;
          font-weight: 700;
          color: #78350f;
          margin-bottom: 0.5rem;
          font-family: 'Caveat', cursive;
        }

        .cover-page .subtitle {
          font-size: 1.4rem;
          color: #92400e;
          font-style: italic;
          margin-bottom: 2rem;
          font-family: 'Kalam', cursive;
        }

        .cover-page .author-full {
          font-size: 1.2rem;
          color: #a16207;
          margin-top: 3rem;
          font-family: 'Caveat', cursive;
        }

        .cover-ornament {
          width: 120px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #92400e, transparent);
          margin: 1rem 0;
        }

        .toc-page {
          padding: 2rem 2.5rem;
        }

        .toc-page h2 {
          font-size: 1.8rem;
          color: #78350f;
          margin-bottom: 1.5rem;
          text-align: center;
          font-family: 'Caveat', cursive;
          font-weight: 600;
        }

        .toc-list {
          list-style: none;
          padding: 0;
          margin: 0;
          font-family: 'Kalam', cursive;
        }

        .toc-list li {
          display: flex;
          align-items: baseline;
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }

        .toc-title {
          color: #2c1810;
        }

        .toc-dots {
          flex: 1;
          border-bottom: 1px dotted #d4a373;
          margin: 0 0.5rem 0.25rem;
        }

        .toc-page-num {
          color: #92400e;
          font-size: 0.9rem;
        }

        .bio-page {
          padding: 2rem 2.5rem;
        }

        .bio-page h2 {
          font-size: 1.6rem;
          color: #78350f;
          margin-bottom: 1rem;
          font-family: 'Caveat', cursive;
          font-weight: 600;
        }

        .bio-page p {
          font-size: 1.1rem;
          line-height: 1.9;
          color: #2c1810;
          font-family: 'Kalam', cursive;
        }

        .work-title-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          padding: 2rem;
        }

        .work-title-page .work-date {
          font-family: 'Caveat', cursive;
          font-size: 1.2rem;
          color: #92400e;
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .work-title-page h2 {
          font-size: 1.8rem;
          color: #78350f;
          margin-bottom: 1rem;
          font-family: 'Caveat', cursive;
          font-weight: 600;
          line-height: 1.3;
        }

        .work-type {
          font-size: 1rem;
          color: #92400e;
          text-transform: capitalize;
          margin-bottom: 1rem;
          font-family: 'Kalam', cursive;
        }

        .work-abstract {
          font-size: 1rem;
          color: #5c4033;
          font-style: italic;
          max-width: 320px;
          line-height: 1.7;
          font-family: 'Kalam', cursive;
        }

        .content-page {
          font-size: 1rem;
          line-height: 1.9;
        }

        .content-page h1, .content-page h2, .content-page h3 {
          color: #78350f;
          margin: 1rem 0 0.5rem;
          font-family: 'Caveat', cursive;
          font-weight: 600;
        }

        .content-page h1 { font-size: 1.6rem; }
        .content-page h2 { font-size: 1.4rem; }
        .content-page h3 { font-size: 1.2rem; }

        .content-page p {
          margin-bottom: 0.75rem;
          text-indent: 1.5em;
        }

        .content-page p:first-of-type {
          text-indent: 0;
        }

        .content-page blockquote {
          border-left: 3px solid #d4a373;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #5c4033;
          font-style: italic;
        }

        .content-page ul, .content-page ol {
          margin-left: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .content-page li {
          margin-bottom: 0.25rem;
        }

        .back-cover {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fef3c7 100%);
        }

        .back-cover .finis {
          font-size: 1.6rem;
          color: #92400e;
          font-style: italic;
          font-family: 'Caveat', cursive;
        }

        /* Ink effect for handwriting */
        .content-page, .bio-page p, .toc-list {
          text-shadow: 0.5px 0.5px 0 rgba(44, 24, 16, 0.1);
        }
      `}</style>
    </div>
  )
}

// Split markdown content into page-sized chunks
function splitContentIntoPages(markdown: string): string[] {
  const chunks = markdown.split(/\n\n+/)
  const pages: string[] = []
  let currentPage = ''
  const maxChars = 1000 // Slightly fewer chars per page for handwriting font (larger)

  chunks.forEach((chunk) => {
    if (currentPage.length + chunk.length > maxChars && currentPage.length > 0) {
      pages.push(currentPage.trim())
      currentPage = chunk
    } else {
      currentPage += '\n\n' + chunk
    }
  })

  if (currentPage.trim()) {
    pages.push(currentPage.trim())
  }

  return pages.length > 0 ? pages : ['']
}
