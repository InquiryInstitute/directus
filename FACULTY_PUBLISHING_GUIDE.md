# Faculty Guide: Publishing to Commonplace

This guide will help you publish your work to Commonplace, the Inquiry Institute's digital scholarly library.

---

## Table of Contents

1. [Accessing Commonplace](#accessing-commonplace)
2. [Understanding Works](#understanding-works)
3. [Creating Your First Work](#creating-your-first-work)
4. [Work Types and Fields](#work-types-and-fields)
5. [Publishing Your Work](#publishing-your-work)
6. [Work Status and Visibility](#work-status-and-visibility)
7. [Linking Related Works](#linking-related-works)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Accessing Commonplace

### 1. Log In to Directus

**Admin Panel URL**: https://commonplace-directus-652016456291.us-central1.run.app/admin

1. Navigate to the URL above
2. Enter your email and password (provided by the Custodian)
3. You'll see the Directus admin interface with collections on the left sidebar

### 2. Verify Your Author Profile

Before publishing, ensure you have a profile in the **Persons** collection:

1. Click **Persons** in the left sidebar
2. Search for your name or email
3. Verify your profile has:
   - **Kind**: `faculty` (or `external_author` if you're a guest)
   - **Public Domain**: `true` (checked)
   - **Name**: Your full name
   - **Slug**: A URL-friendly version of your name (e.g., `daniel-mcshan`)

**If you don't have a profile**, contact the Custodian to create one for you.

---

## Understanding Works

A **Work** is the fundamental unit of content in Commonplace. It can be:
- An essay or article
- A lecture or presentation
- A research note
- A fragment collection
- A review article

Each work must:
- Have a unique **slug** (URL-friendly identifier)
- Be linked to an **author** (you)
- Have a **status** (draft, published, etc.)
- Have a **visibility** setting (private, members, public)

---

## Creating Your First Work

### Step 1: Navigate to Works

1. In the Directus sidebar, click **Works**
2. Click the **+** button (top right) to create a new work

### Step 2: Fill in Required Fields

#### Basic Information

- **Title** (required)
  - Enter the full title of your work
  - Example: "The Light of Inquiry: A Philosophical Exploration"

- **Slug** (required)
  - A URL-friendly version of your title
  - Use lowercase, hyphens instead of spaces
  - Example: `the-light-of-inquiry-philosophical-exploration`
  - **Important**: Must be unique across all works

- **Type** (required)
  - Select from dropdown:
    - `essay` - Standard essay or article
    - `note` - Short research note
    - `lecture` - Lecture or presentation
    - `fragment_collection` - Collection of quotes or fragments
    - `review_article` - Review or critique

- **Primary Author** (required)
  - Click the dropdown and select your name
  - If you don't appear, contact the Custodian

#### Content

- **Abstract**
  - A brief summary (1-3 paragraphs)
  - Used for previews and search results

- **Content (Markdown)**
  - The full body of your work
  - Write in **Markdown** format
  - Supports:
    - Headers (`#`, `##`, `###`)
    - **Bold** and *italic*
    - Links `[text](url)`
    - Lists (ordered and unordered)
    - Code blocks
    - Blockquotes
  - **Tip**: Write your content in a Markdown editor first, then paste here

#### Publication Settings

- **Status** (required)
  - Start with: `draft`
  - See [Work Status and Visibility](#work-status-and-visibility) for all options

- **Visibility** (required)
  - Start with: `private`
  - See [Work Status and Visibility](#work-status-and-visibility) for all options

### Step 3: Optional Fields

- **Cover Image**
  - URL to a cover image for your work
  - Must be publicly accessible
  - Recommended size: 1200x600px

- **College**
  - If applicable, the college or division

- **Sephira**
  - If applicable, the sephira classification

- **Published At**
  - Set the publication date (leave empty for "now")

- **Scheduled For**
  - If you want to schedule publication for a future date

### Step 4: Save Your Work

1. Click **Save** at the top right
2. Your work is now saved as a draft
3. You can edit it anytime by clicking on it in the Works list

---

## Work Types and Fields

### Work Types

| Type | Use Case | Example |
|------|----------|---------|
| `essay` | Standard scholarly essay or article | "On the Nature of Inquiry" |
| `note` | Short research note or observation | "Quick Thoughts on Kant" |
| `lecture` | Lecture transcript or presentation | "Introduction to Philosophy Lecture 1" |
| `fragment_collection` | Collection of quotes, fragments, or marginalia | "Heidegger Fragments" |
| `review_article` | Review or critique of another work | "Review: The Republic Revisited" |

### Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| **Title** | ✅ | Full title of the work |
| **Slug** | ✅ | URL-friendly identifier (must be unique) |
| **Type** | ✅ | Type of work (essay, note, lecture, etc.) |
| **Status** | ✅ | Publication status (draft, published, etc.) |
| **Visibility** | ✅ | Who can see this work (private, members, public) |
| **Primary Author** | ✅ | You (select from Persons) |
| **Abstract** | ❌ | Brief summary (recommended) |
| **Content (Markdown)** | ❌ | Full content in Markdown format |
| **Cover Image** | ❌ | URL to cover image |
| **College** | ❌ | College or division |
| **Sephira** | ❌ | Sephira classification |
| **Published At** | ❌ | Publication date (auto-set when status changes) |
| **Scheduled For** | ❌ | Schedule for future publication |

---

## Publishing Your Work

### Step-by-Step Publishing Process

#### 1. Draft Your Work

- Set **Status** to `draft`
- Set **Visibility** to `private`
- Write and edit your content
- Review carefully

#### 2. Submit for Review (Optional)

If your work needs editorial review:

1. Change **Status** to `submitted`
2. Add a note or contact the editor
3. Wait for feedback

#### 3. Publish Your Work

When ready to make your work public:

1. Ensure your work is complete and proofread
2. Set **Status** to `published`
3. Set **Visibility** to `public` (or `members` for member-only content)
4. Set **Published At** to today's date (or leave empty for "now")
5. Click **Save**

**Important**: For your work to appear on the public website:
- **Status** must be `published`
- **Visibility** must be `public`
- Your author profile must have `public_domain = true`

#### 4. Verify Publication

After publishing:

1. Visit the Inquiry Institute library page
2. Search for your name or work title
3. Confirm your work appears correctly

---

## Work Status and Visibility

### Status Values

| Status | Meaning | When to Use |
|--------|---------|-------------|
| `draft` | Work in progress | While writing and editing |
| `submitted` | Submitted for review | After submitting to editor |
| `in_review` | Currently being reviewed | Editor sets this |
| `revisions_requested` | Needs revisions | Editor requests changes |
| `revised` | Revisions completed | After making requested changes |
| `accepted` | Accepted for publication | Editor approves |
| `scheduled` | Scheduled for future | When scheduling publication |
| `published` | **Live and public** | When work is live |
| `archived` | Archived (removed from active) | When work is no longer active |
| `rejected` | Not accepted | If work is rejected |

### Visibility Values

| Visibility | Who Can See | When to Use |
|------------|-------------|-------------|
| `private` | Only you (and admins) | While drafting |
| `members` | Institute members only | For member-exclusive content |
| `public` | **Everyone** | For public-facing works |

### Recommended Workflow

1. **Draft Phase**
   - Status: `draft`
   - Visibility: `private`

2. **Review Phase** (if needed)
   - Status: `submitted` → `in_review` → `revisions_requested` → `revised`
   - Visibility: `private`

3. **Publication Phase**
   - Status: `published`
   - Visibility: `public`

---

## Linking Related Works

You can link your work to other works in Commonplace to create a knowledge graph.

### Creating Work Relations

1. Navigate to **Work Relations** in the sidebar
2. Click **+** to create a new relation
3. Fill in:
   - **From Work**: Your work
   - **To Work**: The related work
   - **Relation Type**: Select the type of relationship
     - `references` - You cite or reference this work
     - `responds_to` - You're responding to this work
     - `revises` - You're revising this work
     - `expands` - You're expanding on this work
     - `contradicts` - You're contradicting this work
     - `influenced_by` - This work influenced yours
   - **Note**: Optional explanation
4. Click **Save**

### Relation Types Explained

| Type | Use When |
|------|----------|
| `references` | You cite, quote, or mention another work |
| `responds_to` | You're directly responding to another work |
| `revises` | This is a revised version of another work |
| `expands` | You're expanding on ideas from another work |
| `contradicts` | You're presenting a counter-argument |
| `influenced_by` | Another work influenced your thinking |

---

## Best Practices

### Content Formatting

1. **Use Markdown**
   - Write in Markdown for best formatting
   - Test your Markdown in a preview tool first

2. **Structure Your Work**
   - Use clear headers (`##`, `###`)
   - Break long paragraphs
   - Use lists for clarity

3. **Abstract Writing**
   - Keep abstracts concise (1-3 paragraphs)
   - Summarize key points
   - Make it compelling

### Slug Creation

1. **Make it descriptive**
   - Good: `heidegger-being-and-time-analysis`
   - Bad: `essay-1` or `test`

2. **Keep it short**
   - Maximum 50-60 characters
   - Remove articles (a, an, the) if needed

3. **Use hyphens**
   - Separate words with hyphens
   - No spaces or underscores

### Publication Checklist

Before publishing, verify:

- ✅ Title is complete and accurate
- ✅ Slug is unique and descriptive
- ✅ Abstract summarizes the work
- ✅ Content is proofread
- ✅ Status is `published`
- ✅ Visibility is `public`
- ✅ Primary Author is correct
- ✅ Cover image (if used) loads correctly
- ✅ Any citations or links work

### Work Maintenance

1. **Update Regularly**
   - Fix typos immediately
   - Update links if they break
   - Revise content as needed

2. **Archive When Appropriate**
   - Set status to `archived` if work is outdated
   - Keep visibility as needed

3. **Link Related Works**
   - Build connections to other works
   - Create a knowledge graph

---

## Troubleshooting

### My Work Doesn't Appear on the Website

**Check:**
1. Status is `published` (not `draft`)
2. Visibility is `public` (not `private`)
3. Your author profile has `public_domain = true`
4. You've saved the work after making changes

**Still not showing?**
- Wait a few minutes (caching may delay)
- Contact the Custodian to verify your author profile

### I Can't See the Works Collection

**Possible causes:**
1. Your account doesn't have permissions
2. You need to refresh the page

**Solution:**
- Contact the Custodian to verify your account permissions

### I Can't Find My Author Profile

**Solution:**
- Contact the Custodian to create or update your profile
- Provide:
  - Your full name
  - Your email
  - Your preferred slug (URL-friendly name)

### Markdown Not Rendering Correctly

**Check:**
1. You're using proper Markdown syntax
2. Headers start with `#`
3. Lists have proper spacing
4. Links are formatted as `[text](url)`

**Test:**
- Use a Markdown preview tool before pasting
- Common editors: Typora, Mark Text, VS Code with Markdown preview

### Slug Already Exists

**Solution:**
- Make your slug more specific
- Add a date or version: `essay-title-2025` or `essay-title-v2`
- Add your name: `your-name-essay-title`

### I Need to Delete a Work

**Note**: Deleting is permanent. Consider archiving instead.

**To archive:**
1. Open your work
2. Set Status to `archived`
3. Save

**To delete:**
1. Open your work
2. Click the **⋮** menu (three dots)
3. Select **Delete**
4. Confirm deletion

---

## Getting Help

If you encounter issues or have questions:

1. **Check this guide** first
2. **Contact the Custodian**:
   - Email: custodian@inquiry.institute
   - For urgent issues, mention "Commonplace Publishing"

3. **Common Issues:**
   - Permission errors → Contact Custodian
   - Missing author profile → Contact Custodian
   - Publication not showing → Check status/visibility
   - Markdown issues → Test in a Markdown preview tool

---

## Quick Reference

### Publication Checklist
```
□ Title complete
□ Slug unique and descriptive
□ Type selected
□ Abstract written
□ Content in Markdown
□ Status = published
□ Visibility = public
□ Primary Author = You
□ Cover image (optional)
□ Saved and verified
```

### Common Status Transitions
```
Draft → Published (self-publish)
Draft → Submitted → In Review → Accepted → Published (with review)
Draft → Published → Archived (end of lifecycle)
```

### Visibility Guide
```
Private = Only you can see
Members = Members can see
Public = Everyone can see
```

---

**Last Updated**: January 2025  
**Version**: 1.0
