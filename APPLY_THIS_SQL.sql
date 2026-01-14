-- ============================================================================
-- COMMONPLACE: Digital Scholarly Library & Publication System
-- ============================================================================
-- Copy this entire file and paste into Supabase SQL Editor
-- https://supabase.com/dashboard/project/xougqdomkoisrxdnagcj/sql/new
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TYPES
-- ============================================================================

-- Person kinds
DO $$ BEGIN
  CREATE TYPE person_kind AS ENUM ('faculty', 'editor', 'reviewer', 'external_author');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Work types
DO $$ BEGIN
  CREATE TYPE work_type AS ENUM ('essay', 'note', 'lecture', 'fragment_collection', 'review_article');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Work status
DO $$ BEGIN
  CREATE TYPE work_status AS ENUM (
    'draft',
    'submitted',
    'in_review',
    'revisions_requested',
    'revised',
    'accepted',
    'scheduled',
    'published',
    'archived',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Work visibility
DO $$ BEGIN
  CREATE TYPE work_visibility AS ENUM ('private', 'members', 'public');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Flipbook modes
DO $$ BEGIN
  CREATE TYPE flipbook_mode AS ENUM ('html', 'images', 'pdf');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Source types
DO $$ BEGIN
  CREATE TYPE source_type AS ENUM ('book', 'paper', 'web', 'archival', 'interview');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Relation types
DO $$ BEGIN
  CREATE TYPE relation_type AS ENUM (
    'references',
    'responds_to',
    'revises',
    'expands',
    'contradicts',
    'influenced_by'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Fragment roles
DO $$ BEGIN
  CREATE TYPE fragment_role AS ENUM ('quote', 'epigraph', 'evidence', 'annotation');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Review recommendation
DO $$ BEGIN
  CREATE TYPE review_recommendation AS ENUM (
    'accept',
    'minor_revisions',
    'major_revisions',
    'reject'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Decision types
DO $$ BEGIN
  CREATE TYPE decision_type AS ENUM ('accept', 'revisions_requested', 'reject');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Change request severity
DO $$ BEGIN
  CREATE TYPE change_severity AS ENUM ('typo', 'clarity', 'citation', 'structure', 'major');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Review assignment status
DO $$ BEGIN
  CREATE TYPE review_assignment_status AS ENUM ('invited', 'accepted', 'declined', 'submitted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Change request status
DO $$ BEGIN
  CREATE TYPE change_request_status AS ENUM ('open', 'resolved', 'wontfix');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- CORE ENTITIES
-- ============================================================================

-- persons: Faculty, authors, editors, reviewers
CREATE TABLE IF NOT EXISTS public.persons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  kind person_kind NOT NULL,
  bio text,
  public_domain boolean DEFAULT false,
  links jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_persons_slug ON public.persons(slug);
CREATE INDEX IF NOT EXISTS idx_persons_kind ON public.persons(kind);

-- works: Canonical scholarly units
CREATE TABLE IF NOT EXISTS public.works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type work_type NOT NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  abstract text,
  content_md text,
  status work_status NOT NULL DEFAULT 'draft',
  visibility work_visibility NOT NULL DEFAULT 'private',
  primary_author_id uuid REFERENCES public.persons(id) ON DELETE SET NULL,
  college text,
  sephira text,
  cover_image text,
  flipbook_mode flipbook_mode,
  flipbook_manifest jsonb,
  published_at timestamptz,
  scheduled_for timestamptz,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_works_slug ON public.works(slug);
CREATE INDEX IF NOT EXISTS idx_works_status ON public.works(status);
CREATE INDEX IF NOT EXISTS idx_works_author ON public.works(primary_author_id);
CREATE INDEX IF NOT EXISTS idx_works_published ON public.works(published_at) WHERE status = 'published';

-- sources: Bibliographic records
CREATE TABLE IF NOT EXISTS public.sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type source_type NOT NULL,
  title text NOT NULL,
  authors text[],
  year integer,
  publisher text,
  url text,
  isbn text,
  doi text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sources_type ON public.sources(type);
CREATE INDEX IF NOT EXISTS idx_sources_doi ON public.sources(doi) WHERE doi IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sources_isbn ON public.sources(isbn) WHERE isbn IS NOT NULL;

-- fragments: Quotes, marginalia, annotations
CREATE TABLE IF NOT EXISTS public.fragments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  content text NOT NULL,
  context_note text,
  source_id uuid REFERENCES public.sources(id) ON DELETE SET NULL,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fragments_source ON public.fragments(source_id);

-- themes: Topics, traditions, eras, sephirot
CREATE TABLE IF NOT EXISTS public.themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_themes_name ON public.themes(name);

-- ============================================================================
-- RELATIONSHIP GRAPH
-- ============================================================================

-- work_relations: Typed edges between works
CREATE TABLE IF NOT EXISTS public.work_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_work_id uuid NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  to_work_id uuid NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  relation_type relation_type NOT NULL,
  note text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(from_work_id, to_work_id, relation_type)
);

CREATE INDEX IF NOT EXISTS idx_work_relations_from ON public.work_relations(from_work_id);
CREATE INDEX IF NOT EXISTS idx_work_relations_to ON public.work_relations(to_work_id);
CREATE INDEX IF NOT EXISTS idx_work_relations_type ON public.work_relations(relation_type);

-- citations: Work-to-source citations
CREATE TABLE IF NOT EXISTS public.citations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id uuid NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  locator text,
  quoted_text text,
  citation_note text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_citations_work ON public.citations(work_id);
CREATE INDEX IF NOT EXISTS idx_citations_source ON public.citations(source_id);

-- work_fragments: Work-to-fragment associations
CREATE TABLE IF NOT EXISTS public.work_fragments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id uuid NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  fragment_id uuid NOT NULL REFERENCES public.fragments(id) ON DELETE CASCADE,
  role fragment_role NOT NULL,
  locator text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_work_fragments_work ON public.work_fragments(work_id);
CREATE INDEX IF NOT EXISTS idx_work_fragments_fragment ON public.work_fragments(fragment_id);

-- work_themes: Work-to-theme associations
CREATE TABLE IF NOT EXISTS public.work_themes (
  work_id uuid NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  theme_id uuid NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (work_id, theme_id)
);

CREATE INDEX IF NOT EXISTS idx_work_themes_work ON public.work_themes(work_id);
CREATE INDEX IF NOT EXISTS idx_work_themes_theme ON public.work_themes(theme_id);

-- ============================================================================
-- PUBLICATION WORKFLOW
-- ============================================================================

-- review_rounds: Editorial review cycles
CREATE TABLE IF NOT EXISTS public.review_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id uuid NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  round_number integer NOT NULL DEFAULT 1,
  editor_id uuid REFERENCES public.persons(id) ON DELETE SET NULL,
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_rounds_work ON public.review_rounds(work_id);
CREATE INDEX IF NOT EXISTS idx_review_rounds_editor ON public.review_rounds(editor_id);

-- review_assignments: Reviewer assignments
CREATE TABLE IF NOT EXISTS public.review_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_round_id uuid NOT NULL REFERENCES public.review_rounds(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  status review_assignment_status NOT NULL DEFAULT 'invited',
  due_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_assignments_round ON public.review_assignments(review_round_id);
CREATE INDEX IF NOT EXISTS idx_review_assignments_reviewer ON public.review_assignments(reviewer_id);

-- reviews: Reviewer recommendations and comments
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_round_id uuid NOT NULL REFERENCES public.review_rounds(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  recommendation review_recommendation NOT NULL,
  summary text,
  detailed_comments text,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_round ON public.reviews(review_round_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON public.reviews(reviewer_id);

-- editor_decisions: Editorial decisions
CREATE TABLE IF NOT EXISTS public.editor_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_round_id uuid NOT NULL REFERENCES public.review_rounds(id) ON DELETE CASCADE,
  decision decision_type NOT NULL,
  decision_letter text,
  decided_at timestamptz DEFAULT now(),
  decided_by uuid REFERENCES public.persons(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_editor_decisions_round ON public.editor_decisions(review_round_id);

-- change_requests: Revision tracking
CREATE TABLE IF NOT EXISTS public.change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id uuid NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  requested_by uuid REFERENCES public.persons(id) ON DELETE SET NULL,
  severity change_severity NOT NULL,
  location_hint text,
  request_text text NOT NULL,
  status change_request_status NOT NULL DEFAULT 'open',
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_change_requests_work ON public.change_requests(work_id);
CREATE INDEX IF NOT EXISTS idx_change_requests_status ON public.change_requests(status);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.persons IS 'Faculty, authors, editors, reviewers in the Commonplace system';
COMMENT ON TABLE public.works IS 'Canonical scholarly units: essays, notes, lectures, fragments, reviews';
COMMENT ON TABLE public.sources IS 'Bibliographic records for citations';
COMMENT ON TABLE public.fragments IS 'Quotes, marginalia, annotations from sources';
COMMENT ON TABLE public.themes IS 'Topics, traditions, eras, sephirot for categorizing works';
COMMENT ON TABLE public.work_relations IS 'Typed relationships between works (references, responds_to, etc.)';
COMMENT ON TABLE public.citations IS 'Work-to-source citations with locators and quotes';
COMMENT ON TABLE public.work_fragments IS 'Associations between works and fragments';
COMMENT ON TABLE public.work_themes IS 'Theme associations for works';
COMMENT ON TABLE public.review_rounds IS 'Editorial review cycles for works';
COMMENT ON TABLE public.review_assignments IS 'Reviewer assignments for review rounds';
COMMENT ON TABLE public.reviews IS 'Reviewer recommendations and comments';
COMMENT ON TABLE public.editor_decisions IS 'Editorial decisions (accept, revisions, reject)';
COMMENT ON TABLE public.change_requests IS 'Revision tracking: change requests from reviewers/editors';

-- ============================================================================
-- DONE! 
-- ============================================================================
-- All Commonplace tables have been created successfully.
-- Next: Configure Directus to use these tables.
-- ============================================================================
