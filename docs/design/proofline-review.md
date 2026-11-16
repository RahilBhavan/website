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
