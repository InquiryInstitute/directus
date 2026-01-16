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
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xougqdomkoisrxdnagcj.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvdWdxZG9ta29pc3J4ZG5hZ2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjIwMTIsImV4cCI6MjA4MTUzODAxMn0.eA1vXG6UVI1AjUOXN7q3gTlSyPoDByuVehOcKPjHmvs',
  },
}

module.exports = nextConfig
