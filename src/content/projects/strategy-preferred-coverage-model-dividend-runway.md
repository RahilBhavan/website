---
title: "Strategy Preferred Coverage Model: Dividend Runway"
tagline: "How long Strategy's cash and common stock sales can fund five preferreds"
description: "An Excel model, built from public SEC filings, of how long Strategy's USD Reserve and common stock sales can pay dividends on STRF, STRC, STRE, STRK and STRD plus convertible interest, with a 20-quarter financing path."
problem: "Strategy pays cash dividends on five preferred series and interest on its convertible notes. The cash comes from a USD Reserve and from selling common stock, and bitcoin is not cash until it is sold. A single coverage number can mix money already held with sales that depend on market demand."
solution: "Built a 14-sheet Excel workbook with 1,551 formula cells and 124 named ranges from public filings and issuer releases. It separates cash, saleable common and bitcoin, bridges to net mNAV, and runs a 20-quarter path with put dates, fees, dilution and ATM use. A project page and a 30-chapter textbook with a snapshot calculator explain it."
result: "As of the Oct 15, 2026 snapshot, the $4,880M Reserve covers 37.5 months of $1,559.7M annual charges. Adding the common ATM gives 15.2 years, only if demand absorbs it."
status: "prototype"
verification: "All 16 Checks-sheet rows read PASS. LibreOffice recalculated 10 input-change cases on Oct 16, 2026, and 7 calculator checks passed on Oct 21. Never opened in Microsoft Excel."
next: "The inputs predate the Q3 2026 10-Q, and the 1x issuance gate and the demand coefficients are editable assumptions. A Microsoft Excel check and a recorded Goal Seek run are pending."
figure:
  src: "/images/projects/strategy-preferred-coverage-model-dividend-runway/snapshot.webp"
  alt: "Snapshot table showing $1,559.7M of annual preferred dividends plus interest, 37.5 months from the Reserve alone, 15.2 years with the registered ATM, and net mNAV 1.175x, above a calculator with sliders for bitcoin price, net mNAV and STRC rate."
  caption: "The project page as of the October 15, 2026 snapshot. The calculator holds every input except bitcoin price, net mNAV and the STRC rate at that snapshot."
kind: "financial model"
track: "crypto"
featured: false
demoUrl: "https://rahilbhavan.github.io/strategy-preferred-coverage-model/"
githubUrl: "https://github.com/RahilBhavan/strategy-preferred-coverage-model"
completedDate: 2026-10-21
---

## Overview

**The question:** How long can Strategy's cash and common stock sales fund the dividends on STRF, STRC, STRE, STRK and STRD and the interest on its convertible notes, and how do convertible puts change that answer?

**The answer, as of the October 15, 2026 snapshot:** The $4,880M USD Reserve covers 37.5 months of charges on its own. Adding the remaining common ATM (at-the-market) authorization gives 15.2 years, but only if market demand absorbs all of it. If net mNAV falls below 1x, the model's issuance gate stops common sales and the answer drops to 3.1 years.

**Scope:** Independent educational work from public SEC filings and issuer releases. It is not affiliated with Strategy, does not describe Strategy's internal forecast, and is not investment advice.

## How it works

`model/build.mjs` writes formulas into a 14-sheet workbook. Excel or LibreOffice computes the results, not the script.

- `Inputs`, `Scenarios` and `Instruments` hold the sourced figures, five scenario lever sets (Base, Bear, Severe, Bull, Custom) and one row per security.
- `Obligations`, `Liquidity` and `Coverage` stack the charges by seniority and keep cash, saleable common and bitcoin separate.
- `Net NAV` bridges to net mNAV. It adds dilution from in-the-money convertibles and subtracts out-of-the-money claims.
- `Quarterly path` runs 20 quarters from an October 16, 2026 stub. It rolls cash, remaining ATM and shares, charges issuance fees, and pays each convertible put in cash on its filed date. After the first unmet need, it becomes a required-financing schedule.
- `Checks`, `Dashboard`, `Stress` and `Native sensitivity` hold the checks, charts, formula grids and two native What-If Data Tables.

The inputs are balance-sheet observations through October 11, 2026, Q2 2026 10-Q terms and counts, and October 15, 2026 market prices (bitcoin at $82,131). There is no live feed.

## Results

All figures are as of the October 15, 2026 snapshot, Base case.

| Measure | Value | Condition |
|---|---|---|
| Annual cash charges | $1,559.7M | Current rates, all paid in cash |
| Reserve coverage | 37.5 months | $4,880M Reserve, flat charges, principal excluded |
| Reserve plus common ATM | 15.2 years | Only if demand absorbs the $18,807.6M common ATM |
| Reserve only, net mNAV below 1x | 3.1 years | The 1x issuance gate stops common sales |
| Reconstructed net mNAV | 1.175x | Estimated shares, dated awards |
| BTC cover of debt plus preferred claims | 3.4x | Falls to 1.0x at about $24,171 BTC |
| Convertible puts in the 20-quarter path | $6,713.7M | Full cash puts on the filed put dates |

The 15.2-year figure is conditional capacity, not a financing forecast. The Base path has no unmet financing need under its assumptions. The Severe case (BTC down 70%, net mNAV 0.8x, STRC at 15%, EUR/USD up 10%) leaves $10,821.3M of unmet funding needs over 20 quarters. That is scenario arithmetic, not a probability.

## How it was checked

- All 16 rows on the workbook's `Checks` sheet read PASS. One row reconciles the charges to management's $1.703B estimate from August 23, 2026.
- LibreOffice recalculated 10 input-change cases on disposable copies on October 16, 2026 (`docs/formula-verification.json`). That is not a Microsoft Excel check.
- `node model/check-calculator.mjs` reports 7 calculator behavior checks passed, observed on October 21, 2026.
- The deployed workbook matched the local file by SHA-256, and on the live calculator, setting net mNAV to 0.8x moved static coverage from 15.2 to 3.1 years (`docs/deployment.md`).

## Limits and next steps

- The model has not been opened in Microsoft Excel, and a recorded native Goal Seek run is pending.
- The inputs predate the Q3 2026 10-Q. STRC shares and basic common shares are reconstructed from weekly filings, and awards are anchored to Q2.
- The 1x issuance gate, the demand coefficients, the STRC rate-band rule and the put elections are editable assumptions. The filed capital framework keeps discretion near 1x.
- The model assumes no new preferreds and no refinancing, and its FX rate is not the issuer's fixing.
- The reader test has no responses yet.

## Links

1. [Live project page and calculator](https://rahilbhavan.github.io/strategy-preferred-coverage-model/)
2. [30-chapter textbook](https://rahilbhavan.github.io/strategy-preferred-coverage-model/textbook.html)
3. [Repository and workbook](https://github.com/RahilBhavan/strategy-preferred-coverage-model)

---

**Completed:** October 21, 2026
