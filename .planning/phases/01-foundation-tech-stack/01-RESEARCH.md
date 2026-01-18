# Phase 1: Foundation & Tech Stack - Research

**Researched:** 2026-01-18
**Domain:** Static site generators for content-focused blog/portfolio sites
**Confidence:** HIGH

<research_summary>
## Summary

Researched the modern static site generator ecosystem for building a professional blog and portfolio platform optimized for writing experience. The landscape in 2026 has three main contenders: Astro (content-first with Islands Architecture), Next.js (flexible React framework with SSG), and Hugo (pure speed with Go).

For a blog prioritizing "effortless writing experience," Astro emerges as the strongest choice. It combines file-based markdown/MDX content with type-safe Content Collections, Vite-powered instant hot reload, and exceptional performance. Astro 5.0's Content Layer API (released late 2025) brings 5x faster builds and supports loading content from anywhere (local files, APIs, headless CMS) while maintaining simplicity.

**Primary recommendation:** Use Astro with Content Collections for file-based content management, deploy to Vercel for edge performance, and use MDX sparingly (Markdown for most posts, MDX only when interactive components needed).

</research_summary>

<standard_stack>
## Standard Stack

The established technologies for content-focused static sites in 2026:

### Core Framework Options

| Framework | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| Astro | 5.x | Content-first static site generator | Islands Architecture ships minimal JS, 5x faster builds with Content Layer API, excellent DX with Vite HMR |
| Next.js | 15.x | React framework with SSG/SSR/ISR | Most flexible, enterprise-grade, best for complex interactive sites, excellent Vercel integration |
| Hugo | 0.135+ | Go-based SSG | Fastest builds (thousands of pages), single binary, minimal JS complexity |

### Content Management

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Astro Content Collections | Built-in (5.0+) | Type-safe content with Zod validation | File-based content with schema validation (recommended) |
| MDX | 3.x | Markdown with JSX components | When you need interactive React components in content (use sparingly) |
| Contentlayer | 0.3.x | Type-safe content SDK | Next.js projects needing content validation |

### Supporting Tools

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @astrojs/sitemap | Latest | Automatic sitemap generation | SEO (essential) |
| astro-robots-txt | Latest | Generate robots.txt | SEO crawl control |
| astro-seo-schema | Latest | Structured data / JSON-LD | Rich snippets, enhanced SEO |
| astro-seo | Latest | Meta tags helper | Simplified SEO metadata management |

### Deployment Platforms

| Platform | Strengths | Best For |
|----------|-----------|----------|
| Vercel | Edge network, Next.js optimization, preview deploys | Next.js or Astro, developer experience priority |
| Netlify | User-friendly, one-click deploys, great DX | General static sites, ease of use |
| Cloudflare Pages | Unlimited bandwidth, fastest edge, global CDN | Performance-critical, high traffic |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Astro | Next.js | Next.js if you need heavy client-side interactivity or already have React expertise |
| Astro | Hugo | Hugo if build speed is critical (1000s of pages) and you don't need JS interactivity |
| MDX everywhere | Markdown | Use Markdown by default—MDX only when truly needed (better performance, simpler authoring) |
| Headless CMS | File-based content | Headless CMS if non-technical editors need UI, but adds complexity vs file-based |

**Installation (Astro):**
```bash
npm create astro@latest
# Choose: Blog template
# TypeScript: Yes (for Content Collections)
# Install dependencies: Yes

# Add SEO packages
npm install @astrojs/sitemap astro-seo
```

**Installation (Next.js):**
```bash
npx create-next-app@latest
# Choose: App Router, TypeScript
npm install contentlayer next-contentlayer
```

</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure (Astro)

```
src/
├── content/
│   ├── blog/              # Blog posts (markdown/MDX)
│   ├── projects/          # Project case studies
│   └── config.ts          # Content Collections schema
├── components/
│   ├── BlogPost.astro     # Blog post layout
│   ├── ProjectCard.astro  # Project showcase
│   └── SEO.astro          # Meta tags component
├── layouts/
│   └── BaseLayout.astro   # Site-wide layout
├── pages/
│   ├── index.astro        # Homepage
│   ├── blog/
│   │   ├── index.astro    # Blog listing
│   │   └── [slug].astro   # Blog post page
│   └── projects/
│       ├── index.astro    # Projects listing
│       └── [slug].astro   # Project detail
└── styles/
    └── global.css         # Times New Roman typography
```

### Pattern 1: Type-Safe Content Collections (Astro 5.0)

**What:** Schema-based content validation with automatic TypeScript types
**When to use:** All file-based content (blog posts, projects)
**Example:**

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders'; // Astro 5.0 loader

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    problem: z.string(),
    solution: z.string(),
    demoUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
    completedDate: z.date(),
  }),
});

