import BookPageClient from './BookPageClient'

// Required for static export - return empty array for dynamic routes
export async function generateStaticParams() {
  return []
}

export default function BookPage() {
  return <BookPageClient />
}
