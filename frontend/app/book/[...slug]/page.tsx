import BookPageClient from './BookPageClient'

// Required for static export - for optional catch-all, return empty array
// This allows client-side routing for dynamic content
export async function generateStaticParams() {
  // Return empty array - routes will be handled client-side
  return []
}

export default function BookPage() {
  return <BookPageClient />
}