export const collections = { blog, projects };
```

### Pattern 2: Static Page Generation with Content

**What:** Generate static pages from content collections
**When to use:** Blog posts, project pages
**Example:**

```typescript
// src/pages/blog/[slug].astro
---
import { getCollection } from 'astro:content';
import BlogLayout from '../../layouts/BlogLayout.astro';

export async function getStaticPaths() {
  const blogPosts = await getCollection('blog', ({ data }) => {
    return data.draft !== true; // Filter out drafts
  });

  return blogPosts.map(post => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<BlogLayout title={post.data.title} description={post.data.description}>
  <article>
    <h1>{post.data.title}</h1>
    <time datetime={post.data.publishDate.toISOString()}>
      {post.data.publishDate.toLocaleDateString()}
    </time>
    <Content />
  </article>
</BlogLayout>
```

### Pattern 3: SEO Optimization

**What:** Comprehensive meta tags, structured data, sitemap
**When to use:** Every page (essential for professional credibility)
**Example:**

```typescript
// src/components/SEO.astro
---
import { SEO } from 'astro-seo';

interface Props {
  title: string;
  description: string;
  image?: string;
  article?: boolean;
  publishDate?: Date;
}

const { title, description, image, article, publishDate } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<SEO
  title={title}
  description={description}
  canonical={canonicalURL.toString()}
  openGraph={{
    basic: {
      title: title,
      type: article ? 'article' : 'website',
      image: image || '/og-default.png',
    },
    article: article ? {
      publishedTime: publishDate?.toISOString(),
    } : undefined,
  }}
  twitter={{
    card: 'summary_large_image',
  }}
/>
```

### Pattern 4: Markdown for Content, MDX Only When Needed

**What:** Use plain Markdown by default, MDX only for interactive components
**When to use:** Most blog posts = Markdown, special interactive posts = MDX
**Example:**

```markdown
<!-- blog/standard-post.md - Plain Markdown (most posts) -->
---
title: "My Blog Post"
description: "A great post"
publishDate: 2026-01-18
---

# Regular markdown post

This is **bold** and this is *italic*.

- List item 1
- List item 2
```

```mdx
<!-- blog/interactive-post.mdx - MDX (only when needed) -->
---
title: "Interactive Demo Post"
description: "Post with interactive component"
publishDate: 2026-01-18
---

import InteractiveDemo from '../../components/InteractiveDemo.jsx';

# Post with interactive element

Regular markdown content here.

<InteractiveDemo />

More markdown content.
```

### Anti-Patterns to Avoid

- **Using MDX for everything:** MDX adds complexity and JS bundle size. Use Markdown unless you need components. Most blog posts don't need interactivity.
- **Over-complicating content management:** Resist adding a headless CMS initially. File-based content with Content Collections provides type safety without external dependencies.
- **Skipping Content Collections schema:** Without schema validation, you'll have runtime errors from missing frontmatter fields. Always define schemas.
- **Not using static export:** For pure static blogs, avoid dynamic rendering. Pre-render everything at build time for maximum performance.
- **Ignoring Core Web Vitals:** Performance is a ranking factor. Optimize images, minimize JS, use Astro's built-in optimizations.

</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Content validation | Custom frontmatter parser | Astro Content Collections + Zod | Type safety, build-time errors, auto-complete in editor |
| Sitemap generation | Manual XML generation | @astrojs/sitemap | Automatic, handles lastmod, changefreq, priority correctly |
| SEO meta tags | Manual `<meta>` tags | astro-seo package | Handles OpenGraph, Twitter cards, canonical URLs properly |
| Image optimization | Manual resize/compression | Astro Image component | Automatic WebP/AVIF, responsive images, lazy loading |
| Reading time calculation | Custom word counting | remark-reading-time plugin | Handles edge cases, accurate WPM calculations |
| Syntax highlighting | Custom code formatter | Shiki (built into Astro) | Beautiful syntax highlighting, multiple themes |
| RSS feed | Manual XML generation | @astrojs/rss | Proper RSS 2.0 format, handles special characters |

**Key insight:** The 2026 static site ecosystem is mature. Astro Content Collections eliminated entire categories of bugs from content workflows. Using these tools isn't "bloat"—it's avoiding reinventing solved problems. Custom solutions for content validation, image optimization, or SEO will have edge cases you haven't considered.

</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: MDX Performance Tax

**What goes wrong:** Using MDX for all content significantly increases JavaScript bundle size and build times
**Why it happens:** MDX requires runtime JSX compilation even for static content
**How to avoid:** Default to Markdown (.md), only use MDX (.mdx) when you genuinely need React components in content
**Warning signs:** Large bundle sizes (>100KB initial JS), slow page transitions, content pages taking >2s to interactive

### Pitfall 2: Missing Content Collection Schema Validation

**What goes wrong:** Typos in frontmatter fields cause runtime errors in production
**Why it happens:** Without schema validation, TypeScript can't catch missing or misspelled fields
**How to avoid:** Always define Zod schemas for Content Collections—get build-time errors instead of runtime failures
**Warning signs:** "Cannot read property of undefined" errors on deployed site, missing blog post titles or dates

### Pitfall 3: Not Optimizing Images

**What goes wrong:** Large image files kill page load performance and SEO rankings
**Why it happens:** Using raw images without optimization, not leveraging modern formats (WebP/AVIF)
**How to avoid:** Use Astro's `<Image>` component for automatic optimization, lazy loading, and responsive images
**Warning signs:** LCP (Largest Contentful Paint) > 2.5s, poor Core Web Vitals scores

### Pitfall 4: Choosing Wrong Framework for Use Case

**What goes wrong:** Using Next.js for pure static content, or Astro for highly interactive app
**Why it happens:** Not matching framework strengths to project requirements
**How to avoid:** Astro for content-first sites (blogs, docs), Next.js for app-like experiences with authentication/dynamic data
**Warning signs:** Fighting the framework, complex workarounds for simple tasks

### Pitfall 5: Deployment Platform Mismatch

**What goes wrong:** Using platform not optimized for your framework (Next.js on non-Vercel, missing edge optimization)
**Why it happens:** Not understanding platform-framework optimizations
**How to avoid:** Vercel for Next.js (or Astro), Netlify/Cloudflare for other SSGs. Each platform has framework-specific optimizations.
**Warning signs:** Slower builds than expected, missing preview deployments, edge functions not working

### Pitfall 6: Overly Complex Content Workflow

**What goes wrong:** Adding headless CMS before validating need, complicating author workflow
**Why it happens:** Premature optimization for multi-author or non-technical editors
**How to avoid:** Start file-based (git-based CMS). Only add headless CMS if non-technical editors need UI or you have >5 authors
**Warning signs:** Spending more time configuring CMS than writing content, API rate limits, added latency

</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from official sources:

### Astro Content Collections Setup (Astro 5.0)

```typescript
// src/content/config.ts
// Source: https://docs.astro.build/en/guides/content-collections/
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

### Fetching and Rendering Content

```typescript
// src/pages/blog/index.astro
// Source: Astro docs - Content Collections
---
import { getCollection } from 'astro:content';

const allBlogPosts = await getCollection('blog', ({ data }) => {
  return data.draft !== true;
});

// Sort by date, newest first
const sortedPosts = allBlogPosts.sort(
  (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
);
---

<ul>
  {sortedPosts.map(post => (
    <li>
      <a href={`/blog/${post.id}/`}>
        <h2>{post.data.title}</h2>
        <time datetime={post.data.publishDate.toISOString()}>
          {post.data.publishDate.toLocaleDateString('en-us', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </time>
      </a>
    </li>
  ))}
</ul>
```

### SEO with Sitemap and Robots

```typescript
// astro.config.mjs
// Source: @astrojs/sitemap docs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://yourdomain.com',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/draft/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
});
```

### Next.js App Router Static Generation

```typescript
// app/blog/[slug]/page.tsx
// Source: https://nextjs.org/docs/app/building-your-application/rendering/static-site-generation
import { notFound } from 'next/navigation';
import { getAllPosts, getPost } from '@/lib/posts';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

### Typography Setup (Times New Roman)

```css
/* src/styles/global.css */
/* Source: Web typography best practices */
:root {
  --font-serif: 'Times New Roman', Times, serif;
  --font-size-base: 18px;
  --line-height-base: 1.7;
}

body {
  font-family: var(--font-serif);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  color: #1a1a1a;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-serif);
  font-weight: bold;
  font-style: italic;
  line-height: 1.3;
  margin-top: 1.5em;
}

/* Optimal line length for readability */
article {
  max-width: 65ch;
  margin: 0 auto;
}
```

</code_examples>

<sota_updates>
## State of the Art (2025-2026)

What's changed recently:

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Astro Content Collections v1 | Content Layer API (5.0) | Late 2025 | 5x faster builds, 50% less memory, can load from APIs/CMS |
| Next.js Pages Router | App Router | 2023-2024 | Server Components default, better SSG with generateStaticParams |
| Manual sitemap generation | Built-in @astrojs/sitemap | 2024 | Automatic, handles all edge cases correctly |
| Traditional CMS | File-based with type safety | 2024-2026 | Git-based workflow, Content Collections provide CMS-like validation |
| Gatsby dominance | Astro/Next.js | 2023-2025 | Gatsby lost market share to faster, simpler alternatives |

**New tools/patterns to consider:**
- **Astro 5.0 Content Layer API:** Load content from anywhere (files, APIs, headless CMS) with massive performance improvements
- **Next.js 15 with React 19:** Stable React Server Components, improved caching, better static generation
- **Vercel Edge Network:** Global edge deployments with <50ms response times worldwide
- **astro-seo-schema:** Easy structured data / JSON-LD for rich snippets in search results

**Deprecated/outdated:**
- **Gatsby:** Still works but community momentum shifted to Astro/Next.js—slower builds, more complexity
- **Jekyll:** Ruby-based SSG from 2010s—still used for GitHub Pages but ecosystem stagnant
- **Pages Router (Next.js):** Still supported but App Router is the recommended path forward
- **Headless CMS first:** Starting with Contentful/Sanity before validating need—file-based is simpler until you hit scale

</sota_updates>

<open_questions>
## Open Questions

Things that couldn't be fully resolved:

1. **Analytics Platform Choice**
   - What we know: Need analytics for Phase 6, options include Plausible (privacy-friendly), Fathom (paid), Umami (self-hosted), Google Analytics (free, tracking concerns)
   - What's unclear: User's preference on privacy vs feature richness, budget for paid analytics
   - Recommendation: Defer to Phase 6 research. Start with Plausible Cloud (simple, privacy-friendly) unless user has strong preferences.

2. **Deployment Platform Final Choice**
   - What we know: Vercel (best DX, Next.js optimization), Netlify (user-friendly), Cloudflare (unlimited bandwidth, fastest)
   - What's unclear: Expected traffic levels, whether free tier sufficient
   - Recommendation: Start with Vercel free tier (generous limits, best DX). Can migrate later if needed. All three support Astro equally well.

3. **RSS Feed Priority**
   - What we know: Out of scope: newsletter. RSS is alternative for updates.
   - What's unclear: How important RSS is for initial launch
   - Recommendation: Include RSS via @astrojs/rss (trivial to add, standard expectation for blogs). Mark as "nice to have" in Phase 7.

</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)

- [Astro Documentation - Content Collections](https://docs.astro.build/en/guides/content-collections/) - Official Astro 5.0 content system
- [Next.js Documentation - Static Site Generation](https://nextjs.org/docs/app/building-your-application/rendering/static-site-generation) - App Router SSG patterns
- [CloudCannon - Top Five Static Site Generators for 2025](https://cloudcannon.com/blog/the-top-five-static-site-generators-for-2025-and-when-to-use-them/) - Comprehensive SSG comparison
- [Bejamas - Cloudflare Pages vs Netlify vs Vercel](https://bejamas.com/compare/cloudflare-pages-vs-netlify-vs-vercel) - Deployment platform comparison

### Secondary (MEDIUM confidence - verified with official sources)

- [Chromawire - Astro Content Collections](https://chromawire.com/blog/astro-content-collections/) - Content Collections workflow, verified against Astro docs
- [Medium - MDX vs Markdown Guide](https://medium.com/@ugurcanuzunkaya1/md-vs-mdx-a-comprehensive-guide-for-developers-cd0f29d20a9a) - MDX best practices, cross-verified with MDX docs
- [Digital Applied - Vercel vs Netlify vs Cloudflare 2025](https://www.digitalapplied.com/blog/vercel-vs-netlify-vs-cloudflare-pages-comparison) - Platform comparison, facts verified
- [Inhaq - Astro Content Collections Complete Guide](https://inhaq.com/blog/getting-started-with-astro-content-collections/) - Astro 5.0 Content Layer API changes

### Tertiary (LOW confidence - needs validation during implementation)

- None - all key findings verified with official documentation or cross-referenced with multiple sources

</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Astro, Next.js, Hugo static site generators
- Ecosystem: Content Collections, MDX, deployment platforms
- Patterns: File-based content management, SEO optimization, static generation
- Pitfalls: Performance, content workflow, framework mismatch

**Confidence breakdown:**
- Standard stack: HIGH - Astro 5.0 docs verified, Next.js App Router documented, deployment platforms compared with recent 2025-2026 sources
- Architecture: HIGH - Code examples from official Astro and Next.js documentation
- Pitfalls: HIGH - Common issues documented across multiple sources and official guidance
- Code examples: HIGH - All examples from official documentation (Astro docs, Next.js docs)

**Research date:** 2026-01-18
**Valid until:** 2026-02-18 (30 days - static site ecosystem relatively stable, but Astro 5.0 recently released)

**Key finding:** Astro 5.0's Content Layer API (late 2025) is a game-changer for content-focused sites—5x faster builds and flexible content sources while maintaining simplicity. This makes Astro the clear choice for "effortless writing experience."

</metadata>

---

*Phase: 01-foundation-tech-stack*
*Research completed: 2026-01-18*
*Ready for planning: yes*
