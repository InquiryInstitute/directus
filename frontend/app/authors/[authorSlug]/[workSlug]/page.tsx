import { redirect } from 'next/navigation'

// For static export, we need to export generateStaticParams
export async function generateStaticParams() {
  return []
}

// Redirect to /book route
export default function AuthorWorkPage() {
  redirect('/book')
}
