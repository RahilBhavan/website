# Proofline website implementation — November 16, 2026

Status: implemented and locally checked; exact website design review pending. No production deployment performed. The original kit's council acceptance does not extend to this new website composition.

Owner: Proofline 1.0.0; Rahil Design voice/provenance rules, shared design workflow, Art Director composition guidance. Explicit Proofline choices override the older Art Director palette, display-weight and accent-area defaults. Body remains at least 17px; Archivo display is 850–900. Static composition is the complete reduced-motion state.

Checks exercised:

- `bun run check`: build, Astro diagnostics, 86 pages' local links/anchors, 28 writing/project cross-links, and 14 calculation/data tests passed. Existing unused-import hint in textbook builder remains.
- `bun run test:e2e`: 31 Firefox tests passed, including internship filters, failed load feedback, token-guide controls, and desktop/phone route smoke tests.
- `node scripts/proofline-review.mjs`: seven representative routes at 1440/390/320px, no horizontal overflow; dark operating-system preference retains paper; actual IBM Plex Sans loading and body sizes recorded; keyboard skip link works. Reduced motion enabled.
- Manual browser automation: project topic filter, textbook chapter search empty state, Escape closing contents, and home content with JavaScript disabled passed.
- `bun run og`: 55 source-bound cards generated, each passed renderer bounds/overlap checks. Ordinary cards now omit long summaries in favour of readable headlines and status/date metadata; full descriptions remain in page metadata. Seven compact evidence cards retain their sourced numbers and qualifications. All 55 inspected as a 326px-wide contact sheet. No source claim, date or numerical encoding changed.
- Exact desktop and 390px home screenshots, 390px project case and textbook reading shell visually inspected. Corrected dark masthead mark visibility using citrus backing. 320px layout checked automatically. Source diagrams and embedded tools keep their own colours and are not claimed as redesigned.
- WCAG solid colour contrast calculations: green/paper, secondary green/paper and green/citrus exceed 4.5:1. These role checks do not constitute a whole-site accessibility certification. No multi-category colour encoding changed.
- `git diff --check` passed. Exact source/card SHA-256 values are in `proofline-hashes.json`; generated screenshots and layout diagnostics are retained in the local review bundle.

Limits: Chromium/Safari were not exercised; no audience usability study, refreshed factual audit, external redirect test or independent review of this website revision. Imported textbook source diagrams and standalone project tools are preserved. Publication and final design acceptance remain separate from local checks.

## Publication preparation and shared repair 1/1

Rahil explicitly requested “make it live” after the exact desktop/phone preview was supplied, authorizing this design and publication. The independent Claude Opus review of head `9fd46a2` found four reader-cascade contrast regressions: old yellow body links, grey small text, Cortex-M light cover/footer copy on paper, and pale inline code. The one repair pass sets paper-reading text to green/secondary green, restores green dark bands, uses accessible red inline code, and preserves light code/links in dark contexts. The shared library footer explicitly stays on paper.

`bun run check` and all 33 Firefox tests pass after repair. New regression tests inspect actual cascaded foreground/background contrast for links, small print, code, cover text and footer paragraphs in RISC-V and Cortex-M at 390px. Exact 390px RISC-V body links, Cortex-M cover and inline code were visually inspected. Original reviewer notes were corroborated by source inspection. Repair hashes are included. This consumes the shared repair allowance; a fresh independent re-check will determine whether the blockers are resolved.

## Additional repair authorized: “fix it and update it all”

The re-check confirmed the original four fixes and found a green-on-dark RWA chapter link. Rahil authorized the additional repair and completing publication. The callout now uses green with paper links and labels. A full text sweep also corrected remaining inherited reading roles in Tokenization, Strategy, SSRD and CUDA: muted text, warning labels, reading actions, code output and line numbers. The CUDA sign-bit colour stays rose but uses a darker text shade for contrast. Figure geometry, data, source fragments and numerical encodings stay intact. Textbook theme metadata and favicon now use Proofline as well. Phone display sizes preserve complete words instead of splitting heavy Archivo words mid-letter; primary reading actions use citrus.

`bun run check` passes. The Firefox suite passes all 55 tests, including all 12 textbook reading editions at 390px and 1280px. The contrast helper examines visible direct HTML text against its composited solid background, including translucent foreground/background colours; minimum 4.5:1 for each measured text element. SVG/canvas internals, background images, ancestor opacity, dynamic states not opened and cross-browser rendering are outside this measurement. This is regression evidence rather than full WCAG certification. Changed phone views are retained in the local review bundle. A fresh independent re-check covers this final change set before merge.
