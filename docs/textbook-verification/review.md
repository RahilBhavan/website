# Textbook reading-edition review

Design authority: `rahil-design@3.3.1`, with the website's existing charcoal, white and yellow identity. Reviewer: Codex gpt-6.1-sol. The import and build manifests identify source and output SHA-256 hashes; the reader CSS and compatibility CSS are part of the output and must be reviewed together.

## Exercised

- All eleven textbooks and the Strategy companion open from the library. The site uses real Astro routes, not local filesystem links.
- Firefox: 1280, 390 and 320px; all readers have no document-level horizontal overflow. Dense tables, SVGs, code and equations use their own scrolling regions. SVG minimum widths preserve readable labels rather than compressing an entire wide drawing onto a phone.
- Search plus subject filters, zero results, reset, native contents filtering, local chapter navigation, quiz wrong/correct states, calculators with known answers, and tokenization note persistence were exercised. `behavior.json` records the checks.
- Source and output are distinct. IB27 uses the substantive project book rather than its repetitive generated interview reader. The private interview-coach application is excluded. CTRM's original future milestones are explicitly historical targets.
- The legacy RWA complete-book compiler had omitted its interactive chapter scripts. The reading edition restores them from the original chapter files and checks the 2x2 DiD calculation against an independent arithmetic expectation.
- CUDA's small bar charts are tables. Integer TOPS is separate from floating-point TFLOPS. The optimization table retains the archived example and explicitly says the benchmark was not re-run. Sources, dates and caveats remain in the chapters.
- Phone-size figure captures were inspected across the imported books. Corrections included RISC-V timing-table contrast, RWA result panels, inherited font roles, multicolor decorations, equation overflow and diagram text access. D3 clickable cells have keyboard activation. Hover-only CUDA annotations also have native text disclosures.
- The direct-text contrast diagnostic checks solid-color leaf text against composited ancestor backgrounds, conservatively at 4.5:1. It excludes SVG text, KaTeX internals, disabled controls, gradients and opacity. Its zero failures are evidence for that bounded scope, not full WCAG conformance. SVG and composed figures also received visual inspection.

## Integrity and accessibility scope

This is a design and reading-experience revision. Historical source quantities, their dates, illustrative labels, uncertainty and limitations are retained. Existing numerical encodings preserve their geometry; uniform display scaling does not create a new relative data scale. No fresh market data, legal conclusion, hardware performance result or mastery claim is introduced.

Present Data and Tufte informed the table conversions and figure review. Dataviz's single-accent/neutral rules informed contrast and text alternatives; its static-card validator is not represented as a general audit of these interactive documents. Anatomy informed inspection of the inherited RISC-V conveyor and MinHash instrument; their geometry was retained rather than rebuilt or falsely given a new geometry-audit receipt.

There is no social post or feed attachment in this change. Post-to-image agreement is not applicable. The phone reader is the reviewed container. A source dated October 2026 does not mean a company's figures are current today.

## Limits

No Safari, Windows, physical printer, independent human comprehension test or comprehensive factual re-audit was performed. Browser print state and unrestricted print flow were checked; the original PDFs were not relabeled as redesigned exports. Source code and paper links may require the internet even though fonts, D3, Chart.js and KaTeX are hosted locally.

The normal site build/link/test suite and the browser behavior suite must pass again after changes to shared reader code. Output SHA-256 manifests bind the exact book HTML; CSS/JS hashes are recorded separately in the final receipt.
