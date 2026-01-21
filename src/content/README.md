# Content Templates

This directory contains templates for creating new blog posts, projects, and book entries.

## Quick Start

### Creating a New Blog Post

1. Copy the template:
   ```bash
   cp src/content/blog/_template.md src/content/blog/my-new-post.md
   ```

2. Edit the frontmatter (the section between `---` at the top):
   - Update `title`, `description`, and `publishDate`
   - Add relevant `tags`
   - Set `draft: true` if you want to hide it from published posts

3. Write your content below the frontmatter using Markdown

### Creating a New Project

1. Copy the template:
   ```bash
   cp src/content/projects/_template.md src/content/projects/my-new-project.md
   ```

2. Fill in the frontmatter:
   - `title`: Project name
   - `description`: Brief description
   - `problem`: What problem does it solve?
   - `solution`: How did you solve it?
   - `demoUrl` and `githubUrl`: Optional links
   - `completedDate`: When was it completed?

3. Write your project narrative below

### Creating a New Book Entry

1. Copy the template:
   ```bash
   cp src/content/books/_template.md src/content/books/book-title.md
   ```

2. Fill in the book details in the frontmatter

3. Add your review and thoughts below

**Note:** Books are typically auto-generated from Goodreads, but you can manually add entries using this template.

## Frontmatter Schemas

### Blog Post Schema

```typescript
{
  title: string;              // Required
  description: string;         // Required
  publishDate: Date;          // Required
  updatedDate?: Date;          // Optional
  tags?: string[];            // Optional, defaults to []
  draft?: boolean;            // Optional, defaults to false
}
```

### Project Schema

```typescript
{
  title: string;              // Required
  description: string;        // Required
  problem: string;            // Required
  solution: string;           // Required
  demoUrl?: string;           // Optional (must be valid URL)
  githubUrl?: string;         // Optional (must be valid URL)
  completedDate: Date;        // Required
}
```

### Book Schema

```typescript
{
  title: string;              // Required
  author: string;             // Required
  coverUrl?: string;          // Optional (must be valid URL)
  isbn?: string;              // Optional
  source?: 'goodreads' | 'audible' | 'spotify' | 'physical' | 'manual';  // Defaults to 'manual'
  status?: 'currently-reading' | 'read' | 'want-to-read';  // Defaults to 'read'
  startedDate?: Date;         // Optional
  completedDate?: Date;       // Optional
  rating?: number;            // Optional (0-5)
  review?: string;            // Optional
  tags?: string[];            // Optional, defaults to []
}
```

## File Naming

- Use kebab-case for filenames: `my-blog-post.md`
- The filename (without extension) becomes the URL slug
- Example: `my-blog-post.md` → `/blog/my-blog-post`

## Draft Posts

Set `draft: true` in the frontmatter to hide a post from the published blog listing. Draft posts won't appear on the blog index page but can still be accessed directly via URL.

## Date Formats

Dates in frontmatter can be in several formats:
- `2026-01-20` (ISO format, recommended)
- `2026-01-20T10:30:00` (with time)
- `January 20, 2026` (human-readable)

## Tips

- Keep descriptions concise (150-200 characters for SEO)
- Use meaningful tags that help categorize your content
- Include `updatedDate` if you significantly revise a post
- For projects, focus on the problem-solution narrative
- For books, the review field in frontmatter is for brief summaries; use the body for detailed reviews
