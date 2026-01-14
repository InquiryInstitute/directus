import { notFound } from 'next/navigation'

// For static export, we need to export generateStaticParams
// Return empty array - routes will be handled client-side via a different approach
export async function generateStaticParams() {
  return []
}

// This page will redirect to a client-side route handler
export default function AuthorWorkPage() {
  // This will be handled by a client component
  notFound()
}
