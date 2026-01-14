'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// For static export, we need to export generateStaticParams
// Return empty array - routes will be handled client-side via a different approach
export async function generateStaticParams() {
  return []
}

// Redirect to home - this route is deprecated in favor of /book/[...slug]
export default function AuthorWorkPage() {
  const router = useRouter()
  useEffect(() => {
    router.push('/')
  }, [router])
  return null
}
