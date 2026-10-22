# Blog

Personal site and project portfolio, built with Astro and MDX.

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
| `bun run build` | Build for production |
| `bun run check` | Build, check every internal link and anchor, and run `tests/` |
| `bun run og` | Regenerate the social cards in `public/og/` after adding or editing a project |
| `bun run preview` | Preview production build locally |

## Stack

- [Astro](https://astro.build) 5 and [MDX](https://mdxjs.com), deployed on Vercel (Node 24)
- Design: [DESIGN.md](DESIGN.md)

## Project structure

- `src/pages/`: routes (index, about, projects, writing, crypto-finance)
- `src/content/projects/`: one Markdown case per project. The frontmatter `result`, `status`, `verification`, `next` and `figure` fields feed the lists and the case summary, and `src/content/config.ts` validates them.
- `src/content/blog/`: posts. Set `project` to a project slug to link the post and the case page both ways.
- `src/lib/content.ts`: shared helpers, including the writing list that groups series.
- `public/fonts/`: self-hosted Anton and IBM Plex Sans (SIL OFL, licenses alongside).
