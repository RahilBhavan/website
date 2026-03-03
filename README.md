# Blog

Personal blog and project portfolio — Astro, MDX, Tailwind. Projects, blog posts, reading list, and analytics.

## Quick start

```bash
bun install
bun run dev
```

Open [http://localhost:4321](http://localhost:4321).

## Scripts

| Command | Description |
|--------|-------------|
| `bun run dev` | Start dev server |
| `bun run build` | Aggregate books (Goodreads, etc.) then build for production |
| `bun run preview` | Preview production build locally |
| `bun run aggregate:books` | Run books pipeline only (writes `src/data/books.json`) |

Books aggregation (sources, Goodreads auth, sync) is documented in **[scripts/README.md](scripts/README.md)**.

## Stack

- [Astro](https://astro.build) 5, [MDX](https://mdxjs.com), [Tailwind](https://tailwindcss.com)
- Deploy: Vercel (server output + API routes)
- Content: `src/content/` (blog, projects, books); generated data in `src/data/`

## Project structure

- `src/pages/` — Routes (index, blog, projects, books, analytics, API)
- `src/content/` — Blog posts, project case studies, book entries
- `src/data/` — Generated: `books.json`, `analytics.json`, `insights.json`
- `scripts/` — Books aggregation, Goodreads sync, analytics, AI insights
