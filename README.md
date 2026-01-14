# Commonplace

**Digital Scholarly Library & Publication System**

Version: 1.0 (deployment-ready)  
Owner: Inquiry Institute  
Purpose: Living digital commonplace books, scholarly publishing, and author libraries with AI-native architecture

---

## Vision

Commonplace is the institutional memory system of Inquiry Institute.

It functions simultaneously as:
- A living archive of essays, notes, fragments, and lectures
- A scholarly publishing platform (peer review, revisions, editorial decisions)
- A digital library of page-flip books per author
- A machine-readable knowledge graph for LLM agents
- A permanent, citable scholarly record

It replaces the idea of a "blog" or "CMS" with a knowledge-native publishing system.

---

## Architecture

```
┌────────────────────────┐
│   Public Web Library   │
│  (Cloudflare Pages)   │
│  - Author bookshelf   │
│  - Page-flip reader   │
└──────────┬────────────┘
           │
           ▼
┌──────────────────────────┐
│     Directus API         │
│  - Content graph         │
│  - Publication workflow  │
│  - Permissions           │
│  - Editorial UI          │
└──────────┬───────────────┘
           │
           ▼
┌─────────────────────────────┐
│     Supabase Postgres       │
│  - Canonical database      │
│  - Relational graph        │
│  - Revisions + audit       │
└──────────┬─────────────────┘
           │
           ▼
┌──────────────────────────────┐
│     Supabase Storage / CDN   │
│  - Page images              │
│  - PDFs                    │
│  - Media assets            │
└──────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Database | Supabase Postgres |
| CMS / Knowledge Layer | Directus |
| File Storage | Supabase Storage or Cloudflare R2 |
| CDN | Cloudflare |
| Frontend | Next.js / Astro / SvelteKit |
| Flipbook | StPageFlip |
| Hosting | Cloudflare Pages |
| Auth (Editorial) | Directus native |
| Auth (Public later) | Supabase Auth |
| Vector Search (optional) | pgvector |
| AI Layer (future) | RAG pipeline |

---

## Quick Start

### 1. Database Setup (Supabase)

```bash
# Apply migrations
cd supabase
supabase migration up
```

### 2. Directus Setup (Docker)

```bash
# Start Directus
cd docker
docker-compose up -d
```

### 3. Directus Configuration

1. Access Directus admin: http://localhost:8055
2. Import schema from `directus/schema.yaml`
3. Configure roles and permissions
4. Set up storage adapters

### 4. Frontend Setup (Future)

```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
directus/
├── README.md                 # This file
├── DESIGN.md                 # Full design document
├── supabase/
│   ├── migrations/          # SQL schema migrations
│   └── seed/                # Seed data (optional)
├── docker/
│   ├── docker-compose.yml   # Directus + dependencies
│   ├── .env.example         # Environment variables
│   └── directus/
│       └── schema.yaml      # Directus schema export
├── frontend/                 # Public web library (future)
├── scripts/                  # Utility scripts
└── docs/                     # Additional documentation
```

---

## Content Model

### Core Entities

- **persons**: Faculty, authors, editors, reviewers
- **works**: Canonical scholarly units (books, essays, notes, lectures)
- **fragments**: Quotes, marginalia, annotations
- **sources**: Bibliographic records
- **themes**: Topics, traditions, eras, sephirot

### Relationships

- **work_relations**: Typed edges between works (references, responds_to, revises, etc.)
- **citations**: Work-to-source citations
- **work_fragments**: Work-to-fragment associations
- **work_themes**: Work-to-theme associations

See `DESIGN.md` for complete schema documentation.

---

## Publication Workflow

```
draft → submitted → in_review → revisions_requested → revised → in_review
                                    ↓
                                 accepted → scheduled → published → archived
                                    ↓
                                 rejected
```

### Review System

- **review_rounds**: Editorial review cycles
- **review_assignments**: Reviewer assignments
- **reviews**: Reviewer recommendations and comments
- **editor_decisions**: Editorial decisions (accept, revisions, reject)

---

## Page-Flip Digital Library

Each published work is rendered as a page-flip book using StPageFlip.

- **Library Structure**: `/authors/{authorSlug}/{workSlug}`
- **Flipbook Mode**: HTML, images, or PDF
- **Asset Pipeline**: PDF → Images → CDN → Manifest

---

## Deployment

See `docs/DEPLOYMENT.md` for complete deployment instructions.

### DNS Configuration

The system is designed to replace WordPress at `commonplace.inquiry.institute`.

**DNS Setup:**
- Point `commonplace.inquiry.institute` to the new infrastructure
- Update Route 53 records as needed

---

## Development

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Supabase CLI
- PostgreSQL client (optional)

### Environment Variables

Copy `.env.example` to `.env` and configure:

- Directus admin credentials
- Supabase connection string
- Storage adapter credentials
- API keys

---

## License

[Add license here]

---

## Support

For issues or questions, contact the Inquiry Institute technical team.

---

**Commonplace is not a CMS. It is an epistemological engine.**
