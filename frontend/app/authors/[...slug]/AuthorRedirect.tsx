'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Client component for redirect
export default function AuthorRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.push('/')
  }, [router])
  return null
}
