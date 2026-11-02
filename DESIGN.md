# Design

design-owner: rahil-design 4.0.0 (Rahil Bhavan Research) because this is Rahil's public personal site.

This site applies the public `rahil-design` system, version 4.0.0, which Rahil approved on October 27, 2026: charcoal, warm white and one yellow accent, Archivo for display and text, IBM Plex Mono for figures. The voice is "A student trynna learn". The system's tokens and rules are the authority. This file records only how the site applies them. Until Rahil passes the site's look, it is design review pending.

## Tokens

`src/layouts/BaseLayout.astro` holds the color tokens as CSS properties: `--canvas`, `--surface`, `--ink`, `--secondary`, `--accent`, `--border`, and the light `--figure-*` set. Dark is the default. A light theme follows `prefers-color-scheme` and puts the page on paper (`#F5F5EF`) with charcoal ink.

Yellow (`--accent`) is the one accent. On charcoal it marks links (`--link`), the current nav item, the primary action, focus, selection and the status marker. On paper, yellow text fails contrast, so `--link`, `--focus` and the hero number switch to ink, and yellow appears only as a fill behind ink text (the highlighter, buttons, link hover). Do not add a second accent.

## Type

- Archivo, self-hosted as a variable font (weight 400 to 900), for display, titles and text. `h1` and `h2` are weight 800 in sentence case.
- IBM Plex Mono for figures: evidence values, section numbers and code. Use tabular numerals.
- Archivo lacks ↗ and ✓, so an extra `Archivo` face maps those two code points to Plex Mono.
- Labels and interface text use sentence case. Kickers are small uppercase labels in `--secondary`.

## Frame

- A yellow top bar, then the masthead: a yellow square and "RAHIL BHAVAN RESEARCH".
- Highlighter (`.hl`): a solid yellow band with charcoal text. On a project or writing title it marks only the words named in the entry's `highlight` frontmatter, which must name the finding and appear in the title. The build fails if it does not. A title without `highlight` has no highlighter. The highlight is never guessed.
- Sections of the home page and the case-study write-ups carry a Plex Mono section number (01, 02 and so on). "Exhibit NNN" is reserved for numbered X figures.
- There is no "✓ CHECKED" stamp on the site. That stamp states a scripted check of the figure's numbers, and no script checks the evidence panels against their sources. The panels show their dated basis as a plain line.

## Projects

Every project states its `result`, its `status` (proposal, prototype or shipped), and how it was checked (`verification`). Take each value from the project's own write-up. If the write-up records no check, `verification` says so. A `figure` is a real artifact, such as a dated dashboard screenshot or a build photo, shown on the light figure surface.

## Checks before shipping

Run `bun run check`. Read changed pages at 1280px, 390px and 320px. There should be no horizontal scroll, every target should be at least 44px, and focus should stay visible.

## Textbook reading editions

`/textbooks` uses an open numbered index with search and subject filters. The shared reader lives in `public/textbooks/reader.css` and `reader.js`. It owns navigation, font roles, light figure surfaces, focus, narrow-screen scrolling and print flow. Topic-specific diagrams and learning controls retain their own models. It still uses the 3.x faces (Anton and IBM Plex Sans), as do the per-book styles in `src/textbooks/*/style-*.css`. Moving them to 4.0 needs its own pass and a new textbook verification run.

Imported sources live in `src/textbooks/`, grouped by book. Numbered fragments join in order; they preserve the original markup and physical SVG parts without giant font/base64 blobs. `scripts/textbooks/build.mjs` makes the local reading editions and records hashes. Figures retain their source dates, illustration labels and qualifications. The source-edition hash is provenance, not a factual refresh or a learning-outcome claim.

## Selected project case studies

The seven resume-linked case studies share a large display title, labeled finding,
artifact/code actions, and an early write-up shortcut. The full write-up uses a
sticky section index on desktop and an in-flow index on narrow screens.

`ProjectEvidence.astro` renders native evidence panels from
`src/data/project-evidence.json`. All seven panels use the figure token roles,
a yellow top rule, 40px Archivo headings, 18px labels, Plex Mono values, a dated
basis line, and a footer with the Note (limit) and the Source. On mobile
they precede the long summary. Original screenshots remain accessible through
clearly labeled source links; they are not altered to resemble redesigned apps.

Case-study titles use Archivo 800 at the display clamp (56–96px), 1.06 line
height, zero tracking and an 18px body. Controls and figure panels use 8px and 12px
radii. All content is present with reduced motion and JavaScript disabled.

Every evidence panel row can set `"hero": true`. The case page then shows that
row's value as the hero number (yellow on charcoal, ink on paper). No row is
marked yet, so no hero number renders. A row picked by position could contradict
the finding sentence.

## Social cards

`scripts/og/render.mjs` (`bun run og`) renders the 1280×640 cards in `public/og/`
in the 4.0 frame: yellow top bar, masthead with the page kind, Archivo title (with
the highlighter only where `highlight` is set) and a footer rule. The cards embed
the site's own Archivo and Plex Mono files. Titles are 72 to 104px, so they stay
above the 18px label floor when the card is displayed 326px wide in a feed.

The evidence file supplies concise link-preview headlines for the seven case
studies. These compact cards drop the masthead and set a 160px yellow hero line
and 72px supporting text. At a 326px display width they stay above the 40px/18px
public-media floors. They retain model/prototype qualifiers; the full page carries
methods and dates. Regenerate the cards after you change a title, a `highlight`
or the renderer, and look at them at feed size.

`/coverage`, `/dat-accretion`, `/mara` and `/toolkit` are same-domain case-study
aliases.
The historical `/strategy` alias continues to point to DAT for compatibility.
These deployment redirects are configured in `vercel.json`, not exercised by the
static local server.

The Strategy Capital Markets Toolkit page joined the set on October 26, 2026.
Its panel covers five repositories, so each row label links to its own repo and
the single source action is omitted. `ProjectEvidence.astro` accepts an optional
row `href` and an optional `source` for this case.

Checks and review limits: `docs/project-design-review-20261026.md`.
