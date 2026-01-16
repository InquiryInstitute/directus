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
  const [currentSpread, setCurrentSpread] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null)
  const [pages, setPages] = useState<string[]>([])

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
        <p class="subtitle">Collected Thoughts & Reflections</p>
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
      
      allPages.push(`
        <div class="work-title-page">
          <div class="work-date">${workDate}</div>
          <h2>${work.title}</h2>
          ${work.type ? `<p class="work-type">${work.type.replace('_', ' ')}</p>` : ''}
          ${work.abstract ? `<p class="work-abstract">${work.abstract}</p>` : ''}
        </div>
      `)

      if (work.content_md) {
        const contentPages = splitContentIntoPages(work.content_md)
        contentPages.forEach((pageContent) => {
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

    // Ensure even number of pages
    if (allPages.length % 2 !== 0) {
      allPages.push('<div class="empty-page"></div>')
    }

    setPages(allPages)
  }, [author, works])

  const totalSpreads = Math.ceil(pages.length / 2)

  const flipNext = useCallback(() => {
    if (currentSpread < totalSpreads - 1 && !isFlipping) {
      setFlipDirection('next')
      setIsFlipping(true)
      setTimeout(() => {
        setCurrentSpread(prev => prev + 1)
        setIsFlipping(false)
        setFlipDirection(null)
      }, 600)
    }
  }, [currentSpread, totalSpreads, isFlipping])

  const flipPrev = useCallback(() => {
    if (currentSpread > 0 && !isFlipping) {
      setFlipDirection('prev')
      setIsFlipping(true)
      setTimeout(() => {
        setCurrentSpread(prev => prev - 1)
        setIsFlipping(false)
        setFlipDirection(null)
      }, 600)
    }
  }, [currentSpread, isFlipping])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        flipNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        flipPrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [flipNext, flipPrev])

  const leftPageIndex = currentSpread * 2
  const rightPageIndex = currentSpread * 2 + 1
  const leftPage = pages[leftPageIndex] || ''
  const rightPage = pages[rightPageIndex] || ''
  
  // Pages for animation
  const nextLeftPage = pages[leftPageIndex + 2] || ''
  const prevRightPage = pages[rightPageIndex - 2] || ''

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 py-8 overflow-hidden">
      <link 
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Kalam:wght@300;400;700&display=swap" 
        rel="stylesheet" 
      />
      
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <Link href="/" className="text-amber-400 hover:text-amber-300 text-sm inline-flex items-center gap-2">
          ← Back to Library
        </Link>
      </div>

      <div className="flex justify-center items-center">
        <div className="book-container" style={{ perspective: '2000px' }}>
          <div className="book-wrapper relative flex">
            {/* Left Page (static) */}
            <div 
              className="page-static left-page"
              onClick={flipPrev}
              style={{ cursor: currentSpread > 0 ? 'pointer' : 'default' }}
            >
              <div className="page-inner" dangerouslySetInnerHTML={{ __html: leftPage }} />
              <div className="page-number left">{leftPageIndex + 1}</div>
              {currentSpread > 0 && <div className="page-hint left">← Click to turn</div>}
            </div>

            {/* Spine */}
            <div className="book-spine" />

            {/* Right Page (static) */}
            <div 
              className="page-static right-page"
              onClick={flipNext}
              style={{ cursor: currentSpread < totalSpreads - 1 ? 'pointer' : 'default' }}
            >
              <div className="page-inner" dangerouslySetInnerHTML={{ __html: rightPage }} />
              <div className="page-number right">{rightPageIndex + 1}</div>
              {currentSpread < totalSpreads - 1 && <div className="page-hint right">Click to turn →</div>}
            </div>

            {/* Flipping Page Overlay */}
            {isFlipping && flipDirection === 'next' && (
              <div className="flipping-page flip-forward">
                <div className="flip-page-front">
                  <div className="page-inner" dangerouslySetInnerHTML={{ __html: rightPage }} />
                </div>
                <div className="flip-page-back">
                  <div className="page-inner" dangerouslySetInnerHTML={{ __html: nextLeftPage }} />
                </div>
              </div>
            )}

            {isFlipping && flipDirection === 'prev' && (
              <div className="flipping-page flip-backward">
                <div className="flip-page-front">
                  <div className="page-inner" dangerouslySetInnerHTML={{ __html: prevRightPage }} />
                </div>
                <div className="flip-page-back">
                  <div className="page-inner" dangerouslySetInnerHTML={{ __html: leftPage }} />
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-6 text-amber-200/50 text-sm">
            Page {currentSpread + 1} of {totalSpreads} • Click pages or use arrow keys
          </div>
        </div>
      </div>

      <style jsx global>{`
        .book-container {
          user-select: none;
        }

        .book-wrapper {
          position: relative;
          transform-style: preserve-3d;
        }

        .page-static {
          width: 400px;
          height: 540px;
          background: linear-gradient(to right, #fef7ed 0%, #fefce8 50%, #fef7ed 100%);
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }

        .page-static.left-page {
          border-radius: 3px 0 0 3px;
          background: linear-gradient(to left, #f5f0e6 0%, #fefce8 20%, #fef7ed 100%);
          box-shadow: inset -10px 0 20px -10px rgba(0,0,0,0.1);
        }

        .page-static.right-page {
          border-radius: 0 3px 3px 0;
          background: linear-gradient(to right, #f5f0e6 0%, #fefce8 20%, #fef7ed 100%);
          box-shadow: inset 10px 0 20px -10px rgba(0,0,0,0.1);
        }

        .book-spine {
          width: 24px;
          height: 540px;
          background: linear-gradient(to right, 
            #78350f 0%, 
            #92400e 20%, 
            #a16207 50%, 
            #92400e 80%, 
            #78350f 100%
          );
          box-shadow: 0 0 15px rgba(0,0,0,0.4);
        }

        .page-inner {
          padding: 2rem 2.5rem;
          height: 100%;
          overflow: hidden;
          font-family: 'Kalam', cursive;
          color: #2c1810;
          line-height: 1.8;
          font-size: 0.95rem;
        }

        .page-number {
          position: absolute;
          bottom: 1rem;
          font-family: 'Caveat', cursive;
          font-size: 0.9rem;
          color: #92400e;
        }

        .page-number.left { right: 1.5rem; }
        .page-number.right { left: 1.5rem; }

        .page-hint {
          position: absolute;
          bottom: 1rem;
          font-family: sans-serif;
          font-size: 0.7rem;
          color: #d4a373;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .page-hint.left { left: 1rem; }
        .page-hint.right { right: 1rem; }

        .page-static:hover .page-hint {
          opacity: 1;
        }

        /* Flipping animation */
        .flipping-page {
          position: absolute;
          width: 400px;
          height: 540px;
          transform-style: preserve-3d;
          transform-origin: left center;
          z-index: 10;
        }

        .flipping-page.flip-forward {
          left: 424px;
          animation: flipForward 0.6s ease-in-out forwards;
        }

        .flipping-page.flip-backward {
          left: 0;
          transform-origin: right center;
          animation: flipBackward 0.6s ease-in-out forwards;
        }

        .flip-page-front,
        .flip-page-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          background: linear-gradient(to right, #fef7ed 0%, #fefce8 50%, #fef7ed 100%);
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          overflow: hidden;
        }

        .flip-page-back {
          transform: rotateY(180deg);
        }

        @keyframes flipForward {
          0% {
            transform: rotateY(0deg);
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
          }
          50% {
            box-shadow: -20px 0 40px rgba(0,0,0,0.3);
          }
          100% {
            transform: rotateY(-180deg);
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
          }
        }

        @keyframes flipBackward {
          0% {
            transform: rotateY(0deg);
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
          }
          50% {
            box-shadow: 20px 0 40px rgba(0,0,0,0.3);
          }
          100% {
            transform: rotateY(180deg);
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
          }
        }

        /* Page content styles */
        .page-date-header {
          font-family: 'Caveat', cursive;
          font-size: 1.1rem;
          color: #78350f;
          text-align: right;
          margin-bottom: 0.75rem;
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
          padding: 2rem;
        }

        .cover-page h1 {
          font-size: 2.8rem;
          font-weight: 700;
          color: #78350f;
          margin-bottom: 0.5rem;
          font-family: 'Caveat', cursive;
        }

        .cover-page .subtitle {
          font-size: 1.3rem;
          color: #92400e;
          font-style: italic;
          margin-bottom: 2rem;
          font-family: 'Kalam', cursive;
        }

        .cover-page .author-full {
          font-size: 1.1rem;
          color: #a16207;
          margin-top: 3rem;
          font-family: 'Caveat', cursive;
        }

        .cover-ornament {
          width: 100px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #92400e, transparent);
          margin: 1rem 0;
        }

        .toc-page h2 {
          font-size: 1.6rem;
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
        }

        .toc-list li {
          display: flex;
          align-items: baseline;
          margin-bottom: 0.6rem;
          font-size: 0.95rem;
        }

        .toc-title { color: #2c1810; }

        .toc-dots {
          flex: 1;
          border-bottom: 1px dotted #d4a373;
          margin: 0 0.5rem 0.25rem;
        }

        .toc-page-num {
          color: #92400e;
          font-size: 0.85rem;
        }

        .bio-page h2 {
          font-size: 1.5rem;
          color: #78350f;
          margin-bottom: 1rem;
          font-family: 'Caveat', cursive;
          font-weight: 600;
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
          font-size: 1.1rem;
          color: #92400e;
          margin-bottom: 1.5rem;
        }

        .work-title-page h2 {
          font-size: 1.6rem;
          color: #78350f;
          margin-bottom: 1rem;
          font-family: 'Caveat', cursive;
          font-weight: 600;
          line-height: 1.3;
        }

        .work-type {
          font-size: 0.9rem;
          color: #92400e;
          text-transform: capitalize;
          margin-bottom: 1rem;
        }

        .work-abstract {
          font-size: 0.9rem;
          color: #5c4033;
          font-style: italic;
          max-width: 300px;
          line-height: 1.6;
        }

        .content-page h1, .content-page h2, .content-page h3 {
          color: #78350f;
          margin: 0.75rem 0 0.5rem;
          font-family: 'Caveat', cursive;
          font-weight: 600;
        }

        .content-page h1 { font-size: 1.5rem; }
        .content-page h2 { font-size: 1.3rem; }
        .content-page h3 { font-size: 1.1rem; }

        .content-page p {
          margin-bottom: 0.6rem;
          text-indent: 1.5em;
        }

        .content-page p:first-of-type {
          text-indent: 0;
        }

        .content-page blockquote {
          border-left: 3px solid #d4a373;
          padding-left: 1rem;
          margin: 0.75rem 0;
          color: #5c4033;
          font-style: italic;
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
          font-size: 1.5rem;
          color: #92400e;
          font-style: italic;
          font-family: 'Caveat', cursive;
        }

        .empty-page {
          height: 100%;
          background: #fefce8;
        }
      `}</style>
    </div>
  )
}

function splitContentIntoPages(markdown: string): string[] {
  const chunks = markdown.split(/\n\n+/)
  const pages: string[] = []
  let currentPage = ''
  const maxChars = 900

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
