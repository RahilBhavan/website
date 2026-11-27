# Strategy credit dashboard

Requested November 26, 2026: Rahil asked to publish the Strategy Model Lab dashboard on this site, in the Du Bois look of his X desk cards.

- `/tools/strategy-credit`: the full dashboard, one self-contained static page (no JavaScript, fonts embedded).
- `/strategy-credit`: short link (redirect in `vercel.json`). `/strategy` already points to the DAT accretion monitor and is unchanged.

## What it is

Strategy Inc.'s BTC Rating, BTC Risk and BTC Credit for its preferred stock and notes, reproduced from SEC filings and Strategy's published decks, and what the lab's models add: a weekly cash-calendar Monte Carlo, a liquidation waterfall, the issuance flywheel, a convertible note pricer, an mNAV premium study, a peer census, the extractor evaluation, data provenance and a limitations register. Conditional analysis, not a forecast or investment advice.

## How it is made

The page is generated in the Strategy Model Lab repository (local, not yet public):

```sh
python -m tools.dashboard --public --theme dubois --out <website>/public/tools/strategy-credit/index.html
```

Every number is read from a model output at generation time and keeps its file pointer in a `data-src` attribute. The public build (`tools/dashboard/public.py`) replaces repository paths with plain-language source names and removes developer and review-process text. It does not change any number. The page does not update itself; regenerate and commit it after new filings.

Design owner: rahil-design, with Rahil's explicit choice of his approved Du Bois X card look (paper, ink, crimson accent, gold highlights, Archivo at 62% width in capitals for headings). Not the site's Proofline pages; existing pages keep their styling.

Checks and the exact-artifact review are recorded in `review.json`.
