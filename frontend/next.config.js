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
    NEXT_PUBLIC_DIRECTUS_URL: process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://directus.inquiry.institute',
  },
  // Allow dynamic routes in static export (they'll be client-side rendered)
  dynamicParams: true,
}

module.exports = nextConfig
