---
title: "OpenEden RWA Intelligence Suite"
tagline: "Competitive, on-chain velocity, and USDO supply analysis for a tokenized T-bill protocol"
description: "Competitive analysis, on-chain velocity research, and USDO supply cohort modeling for OpenEden's RWA protocol suite (PRISM + USDO)."
problem: "OpenEden needed clear, reproducible analysis on competitive positioning, on-chain usage (velocity) on XRPL vs Ethereum, and drivers behind USDO supply drawdowns, in a form that could be validated and handed off."
solution: "Delivered three modules: (1) competitive landscape and objection handling, (2) on-chain velocity, chain prioritization, and 90-day actions, (3) supply cohort modeling with scenario planning and cohort-flow artifacts, with cached raw data, analysis scripts, and unit tests."
kind: "consulting"
featured: true
completedDate: 2026-02-27
---
## Overview

**What it is:** A consulting engagement delivering three research modules for OpenEden's RWA products, PRISM, USDO, and TBILL, with reproducible pipelines, charts, and tests. Python and pandas throughout; every deliverable is a Markdown report generated from cached data.

**Why it matters:** OpenEden needed clear, reproducible analysis on competitive positioning, on-chain usage (velocity) on XRPL vs Ethereum, and the drivers behind USDO supply drawdowns, in a form that could be validated and handed off.

**Impact:** Three modules shipped: competitive landscape and objection handling; on-chain velocity, chain prioritization, and a 90-day action plan; and a USDO supply scenario model with cohort-flow artifacts. Raw data is cached, transformations have unit tests, and the pipeline can be re-run to refresh the reports.

## What shipped

### Module 1: Competitive Landscape

Competitive matrix for PRISM vs tokenized yield peers (Ondo, Maple, Superstate, Hamilton Lane), plus a value prop and investor objection handler with confidence levels and sourcing where available.

- **Outputs**: Competitive matrix, notes on apples-to-oranges comparisons
- **Scope**: What's knowable today vs what's undisclosed or needs verification

### Module 2: On-chain Velocity and Holder Behavior

XRPL vs Ethereum TBILL activity analysis, a Doppler Finance case study, a weighted chain priority matrix for USDO expansion, and three concrete 90-day recommendations to move XRPL from "storage" to "velocity".

- **Outputs**: Case study, chain scoring model, 90-day action plan
- **Finding**: Large velocity gap between XRPL and Ethereum TBILL transfer activity

### Module 3: USDO Supply Scenarios and Cohort Context

A 12-month bear/base/bull scenario model for USDO supply, plus a root-cause analysis of the post-incentive drawdown using cohort boundaries derived from structural inflection points in the supply series.

- **Outputs**: Scenarios and actions, hypotheses H1/H2/H3 with noted data gaps
- **Artifact**: Cohort-flow diagram for "peak to steady state" retention

## Artifacts (charts and cohort flow)

![Monthly transfer activity comparing XRPL and Ethereum TBILL token velocity](/images/projects/openeden/module2_chart1.png)

*Module 2: Monthly transfer activity, XRPL vs Ethereum (velocity signal).*

![Cumulative transfer counts plotted against unique holder snapshots](/images/projects/openeden/module2_chart2.png)

*Module 2: Cumulative transfers vs unique holders (activity concentration).*

![Estimated holder archetype breakdown by monthly transfer activity](/images/projects/openeden/module2_chart3.png)

*Module 2: Holder archetypes by transfer behavior (who drives velocity).*

### Module 3: Cohort flow

USDO cohort flow from peak supply to steady state, with retention vs redemptions. Derived from aggregate supply data (not per-wallet). Values from the DeFiLlama stablecoins API, USDO (ID 241), as of 2026-02-27.

| Stage | Cohort | Supply |
|---|---|---|
| Sources | Cohort A (baseline) | $50.1M |
| Sources | New incentive capital | $248.7M |
| Peak supply | Cohort B (peak) | $298.8M |
| Post-drawdown | Cohort C (retained) | $89.5M |
| Post-drawdown | Redeemed (B to C) | $209.3M |
| Steady state | Cohort D (steady) | $63.1M |
| Steady state | Redeemed (C to D) | $26.4M |

## How it's built

Raw data is cached, transformations have unit tests, and the analysis produces Markdown deliverables so the work can be re-run or updated.

### Project structure

```
openEden Consulting Project/
├── reports/                 # Final deliverables (Markdown)
├── data/                    # Cached raw + processed artifacts (timestamped)
├── src/
│   ├── collectors/          # Data ingestion (RWA.xyz, DeFiLlama, etc.)
│   ├── analytics/           # Metric computation + cohort analysis
│   └── formatters/          # PDF generation, report artifacts
└── tests/                   # Unit tests for transformations
```

### Runbook

```bash
cd "openEden Consulting Project"

# Run the full pipeline (collect, then analyze)
make run-all

# Run tests
make test
```

## Takeaways

- **Velocity is not custody**: XRPL holds a large share of tokenized T-bills but shows much lower TBILL transfer volume than Ethereum, driven by composability and secondary-market rails.
- **Supply drawdowns are cohort-shaped**: USDO's post-incentive contraction fits a cohort retention problem (peak to steady state retention) rather than a "single narrative" issue.
- **Sourcing and uncertainty**: Claims are sourced or flagged with `[ASSUMPTION]`/`[DATA: as of]`; low-confidence comparisons are called out.

---

**Completed:** February 27, 2026
