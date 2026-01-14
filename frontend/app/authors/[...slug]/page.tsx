import AuthorRedirect from './AuthorRedirect'

// For static export, we need to export generateStaticParams
// Return empty array - routes will be handled client-side via a different approach
export async function generateStaticParams() {
  return []
}

// Redirect to home - this route is deprecated in favor of /book/[...slug]
export default function AuthorWorkPage() {
  return <AuthorRedirect />
}
