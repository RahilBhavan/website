---
title: "DAT Accretion Monitor: Three Treasuries, One Per-Share Ruler"
tagline: "Tracks capital actions at Strategy, BitMine, and SharpLink against net coins per share"
description: "A public-filings model of how capital actions at three digital-asset treasuries change net coins per share, with break-even prices, source-linked data, a one-page memo, and a reproducible check."
problem: "Digital-asset treasury companies issue and repurchase common and preferred shares while buying or staking coins. Headlines about coin holdings alone do not show how those actions affect the net coin claim of each common share, and company metrics are hard to compare directly."
solution: "Applied Strategy's published net coins per share definition to Strategy, BitMine, and SharpLink; parsed their public filings into dated actions and balances; calculated each action's per-share effect and break-even price; and published an interactive map, attribution bars, data, method, and one-page memo."
kind: "financial analysis"
demoUrl: "https://rahilbhavan.github.io/dat-accretion/"
githubUrl: "https://github.com/RahilBhavan/dat-accretion"
completedDate: 2026-09-28
---

## Overview

**The question:** What does each disclosed capital action do to net coins per share, and at what share or preferred price does that effect change sign?

**The result:** Through the September 20, 2026 filing week, Strategy's STRC rotation was on the adding side of its break-even line on 18 of 18 filed dates. BitMine's BMNP rotation was on that side on 0 of 15 weeks with a BMNP price. SharpLink has no preferred-stock rotation; on its four filed ETH-holdings dates, its net mNAV was below 1. These are measurements under the stated definition, not judgments about management decisions.

**Scope:** Independent analysis of public filings and market closes. No affiliation with Strategy, BitMine, or SharpLink, and no investment recommendation or forecast.

## What I built

- A static [interactive page](https://rahilbhavan.github.io/dat-accretion/) with a break-even map, weekly attribution bars, and filing links.
- A [one-page memo](https://github.com/RahilBhavan/dat-accretion/blob/main/docs/memo.pdf) explaining the common ruler and each company's latest measured position.
- A [public method](https://github.com/RahilBhavan/dat-accretion/blob/main/docs/methodology.md), action and balance CSVs, and Python code that rebuilds the figures from source documents.
- A check script that compares reconstructed Strategy metrics with its published KPI API and tests filing-linked attribution. The saved September 26 check reports a pass.

Strategy's net coins per share definition starts with coins plus USD assets, subtracts the applicable debt and preferred claims, and divides by fully diluted shares. The model applies that definition to BTC for Strategy and ETH for BitMine and SharpLink. For Strategy and BitMine, it plots net mNAV against preferred market price divided by notional. SharpLink's common issuance and buybacks are evaluated without a preferred-stock line.

## Limits that matter

- BitMine's share count is estimated between disclosed anchors; the estimate and its sensitivity are labeled in the memo.
- SharpLink states ETH holdings on only four dates in the analyzed period. The model does not invent values for intervening weeks.
- The displayed conclusions use filing-date inputs and the stated metric. They do not measure future returns or whether a transaction was a good decision.

## Open the work

1. [Live DAT Accretion Monitor](https://rahilbhavan.github.io/dat-accretion/)
2. [One-page memo](https://github.com/RahilBhavan/dat-accretion/blob/main/docs/memo.pdf)
3. [Method, code, and data](https://github.com/RahilBhavan/dat-accretion)

---

**Completed:** September 28, 2026
