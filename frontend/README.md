# Commonplace Frontend

Public digital library frontend for Commonplace system. Renders page-flip books per author.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Flipbook**: StPageFlip
- **API**: Directus SDK

## Features

- Author bookshelf view
- Page-flip book reader
- Dynamic content loading (no rebuilds)
- CDN-backed assets

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:3000
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_DIRECTUS_URL=https://directus.inquiry.institute
NEXT_PUBLIC_DIRECTUS_TOKEN=your-public-read-token
```

## Structure

```
frontend/
├── app/                 # Next.js App Router
│   ├── authors/        # Author bookshelf pages
│   │   └── [slug]/     # Individual author page
│   └── books/          # Book reader pages
│       └── [slug]/     # Individual book page
├── components/          # React components
│   ├── BookReader/     # Page-flip book component
│   └── AuthorCard/     # Author card component
├── lib/                # Utilities
│   └── directus.ts     # Directus client
└── public/             # Static assets
```

## Deployment

Deploy to Cloudflare Pages:

1. Connect repository
2. Set build command: `npm run build`
3. Set output directory: `.next`
4. Add environment variables
5. Deploy!

## TODO

- [ ] Implement author bookshelf
- [ ] Implement page-flip book reader
- [ ] Add search functionality
- [ ] Add theme support
- [ ] Add responsive design
- [ ] Add loading states
- [ ] Add error handling
