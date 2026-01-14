import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Commonplace - Digital Scholarly Library',
  description: 'Living digital commonplace books and scholarly publishing from Inquiry Institute',
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
