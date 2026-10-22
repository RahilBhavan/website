---
title: "Filing Change Tracker: What Changed Between Two 10-Ks"
tagline: "Aligns Risk Factors and MD&A paragraphs across two years and cites every change"
description: "A standard-library Python tool that aligns the Risk Factors and MD&A sections of consecutive 10-K filings, flags numeric changes, and exports a cited memo from a localhost review app, with no LLM."
problem: "Risk Factors and MD&A run to hundreds of blocks in each 10-K. Between years, paragraphs are edited, reordered, split and merged, and narrative numbers change, so finding what changed means aligning the two versions first and then citing both sides."
solution: "Built a Python standard-library tool that converts issuer DOCX and PDF filings into source-located blocks, aligns them across years with section and neighbor context (including two-paragraph splits and merges), extracts narrative quantities with unit and period, and serves a loopback review app that exports a cited memo and CSV."
result: "On 50 author labels across 3 real 10-K pairs, V2 recovered 46 of 46 changed decisions (V1: 42), but only 3 of 28 important changes reached its top-ten lists."
status: "prototype"
verification: "54 unit tests pass. A benchmark scores V1 and V2 against 50 labels written during development and not independently reviewed. No human review sessions are complete."
next: "Judge every top-ten entry, get independent labels, and test on a new issuer and year pair that development never touched."
figure:
  src: "/images/projects/filing-change-tracker/review-app.webp"
  alt: "Filing review app on Microsoft 2023 to 2024: 255 changes, and a changed MD&A passage where Microsoft Cloud revenue goes from 22% ($111.6 billion) to 23% ($137.4 billion)."
  caption: "The localhost review app on the Microsoft FY2023 to FY2024 pair, with the computed change and links to both source passages."
kind: "ai tool"
track: "ai"
featured: false
githubUrl: "https://github.com/RahilBhavan/filing-tracker"
completedDate: 2026-10-21
---

## Overview

**The question:** Given two consecutive 10-K filings from the same company, which paragraphs in Risk Factors (Item 1A) and MD&A (Item 7) actually changed, and can each change be traced to both source documents?

**The answer:** On a purposeful sample of 50 labels across 3 real filing pairs, the revised engine (V2) found the exact change for all 46 changed decisions and all 4 unchanged controls. Ranking those changes is still weak. The labels were written during development and nobody else has reviewed them.

**How it differs from its siblings:** Unlike the [Financial Metrics Analyst](/projects/financial-metrics-analyst), which serves structured XBRL numbers, and the [Filing Research Assistant](/projects/filing-research-assistant), which answers one question from one filing, this tool compares two years of the same filing and shows what changed, with no LLM at all.

## How it works

1. Issuer DOCX and PDF originals are converted into HTML blocks. Each block keeps its original locator, down to page and bounding box for PDFs.
2. Item 1A and Item 7 are parsed into blocks, and each edit is ranked with visible rules.
3. Alignment matches blocks using subsection and neighboring-text context. It handles reordered exact matches and two adjacent split or merged paragraphs, and it marks uncertain matches.
4. A numbers module extracts narrative quantities with metric, unit and period. It reports absolute and percentage-point changes, and it abstains when units or periods don't line up.
5. A review app on loopback saves decisions with revision history and exports a memo, CSV and cited source snapshots.

In the Microsoft FY2023 to FY2024 pair, for example, it pairs "Microsoft Cloud revenue increased 22% to $111.6 billion" with "increased 23% to $137.4 billion" and reports a $25.8 billion and 1 percentage point change.

## Results

| Pair | Labelled changes | V1 recovered | V2 recovered | Important changes in V2 top 10 |
| --- | ---: | ---: | ---: | ---: |
| Microsoft FY2022 to 2023 | 19 | 18 | 19 | 2/12 |
| Microsoft FY2023 to 2024 | 19 | 18 | 19 | 0/10 |
| Berkshire FY2023 to 2024 | 8 | 6 | 8 | 1/6 |
| Total | 46 | 42 | 46 | 3/28 |

Counting the unchanged controls, V2 matched 50 of 50 exact decisions and V1 matched 46 of 50. A correct detection needs the exact old and new block group and the change type. One Berkshire label was corrected from a standalone addition to a paragraph split after inspecting both originals, and that correction is not an algorithm improvement.

Ranking is the weak part. Only 3 of 28 labelled important changes reached the three V2 top-ten lists, and 26 of the 30 top-ten entries have no label, so no noise rate can be inferred. V2 machine comparison took 1.23 s, 1.37 s and 3.41 s per pair in the recorded run, which excludes human reading and says nothing about analyst time saved.

## How it was checked

- 54 unit tests pass, as of a rerun on October 21, 2026.
- `verify.py` runs the tests plus four commands on fictional regression filings and records the output.
- `scripts/benchmark.py` scores V1 and V2 on the 3 real pairs. The 50 labels were written during development (the label files credit the implementation author) and are not independently reviewed. They are development evidence, not a fresh holdout, and the two Microsoft pairs share FY2023, so they are not independent.
- A browser check passed nine checks on disposable synthetic state.

## Limits and next steps

- No independent reviews or human sessions are complete, so importance judgments and time savings are not validated.
- PDF columns, tables and page breaks can create misleading paragraph boundaries. Grouping handles only two adjacent paragraphs, and lexical rules can't resolve semantic rewrites.
- No XBRL reconciliation, OCR, 10-Q support or claim of financial materiality.
- The repo's next gates: judge every top-ten entry, collect independent source annotations, test on an untouched issuer and year pair, and run counterbalanced human sessions before claiming time savings.
- Independent portfolio work, not affiliated with Microsoft, Berkshire Hathaway or the SEC, and not investment advice.

## Links

1. [Repository](https://github.com/RahilBhavan/filing-tracker)
2. [Current measured results](https://github.com/RahilBhavan/filing-tracker/blob/main/docs/v2-results.md)
3. [Committed Microsoft memo](https://github.com/RahilBhavan/filing-tracker/blob/main/demo/real-microsoft/memo.md)

---

**Completed:** October 21, 2026
