# Commonplace Design Document

**Digital Scholarly Library & Publication System**

Version: 1.0 (deployment-ready)  
Owner: Inquiry Institute  
Purpose: Living digital commonplace books, scholarly publishing, and author libraries with AI-native architecture

---

## 1. Vision

Commonplace is the institutional memory system of Inquiry Institute.

It functions simultaneously as:
- A living archive of essays, notes, fragments, and lectures
- A scholarly publishing platform (peer review, revisions, editorial decisions)
- A digital library of page-flip books per author
- A machine-readable knowledge graph for LLM agents
- A permanent, citable scholarly record

It replaces the idea of a "blog" or "CMS" with a knowledge-native publishing system.

---

## 2. Core Requirements

### 2.1 Functional

- Capture multiple content types (essays, notes, fragments, lectures, reviews)
- Rich cross-referencing between all content
- Formal editorial workflow:
  - submission
  - peer review
  - revision cycles
  - editorial decisions
  - scheduling
  - publication
- Page-flip "book" rendering per author
- Dynamic content delivery (no rebuilds)
- Public digital library + private editorial backend
- API-first architecture for LLM ingestion

### 2.2 Non-Functional

- Open-source core
- Self-hosted
- Horizontally scalable
- CDN-backed asset delivery
- Immutable scholarly record
- Versioned and auditable
- Citation-friendly
- AI-native

---

## 3. System Architecture

### 3.1 High-Level Architecture

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

## 4. Technology Stack

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

## 5. Content Model (Knowledge Graph)

### 5.1 Core Entities

#### persons

Faculty, authors, editors, reviewers

```
id (uuid)
name
slug
kind (faculty, editor, reviewer, external_author)
bio
public_domain (bool)
links (json)
```

#### works

Canonical scholarly units (books, essays, notes, lectures)

```
id (uuid)
type (essay, note, lecture, fragment_collection, review_article)
title
slug
abstract
content_md
status (draft, submitted, in_review, revisions_requested, revised, accepted, scheduled, published, archived)
visibility (private, members, public)
primary_author_id → persons
college
sephira
cover_image
flipbook_mode (html, images, pdf)
flipbook_manifest (json)
published_at
scheduled_for
created_by
created_at
updated_at
```

#### fragments

Quotes, marginalia, annotations

```
id
title
content
context_note
source_id → sources
created_by
timestamps
```

#### sources

Bibliographic record

```
id
type (book, paper, web, archival, interview)
title
authors
year
publisher
url
isbn
doi
notes
```

#### themes

Topics, traditions, eras, sephirot

```
id
name
description
```

### 5.2 Relationship Graph

#### work_relations (typed edges)

```
from_work_id → works
to_work_id → works
relation_type (references, responds_to, revises, expands, contradicts, influenced_by)
note
```

#### citations

```
work_id → works
source_id → sources
locator
quoted_text
citation_note
```

#### work_fragments

```
work_id → works
fragment_id → fragments
role (quote, epigraph, evidence, annotation)
locator
```

#### work_themes

```
work_id → works
theme_id → themes
```

---

## 6. Publication Framework

### 6.1 Workflow States

```
draft → submitted → in_review → revisions_requested → revised → in_review
                                    ↓
                                 accepted → scheduled → published → archived
                                    ↓
                                 rejected
```

### 6.2 Review System

#### review_rounds

```
id
work_id
round_number
editor_id
opened_at
closed_at
```

#### review_assignments

```
review_round_id
reviewer_id
status (invited, accepted, declined, submitted)
due_at
```

#### reviews

```
review_round_id
reviewer_id
recommendation (accept, minor_revisions, major_revisions, reject)
summary
detailed_comments
submitted_at
```

#### editor_decisions

```
review_round_id
decision (accept, revisions_requested, reject)
decision_letter
decided_at
```

### 6.3 Revision Tracking

#### change_requests

```
work_id
requested_by
severity (typo, clarity, citation, structure, major)
location_hint
request_text
status (open, resolved, wontfix)
resolved_at
```

Directus automatically tracks every edit via:
- revision history
- activity log
- user attribution

---

## 7. Page-Flip Digital Library

### 7.1 Library Structure

```
/authors
/authors/{authorSlug}
/authors/{authorSlug}/{workSlug}
```

Each author has:
- A bookshelf
- A collection of published works
- Each work rendered as a page-flip book

### 7.2 Flipbook Rendering

Each published work includes:

```json
flipbook_mode = "images"
flipbook_manifest = {
  "pageWidth": 900,
  "pageHeight": 1200,
  "pages": [
    {"n":1,"src":"https://cdn.inquiry.org/books/memory/p1.jpg"},
    {"n":2,"src":"https://cdn.inquiry.org/books/memory/p2.jpg"}
  ]
}
```

Rendered in frontend via StPageFlip (canvas mode).

### 7.3 Asset Pipeline

Publishing pipeline:
1. Work accepted
2. Layout engine renders PDF or HTML
3. Pages rendered to images
4. Uploaded to Supabase Storage / R2
5. Manifest generated
6. Stored in works.flipbook_manifest
7. Book appears instantly in library

---

## 8. Dynamic Delivery (No Rebuilds)

Frontend is a static JS app shell hosted on Pages.

All content is loaded dynamically:
- **Authors**: `GET /items/persons?filter[kind]=faculty`
- **Author bookshelf**: `GET /items/works?filter[status]=published&filter[primary_author_id]={id}`
- **Book reader**: `GET /items/works/{slug}`

Assets served from CDN.

No rebuild required on publish.

---

## 9. Permissions

| Role | Capabilities |
|------|-------------|
| Admin | Everything |
| Editor | Manage reviews, decisions |
| Reviewer | Review assigned works |
| Author | Draft, submit, revise |
| Copyeditor | Edit accepted works |
| Publisher | Schedule, publish |
| Public | Read published works only |

Permissions enforced by Directus role system.

---

## 10. Deployment Plan

### 10.1 Supabase

- Create project
- Enable extensions:
  - `uuid-ossp`
  - `pgcrypto`
  - `vector` (optional)
- Create storage bucket(s)

### 10.2 Directus (Docker)

- Deploy Directus container
- Connect to Supabase Postgres
- Configure admin account
- Configure CORS
- Configure storage

### 10.3 CMS Setup

- Create collections
- Define relationships
- Create roles
- Configure permissions
- Add dashboards

### 10.4 Frontend

- Deploy JS app shell
- Implement:
  - Author bookshelf
  - Book reader
  - Flipbook renderer
- Connect to Directus API

---

## 11. AI-Native Design (Future Layer)

Optional but designed-in:
- pgvector embeddings on works/fragments
- Citation-aware RAG
- Faculty agents querying Commonplace
- Influence graph reasoning
- Scholarly synthesis

Commonplace becomes the Institute's thinking substrate.

---

## 12. Institutional Outcomes

This system provides:

📚 A permanent scholarly record  
📖 Living author libraries  
🔗 Deep cross-referencing  
🧠 AI-readable canon  
🏛 Editorial legitimacy  
📜 Citation provenance  
🕯 Digital Alexandria

---

## Final Statement

This architecture gives Inquiry Institute something unprecedented:

**A living, reasoning, scholarly civilization — encoded in software.**

**Commonplace is not a CMS. It is an epistemological engine.**
