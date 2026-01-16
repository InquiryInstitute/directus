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
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_L5A4YuZm5vF4o1ubDln3Dw_uRqnGsLc',
  },
}

module.exports = nextConfig
