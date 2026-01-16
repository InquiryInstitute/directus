# Faculty Guide: Sources and Citations in Commonplace

This guide explains how to add bibliographic sources and create citations in your Commonplace works.

---

## Table of Contents

1. [Overview](#overview)
2. [Adding Sources](#adding-sources)
3. [Creating Citations](#creating-citations)
4. [Using Fragments](#using-fragments)
5. [Source Types and Examples](#source-types-and-examples)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview

Commonplace has three related collections for managing references:

1. **Sources** - Bibliographic records (books, papers, websites, etc.)
2. **Citations** - Links between your works and sources
3. **Fragments** - Quotes or excerpts from sources

### The Citation Workflow

1. **Create a Source** - Add the bibliographic information
2. **Create a Citation** - Link your work to that source
3. **Add Fragments** (optional) - Quote specific passages

---

## Adding Sources

### Step 1: Navigate to Sources

1. In Directus sidebar, click **Sources**
2. Click the **+** button to create a new source

### Step 2: Select Source Type

Choose the appropriate type from the dropdown:

- `book` - Books, monographs, textbooks
- `paper` - Academic papers, articles, journal articles
- `web` - Websites, blog posts, online resources
- `archival` - Archival materials, manuscripts
- `interview` - Interviews, oral histories

### Step 3: Fill in Source Information

#### Required Fields

- **Type** (required)
  - Select from dropdown: `book`, `paper`, `web`, `archival`, `interview`

- **Title** (required)
  - Full title of the source
  - Example: "Being and Time"
  - Example: "The Structure of Scientific Revolutions"

#### Optional Fields (Fill as Available)

- **Authors** (array)
  - Click **+ Add Item** to add each author
  - Format: "Last, First" or "First Last"
  - Example: `["Heidegger, Martin", "Stambaugh, Joan (Translator)"]`
  - **Tip**: For multiple authors, add each as a separate item

- **Year**
  - Publication year
  - Example: `1927` or `1962`

- **Publisher**
  - Publishing house or journal name
  - Example: "Harper & Row"
  - Example: "Journal of Philosophy"

- **URL**
  - For web sources, the full URL
  - Example: `https://plato.stanford.edu/entries/heidegger/`

- **ISBN**
  - ISBN-10 or ISBN-13
  - Example: `9780061575594`

- **DOI**
  - Digital Object Identifier
  - Example: `10.1086/462662`

- **Notes**
  - Additional bibliographic notes
  - Edition information, translator, etc.

### Step 4: Save the Source

1. Click **Save** at the top right
2. Your source is now available for citation in any work

---

## Creating Citations

Citations link your work to sources, allowing you to reference them properly.

### Step 1: Navigate to Citations

1. In Directus sidebar, click **Citations**
2. Click the **+** button to create a new citation

### Step 2: Link Your Work to a Source

#### Required Fields

- **Work** (required)
  - Select your work from the dropdown
  - This is the work that cites the source

- **Source** (required)
  - Select the source you want to cite
  - Sources you've created will appear in the dropdown

#### Optional Fields

- **Locator**
  - Page number, section, or location reference
  - Examples:
    - `pp. 42-45`
    - `Chapter 3`
    - `Section 2.1`
    - `Paragraph 7`

- **Quoted Text**
  - If you're directly quoting from the source
  - Paste the exact quote here
  - Use the **Fragments** feature for longer quotes

- **Citation Note**
  - Additional context about this citation
  - Examples:
    - "Primary source for argument X"
    - "Contrasting viewpoint"
    - "Historical context"

### Step 3: Save the Citation

1. Click **Save**
2. Your work now has a citation link to this source

---

## Using Fragments

Fragments are quotes, excerpts, or annotations from sources. They're useful for:
- Pulling out key quotes
- Creating a collection of related passages
- Adding marginalia or annotations

### Step 1: Navigate to Fragments

1. In Directus sidebar, click **Fragments**
2. Click the **+** button to create a new fragment

### Step 2: Create a Fragment

#### Required Fields

- **Content** (required)
  - The actual quote or excerpt text
  - Example: "The question of the meaning of Being must be formulated."

#### Optional Fields

- **Title**
  - A short title or label for this fragment
  - Example: "The Question of Being"
  - Example: "Key quote from Chapter 1"

- **Source**
  - Link this fragment to a source (if applicable)
  - Select from the Sources dropdown

- **Context Note**
  - Additional context about where this appears
  - Example: "From the introduction, establishing the central question"
  - Example: "Heidegger's opening statement"

- **Created By**
  - Usually auto-filled with your user account

### Step 3: Link Fragments to Works (Optional)

You can associate fragments with works using **Work Fragments**:

1. Navigate to **Work Fragments** in the sidebar
2. Click **+** to create a new association
3. Select:
   - **Work** - Your work
   - **Fragment** - The fragment to associate
   - **Role** - How the fragment is used:
     - `quote` - Direct quote
     - `epigraph` - Opening quote
     - `evidence` - Supporting evidence
     - `annotation` - Marginal note or annotation

---

## Source Types and Examples

### Book Sources

**Example: Philosophy Book**

```
Type: book
Title: Being and Time
Authors: ["Heidegger, Martin", "Stambaugh, Joan (Translator)"]
Year: 2010
Publisher: State University of New York Press
ISBN: 9781438432762
Notes: Translation of Sein und Zeit (1927), Revised edition
```

**Example: Academic Monograph**

```
Type: book
Title: The Structure of Scientific Revolutions
Authors: ["Kuhn, Thomas S."]
Year: 2012
Publisher: University of Chicago Press
ISBN: 9780226458113
Notes: 50th Anniversary Edition
```

### Paper Sources

**Example: Journal Article**

```
Type: paper
Title: "The Problem of Induction"
Authors: ["Popper, Karl"]
Year: 1953
Publisher: British Journal for the Philosophy of Science
DOI: 10.1093/bjps/IV.14.95
```

**Example: Conference Paper**

```
Type: paper
Title: "Quantum Mechanics and Philosophy"
Authors: ["Bohr, Niels"]
Year: 1961
Publisher: Proceedings of the International Congress of Philosophy
Notes: Presented at the 13th International Congress of Philosophy
```

### Web Sources

**Example: Stanford Encyclopedia Entry**

```
Type: web
Title: "Martin Heidegger"
Authors: ["Wheeler, Michael"]
Year: 2020
Publisher: Stanford Encyclopedia of Philosophy
URL: https://plato.stanford.edu/entries/heidegger/
Notes: First published 2011, substantive revision 2020
```

**Example: Blog Post**

```
Type: web
Title: "Understanding Postmodernism"
Authors: ["Smith, Jane"]
Year: 2024
URL: https://example.com/postmodernism-explained
```

### Archival Sources

**Example: Manuscript**

```
Type: archival
Title: "Correspondence with Bertrand Russell, 1920-1925"
Authors: ["Wittgenstein, Ludwig"]
Year: 1920
Publisher: Cambridge University Library
Notes: Wren Library, MS Add. 8330
```

### Interview Sources

**Example: Oral History**

```
Type: interview
Title: "Interview with Noam Chomsky on Language and Mind"
Authors: ["Chomsky, Noam", "Interviewer: Johnson, Sarah"]
Year: 2023
Notes: Recorded at MIT, June 15, 2023
```

---

## Best Practices

### Source Entry

1. **Be Consistent**
   - Use consistent formatting for author names
   - Standard: "Last, First" for academic sources
   - Example: `["Heidegger, Martin"]` not `["Martin Heidegger"]`

2. **Include All Available Information**
   - ISBN/DOI when available
   - Publisher and year
   - Edition information in notes

3. **Check for Duplicates**
   - Search existing sources before creating new ones
   - Use existing sources when possible

4. **Use Appropriate Types**
   - Books → `book`
   - Journal articles → `paper`
   - Websites → `web`
   - Physical archives → `archival`
   - Oral histories → `interview`

### Citations

1. **Add Locators**
   - Include page numbers or sections when citing specific parts
   - Helps readers find the reference

2. **Use Quoted Text Sparingly**
   - For short quotes only
   - Use Fragments for longer quotes

3. **Add Notes When Helpful**
   - Explain why you're citing this source
   - Add context about how it supports your argument

### Fragments

1. **Preserve Original Wording**
   - Quote exactly as it appears in the source
   - Use square brackets `[sic]` or `[emphasis added]` for modifications

2. **Provide Context**
   - Use context notes to explain significance
   - Note where in the source it appears

3. **Link to Sources**
   - Always link fragments to their sources
   - This creates a knowledge graph

### Workflow Tips

1. **Build Your Library First**
   - Create sources as you read/research
   - Don't wait until you're writing

2. **Cite as You Write**
   - Create citations while writing
   - Easier than going back later

3. **Use Fragments for Key Quotes**
   - Pull out important passages as fragments
   - Link them to your works when relevant

---

## Troubleshooting

### I Can't Find a Source I Just Created

**Check:**
1. Did you save it? (Click Save button)
2. Try refreshing the page
3. Search for the source by title

**Still not found?**
- Contact the Custodian to check permissions

### The Source Dropdown is Empty

**Possible causes:**
1. No sources exist yet
2. Permission issue

**Solution:**
- Create a source first (see [Adding Sources](#adding-sources))
- If sources exist but don't appear, contact Custodian

### I Want to Edit a Source

**Steps:**
1. Navigate to **Sources**
2. Click on the source you want to edit
3. Make your changes
4. Click **Save**

**Note:** Editing a source affects all citations that reference it.

### How Do I Delete a Citation?

**Steps:**
1. Navigate to **Citations**
2. Click on the citation you want to delete
3. Click the **⋮** menu (three dots)
4. Select **Delete**
5. Confirm deletion

**Note:** This only removes the citation link, not the source itself.

### How Do I See All Citations for a Work?

**Option 1: In Directus**
1. Navigate to **Citations**
2. Filter by **Work** field
3. Select your work from the filter

**Option 2: View from Work**
1. Open your work
2. Look for a "Citations" or "Relations" section (if configured)

### Can I Import Citations from Zotero/Mendeley?

**Currently:** Manual entry only

**Future:** Batch import may be available. Contact Custodian for updates.

### How Are Citations Displayed on the Website?

Citations are linked in the database and can be displayed in:
- Bibliography sections
- In-text citation links
- Related sources sidebar

**Note:** Frontend display depends on how the website is configured. Contact the Custodian to see how citations appear on the public site.

---

## Quick Reference

### Source Checklist
```
□ Type selected
□ Title entered
□ Authors added (if applicable)
□ Year entered (if known)
□ Publisher/Journal (if applicable)
□ URL (for web sources)
□ ISBN or DOI (if available)
□ Notes added (if needed)
□ Saved
```

### Citation Checklist
```
□ Work selected
□ Source selected
□ Locator added (if citing specific pages)
□ Quoted text added (if short quote)
□ Citation note added (if helpful)
□ Saved
```

### Fragment Checklist
```
□ Content (quote) entered
□ Title added (optional but helpful)
□ Source linked (if applicable)
□ Context note added (if helpful)
□ Saved
□ Linked to work via Work Fragments (if needed)
```

---

## Getting Help

For issues with sources or citations:

1. **Check this guide** first
2. **Contact the Custodian**:
   - Email: custodian@inquiry.institute
   - Mention "Commonplace Sources/Citations"

3. **Common Issues:**
   - Missing sources → Check Sources collection exists
   - Can't create citations → Verify work and source are created
   - Permissions errors → Contact Custodian

---

**Last Updated**: January 2025  
**Version**: 1.0
