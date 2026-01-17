/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for GitHub Pages
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true,
  // GitHub Pages base path (empty for custom domain)
  basePath: process.env.GITHUB_PAGES ? '/directus' : '',
  assetPrefix: process.env.GITHUB_PAGES ? '/directus' : '',
  // Environment variables
  env: {
    NEXT_PUBLIC_DIRECTUS_URL: process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://commonplace-directus-652016456291.us-central1.run.app',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pilmscrodlitdrygabvo.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpbG1zY3JvZGxpdGRyeWdhYnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTAyMTAsImV4cCI6MjA3NzkyNjIxMH0.BZxQiztlwtKjhL1Jjjqd0CnvfIbuwYHV0YL2s50cQiA',
  },
}

module.exports = nextConfig
