'use client'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  toc: TOCItem[]
}

export default function TableOfContents({ toc }: TableOfContentsProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav className="space-y-2">
      <h2 className="text-xl font-serif text-amber-900 mb-4">Table of Contents</h2>
      <ul className="space-y-1">
        {toc.map((item, index) => (
          <li
            key={index}
            className={`cursor-pointer hover:text-amber-600 transition-colors ${
              item.level === 1 ? 'font-semibold text-amber-900' :
              item.level === 2 ? 'ml-4 text-amber-700' :
              'ml-8 text-amber-600 text-sm'
            }`}
            onClick={() => scrollToSection(item.id)}
          >
            {item.text}
          </li>
        ))}
      </ul>
    </nav>
  )
}
