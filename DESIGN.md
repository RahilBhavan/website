# Design

This site applies the public `rahil-design` system, version 3.3.1: charcoal, white and yellow, with Anton display type and IBM Plex Sans body text. The voice is "A student trynna learn". The system's tokens and rules are the authority. This file records only how the site applies them.

## Tokens

`src/layouts/BaseLayout.astro` holds the color tokens as CSS properties: `--canvas`, `--surface`, `--ink`, `--secondary`, `--accent`, `--border`, and the light `--figure-*` set. Yellow (`--accent`) marks links, the primary action, focus, selection and the status marker. Do not add a second accent.

## Type

- Anton, uppercase, for `h1`, `h2`, the name and the hero lead line.
- IBM Plex Sans for everything else. Inside long write-ups, `h3` and `h4` stay in Plex SemiBold so dense case studies stay readable.
- Labels and interface text use sentence case. Monospace is only for code.

## Projects

Every project states its `result`, its `status` (proposal, prototype or shipped), and how it was checked (`verification`). Take each value from the project's own write-up. If the write-up records no check, `verification` says so. A `figure` is a real artifact, such as a dated dashboard screenshot or a build photo, shown on the light figure surface.

## Checks before shipping

Run `bun run check`. Read changed pages at 1280px, 390px and 320px. There should be no horizontal scroll, every target should be at least 44px, and focus should stay visible.

## Textbook reading editions

`/textbooks` uses an open numbered index with search and subject filters. The shared reader lives in `public/textbooks/reader.css` and `reader.js`. It owns navigation, font roles, light figure surfaces, focus, narrow-screen scrolling and print flow. Topic-specific diagrams and learning controls retain their own models.

Imported sources live in `src/textbooks/`, grouped by book. Numbered fragments join in order; they preserve the original markup and physical SVG parts without giant font/base64 blobs. `scripts/textbooks/build.mjs` makes the local reading editions and records hashes. Figures retain their source dates, illustration labels and qualifications. The source-edition hash is provenance, not a factual refresh or a learning-outcome claim.
