import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Commonplace - Notebooks of the Learned',
  description: 'Collected thoughts and reflections from scholars and thinkers at the Inquiry Institute',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
