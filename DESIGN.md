# Proofline on Rahil Bhavan's website

design-owner: Proofline 1.0.0 because Rahil selected it for his portfolio and research on November 16, 2026.

The governing kit is `brand-systems-lab/output/rahil-proofline/SYSTEM.md` on the processing host. This replaces the retired yellow/charcoal identity. The kit's acceptance does not approve this website revision; this exact implementation remains design review pending until Rahil reviews it.

## Site rules

Reading stays on paper `#F4F5EF` with green ink `#142E28`, secondary text `#466357` and citrus `#DFFF5E` for filled actions and the masthead mark. The paper reading surface stays the same regardless of operating-system theme. Archivo variable 850–900 owns display headings; IBM Plex Sans 400/600 owns reading. Plex Mono remains for code and tabular values.

The green masthead uses the original rb. mark on a citrus surface and the full name. Research is an editorial category, not a separate identity or slogan. The home page uses the kit's test-bench illustration as a decorative metaphor, never as measured data. Production PNGs preserve the kit's licensed typography without embedded base64 font files. No motion is required for reading or navigation.

Home: a large name, an uneven introduction/latest-project split, one illustration, then open ruled project and writing lists. Mobile stacks the same content. Project and writing titles retain finding frontmatter but use an underline rather than the retired yellow highlighter. Claims, dates, prototype status, sources and qualification text are preserved.

Shared textbook reading chrome uses the same reading typography and palette. Imported source fragments, original screenshots, embedded project demos and standalone tools retain their own models and semantic figure colours; this revision does not imply those source artifacts were redesigned or revalidated factually. No financial data or numerical encoding changed.

## Share cards

`bun run og` regenerates home, finance, project and writing images from the existing source metadata. They use green surfaces, paper type and citrus emphasis, with Archivo titles and Plex Sans summaries. Cards supplied by projects through explicit `ogImage` remain source artifacts. The renderer retains the title/body/footer overflow check.

## Verification

Run `bun run check`, `bun run og`, and `bun run test:e2e`. The built-site smoke suite checks desktop and phone layouts, failures and navigation. For the extra 320px, reduced-motion, dark-OS and font checks, serve the build on 4396 with `node scripts/serve-dist.mjs 4396`, then run `node scripts/proofline-review.mjs`. Its diagnostics and screenshots are generated under `.generated/proofline/`.

Inspect the exact screenshots and representative share cards at full size and phone scale. Check contrast, visible keyboard focus, search/filter interactions and long titles. Neither CI nor these checks authorizes publication. Historical review documents describe older revisions only.
