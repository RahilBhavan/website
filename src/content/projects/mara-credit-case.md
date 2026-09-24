---
title: "MARA Credit Case: Sizing a Secured Revolver"
tagline: "Credit committee case that cuts a $5.0M revolver request to a conditional $3.0M limit"
description: "A credit committee package that sizes a hypothetical $5.0M, 12-month secured revolver to MARA Holdings from public filings: a tested decision engine, a two-page memo, and a conditional $3.0M limit set by stressed collateral proceeds."
problem: "A lender is asked for a $5.0M, 12-month secured revolver by a bitcoin miner with $421.3M of cash, 35,577 bitcoin, and about $2.4B of debt. How much should it lend, against what, and on which conditions? The borrower's size says little about the answer, because the facility is only as good as the collateral behind it and the route from that collateral to repayment cash."
solution: "Built a standard-library Python decision engine with Decimal arithmetic that runs a collateral waterfall and four caps (obligor, collateral, single-name, concentration) across eleven scenarios, from issuer facts pulled out of MARA's filing XBRL and a fictional collateral schedule. The engine feeds a two-page credit memo, an opposing memo, a committee packet, a 16-sheet formula workbook, and a live decision view, all checked by 65 unit tests and a 49-check validator."
demoUrl: "https://rahilbhavan.github.io/mara-credit-case/"
githubUrl: "https://github.com/RahilBhavan/mara-credit-case"
kind: "credit case"
completedDate: 2026-09-23
ogImage: "https://rahilbhavan.github.io/mara-credit-case/social-card.png"
---
![MARA credit case decision view](https://raw.githubusercontent.com/RahilBhavan/mara-credit-case/main/docs/screenshot.png)

## Overview

**The question:** A hypothetical lender receives a request for a $5.0M, 12-month secured revolver from MARA Holdings. What limit should the credit committee approve, and what has to be true before any money moves?

**The answer:** Approve a conditional **$3.0M** limit against the $5.0M request. Funding stays blocked until nine pre-funding conditions clear, among them verified ownership, a first-priority lien, enforceable control of the collateral, and a tested route from the collateral to repayment cash. If any of those stays unknown, the answer is decline.

**Scope:** MARA is a public-information case only. The facility, collateral, Base route, covenants, policy limits, rating, and portfolio are fictional. This is an independent project, not affiliated with or endorsed by Coinbase or MARA, and it does not claim MARA is a Coinbase customer.

## The Problem

### The borrower

From MARA's June 30, 2026 filing:

- $421.3M of cash and cash equivalents. About 30% sits in a majority-owned subsidiary and is designated for its operations.
- 35,577 bitcoin with a $2.1B fair value. 4,742 were loaned and 4,528 pledged, leaving 26,307 unrestricted.
- About $2.4B of debt, including a $150M line of credit due within a year, $48.1M of December 2026 notes, and $291.6M of notes holders can put in June 2027.
- A static liquidity screen leaves $96.8M after designated cash and near-term debt, and negative $194.8M if the June 2027 put is exercised.

These facts frame the borrower. The case does not treat MARA's reported bitcoin as collateral for this facility.

### The challenge

A large balance sheet does not make a small secured loan safe. The lender recovers from the collateral it controls, after stress, after costs, and only if it can turn that collateral into cash. The package has to show which constraint binds, why, and what the committee would need to see before it funds.

## The Answer

The limit is the lowest of four caps, rounded down to the nearest $100,000:

| Cap | Amount | Basis |
|---|---:|---|
| Obligor | $7.50M | Illustrative standalone capacity for the borrower |
| **Collateral** | **$3.05M (binding)** | $3,870,600 stressed proceeds ÷ 1.25x coverage, less $50,000 accrued = $3,046,480 |
| Single-name | $6.00M | Illustrative policy limit for one name |
| Concentration | $4.00M | Shared custody route and sector capacity in the fictional portfolio |

At the $3.0M limit, pro forma exposure is $3.05M and coverage is 1.27x. A fully drawn $5.0M request would leave a $1,179,400 recovery shortfall. The illustrative obligor rating is `3 / Watchful`, an ordinal judgment, not a probability of default.

## How It Was Built

### Approach

- **Freeze the evidence.** Five public sources are stored with SHA-256 hashes. A script pulls the issuer facts from the filing XBRL and reconciles them to the values in the memo.
- **One engine, many outputs.** A standard-library Python engine with `Decimal` arithmetic reads the case inputs, runs the collateral waterfall and the four caps for each scenario, and writes a decision record. Every PDF, the workbook, and the decision view are generated from that record.
- **Argue against it.** An opposing memo makes the strongest case against the recommendation, next to the credit memo.

### Checks

- **65 unit tests**, including monotonicity checks (more stress never raises the limit) and hard-blocker checks.
- **A 49-check validator** that reconciles the engine, workbook, memos, hashes, and outputs, and reports PASS, FAIL, or SKIP for each.
- **A 16-sheet workbook** of live formulas, audited cell by cell against the engine.

### What the package contains

- Two-page credit memo with the committee recommendation
- Opposing memo with the strongest case against it
- Committee packet: decision, thresholds, conditions, controls, and model risks
- Decision view: eleven scenarios, a collateral what-if lab, the decision surface, and the condition register
- Review package with every output, a start-here guide, and a SHA-256 manifest

## What to Open First

1. **Decision view**: [rahilbhavan.github.io/mara-credit-case](https://rahilbhavan.github.io/mara-credit-case/). Start with the decision summary, then move collateral in the what-if lab.
2. **Credit memo (PDF)**: [the two-page recommendation](https://rahilbhavan.github.io/mara-credit-case/credit-memo.pdf).
3. **Repository**: [github.com/RahilBhavan/mara-credit-case](https://github.com/RahilBhavan/mara-credit-case). The engine, tests, validator, and the opposing memo.

## Scope & Limits

- MARA is a public-information case only. The facility, collateral, Base route, covenants, policy limits, rating, and portfolio are fictional.
- Independent analysis, not affiliated with or endorsed by Coinbase or MARA. It does not claim MARA is a Coinbase customer.
- No private borrower data, facility documents, lien search, legal opinion, or wallet evidence was reviewed.
- The caps and costs are illustrative, not calibrated credit policy. No independent reviewer has reproduced the numbers yet.

---

**Completed:** September 23, 2026
