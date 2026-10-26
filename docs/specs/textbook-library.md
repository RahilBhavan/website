# Textbook library

Requested 25 October 2026: add all eleven locally recovered textbooks to Rahil's existing personal website and standardize their design and quality.

Reader outcome: a visitor can find a subject and read its complete textbook on a phone or desktop without leaving the site's identity.

## Scope

- `/textbooks` lists all eleven books, with search and subject filters, plus the Strategy Bitcoin companion. `/books` redirects here. Primary navigation and the homepage expose the library.
- Every book has a stable local URL, shared reader navigation, Anton headings, IBM Plex Sans body text, charcoal/white/yellow tokens, visible keyboard focus and a print layout.
- Preserve substantive chapters, worked examples, qualifications, sources, diagrams, calculators and quizzes. Fix observed defects; never invent fresh evidence or claims of mastery.
- Use IB27's substantive project textbook as the public edition; its repetitive generated interview reader is an archived edition, not the primary book. Original PDFs remain source editions rather than falsely labeled redesigned exports.
- Publish only selected educational artifacts. Do not import the IB27 coach, private runtime records, home paths or the full local collection manifest.

## Acceptance checks

AC-1: `/textbooks` exposes eleven distinct textbooks and the Strategy companion, each with an existing local reader destination.
AC-2: Search, combined subject selection, zero results and reset have observable correct results and an announced count. All entries remain present with JavaScript disabled.
AC-3: Every primary reader loads at 1280, 390 and 320px with no document-level horizontal overflow; broad diagrams/code/tables scroll within labeled containers.
AC-4: Heading and body computed fonts use Anton and IBM Plex Sans; shared navigation, links, focus and controls use the canonical tokens.
AC-5: Every textbook's representative calculator/quiz/disclosure/navigation is exercised against a known expected result where present. Existing persisted study data retains its own keys.
AC-6: The build and internal-link checks pass; source/output receipts identify the exact artifact hashes and preserved limitations.
AC-7: No private coach or runtime data is hosted. Figures retain evidence labels and receive a recorded review status. Missing required visual checks prevent a claim of design approval.
AC-8: Desktop and phone screenshots are visually inspected. Reduced motion and no-JavaScript reading are checked. Safari/Windows verification is reported only if actually exercised.

## Verification method and stopping condition

Inventory source files and hashes; compare content before and after import; run the website's checks; drive each reader and library states in a real browser; inspect desktop and phone screenshots; repair observed defects; record exact output checks. A shipped interface is not evidence that a reader learned a subject. Deployment requires passing the visual gate and an available authorized deployment route.
