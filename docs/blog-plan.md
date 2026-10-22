# Blog plan

What the writing on rahilbhavan.com is for, how each post is built, and what to do next. Written October 21, 2026. It follows the X series plan in the private `main` repo (`docs/specs/x-series-by-target.md`), which Rahil approved on October 12.

## What the blog is for

Recruiters and engineers at the six internship targets should be able to judge the work, not take it on trust. Those targets are Strategy, BitMine, Coinbase (crypto, tokenization and RWA), product management, AI engineering or forward-deployed engineering, and frontend. Every post therefore shows five things:

1. The problem, as a concrete question or something that could go wrong.
2. The decision or mechanism, explained so a smart non-specialist can follow it.
3. The result with its real number, or a clearly labeled hypothetical.
4. The limit of the evidence, next to the result it limits.
5. The next test.

The voice is "A student trynna learn": curious and plain, confident about checked facts, open about unknowns. A post never claims a feeling, customer, deployment or outcome that the project's own files do not record.

## What changed on October 21, 2026

- Every good project now has a case page and at least one article that links to it. The case page carries the facts (result, status, how it was checked), and the article carries the reasoning.
- Posts and projects carry a topic (`track` on the project: crypto finance, AI engineering, product, hardware). `/projects` and `/writing` filter by it.
- Long posts get a contents list. Every post ends with a card for its project, and every post has its own social card (`bun run og`).
- `/work.json` publishes every project and post as data. The private networking dashboard reads it to suggest work for each contact (see "Networking" below).

## How to write the next post

1. Start from an artifact that already exists: a repo, a run, a filing. If the evidence is not ready, skip the slot rather than force a post.
2. Copy the shape of a recent post, for example `src/content/blog/which-x402-payment-exception-should-an-operator-handle-first.mdx`. Set `project:` to the case page slug.
3. Every number must trace to a file in the project's repo. Date anything that changes ("as of October 11, 2026").
4. Run `bun run og` to make the social card, then `bun run check`.
5. Share it as the X post for that week's series slot, linking the article instead of a bare repo.

## Cadence

Follow the X series rotation: at most three posts a week on Tuesday, Thursday and Saturday, with no catch-up debt. During the two-a-day trial (October 20 to November 2), the blog does not need to match the X cadence. One article can back several X posts.

## Backlog, in order

These come from the X series episode plan. Each needs its build to finish first.

| Target | Post | Needs |
| --- | --- | --- |
| BitMine | Rebuilding ETH per share from BitMine's weekly 8-Ks | Per-share series from filings |
| Product | Coinbase tokenized stocks on Base: onboarding teardown and metric tree | New write-up |
| AI engineering | An LLM on the same frozen 60-question set, compared against BM25 | New build on filing-research-assistant |
| BitMine | MAVAN staking yield per share | New module |
| Product | PRD: a committed backstop liquidator for Spine's finding | New write-up |
| Frontend | dat-accretion break-even map: drag mNAV and preferred price | New build on this site |
| Coinbase | Morpho Midnight after the October 30 maturity | spine-midnight refresh |
| Strategy | Strategy Q3 results, viewed per share | After results |
| AI engineering | Failure taxonomy: where the answerer abstains wrongly and why | Follows the BM25 comparison |

Refresh older posts when their numbers move. For example, the Spine post is dated September 2026, and the live book has since grown from $1.6B to $1.8B.

## Networking

The dashboard at `/lmW1wFgrRCB5SbhO.html` now fetches `/work.json` after you unlock it. It adds three things:

- A "Your work" section that lists every project and article, each with a copy-link button.
- "Work to mention" in each contact's details. This shows the contact's tracker project first, then work that names their company.
- On each tracker project card, the site's status and case page. It warns when the site says shipped but the tracker does not.

The contact data stays encrypted. These additions live in the page's display code, outside the encrypted blob. The dashboard's generator (`build.js`) is not on this machine. Port the same changes into its template, or the next rebuild will drop them. `docs/networking-dashboard-work.patch` holds the exact diff.

## Measuring whether it works

- Turn on Vercel Web Analytics for the project. That is an account setting, so it was not changed here. Track views per post and which posts send readers to a case page.
- In the networking dashboard, compare reply rates for messages that linked a specific article against ones that did not. Only draw a conclusion once each group has enough sends to compare.
- Every month, check that each case page's status and figures still match its repo.
