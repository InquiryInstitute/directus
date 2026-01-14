import { redirect } from 'next/navigation'

// For static export, we need to export generateStaticParams
// Return empty array - routes will be handled client-side via a different approach
export async function generateStaticParams() {
  return []
}

// Redirect to /book route which handles dynamic content
export default function AuthorWorkPage() {
  redirect('/')
}
