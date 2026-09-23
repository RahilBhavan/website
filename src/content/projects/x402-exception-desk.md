---
title: "x402 Exception Desk: Queueing Payment Exceptions on Base"
tagline: "Tests four queue rules for x402 payment exceptions across 3,600 synthetic scenarios"
description: "A synthetic settlement-to-delivery exception desk for x402 payments on Base: 65 events across 16 incidents through one deterministic reducer, four queue policies compared, and a 3,600-scenario sweep showing no policy wins every objective."
problem: "When a payment settles on chain but the paid-for resource never arrives, or a request times out with no clear outcome, an operator has to decide which case to handle first and what evidence makes a retry, recovery, refund, or closure safe. A wrong call can charge a customer twice or treat an approved refund as settled."
solution: "Built a standard-library Python desk where an append-only SQLite event log is the evidence boundary. One deterministic reducer turns synthetic events into case states, a separately written oracle checks every incident, and four queue policies run on the same workload and across a 3,600-scenario sweep. A 26-check consistency gate ties every generated file to one run."
demoUrl: "https://rahilbhavan.github.io/x402-exception-desk/"
githubUrl: "https://github.com/RahilBhavan/x402-exception-desk"
kind: "payments ops"
completedDate: 2026-09-23
---
![x402 exception desk operator report](https://raw.githubusercontent.com/RahilBhavan/x402-exception-desk/main/docs/screenshot.png)

## Overview

**The question:** When payment evidence and delivery evidence disagree on an x402 payment, which case should an operator handle first, and what evidence makes a retry, recovery, refund, or closure safe?

**The answer:** Keep FIFO. The proposed deadline-first queue cut value-weighted overdue time by 64% but left the same 6 cases overdue, so it failed a gate set before the run. Across 3,600 scenarios no policy wins every objective, so the queue rule should follow from the objective a team picks.

**Scope:** All data is synthetic. The desk makes no live payments. Independent project, not affiliated with or endorsed by Coinbase, and it does not describe any Coinbase system or process.

## The Problem

For an x402 payment on Base, payment and delivery are separate facts, and they can disagree: the chain shows a payment but the resource never arrived, a request times out with no clear result, or a refund is approved but not yet settled. Each disagreement becomes a case an operator has to resolve.

The state model keeps four facts apart:

- A timeout means the outcome is unknown, not failed, so it never triggers a new charge.
- Chain evidence shows payment, not delivery.
- A refund approval reserves balance but is not a settled refund.
- One piece of payment evidence cannot pay for two orders.

## The Answer

The desk replays 65 synthetic events across 16 incidents, then runs the 9 actionable cases through four queue policies on the same workload:

| Policy | Overdue cases | Median delay (min) | p95 delay (min) | Value-weighted overdue (USDC-minutes) | Control failures |
|---|---|---|---|---|---|
| FIFO (baseline) | 6 | 66.1 | 107.1 | 4,428.9 | 0 |
| Deadline-first (proposed) | 6 | 55.1 | 107.1 | 1,582.2 | 0 |
| Value-first | 4 | 47.1 | 137.1 | 1,371.9 | 0 |
| Hybrid (SLA window, then value) | 4 | 77.1 | 127.1 | 982.1 | 0 |

Deadline-first had to cut overdue cases by at least 15% with zero control failures. It did not. Value-first and hybrid cut overdue cases to 4, but they were added after the gate was set, have not run on a held-out workload, and have a worse p95 delay than FIFO.

### The sweep

3,600 scenarios: 100 seeds x 1 to 3 operators x 0.5x/1x/2x handling time x evidence delay x finality delay. Share of scenarios where each policy had the best result:

| Objective | FIFO | Deadline-first | Value-first | Hybrid |
|---|---|---|---|---|
| Fewest overdue cases | 9.7% | 20.8% | **51.7%** | 17.8% |
| Least value-weighted overdue time | 7.4% | 22.0% | 30.1% | **40.5%** |
| Lowest p95 delay | **50.0%** | 11.1% | 17.6% | 21.3% |

Ties split the credit. Control failures tie at 25% each because the seeded failures belong to the workload, not to the queue order.

## How It Was Built

### Approach

- **The event log is the evidence boundary.** An append-only SQLite store holds the events, and every projection, reconciliation row, operator view, and policy result derives from them.
- **One deterministic reducer.** Events are grouped by case and reduced to payment, delivery, and refund state, with the allowed and forbidden next actions for each case.
- **Payment shapes from the public spec.** Events follow the public x402 v2 specification and Base finality documentation.
- **Standard library only.** No third-party Python packages.

### Checks

- A separately written oracle states the expected outcome of all 16 incidents. The reducer matches it 16 of 16.
- A 26-check consistency gate ties every generated file to one run ID and to the fixture, oracle, and workload hashes.
- A release script runs the tests, regenerates outputs, runs the gate, checks the memo, workbook, and video against recorded hashes, and rebuilds a deterministic release archive. CI runs it on Python 3.9 and 3.11.

## What to Open First

1. **Operator report**: [rahilbhavan.github.io/x402-exception-desk](https://rahilbhavan.github.io/x402-exception-desk/). Each case's evidence timeline, payment, delivery, and refund state, and the policy comparison.
2. **Decision memo (PDF)**: [the policy decision and the strongest argument against FIFO](https://github.com/RahilBhavan/x402-exception-desk/blob/main/artifacts/operations-memo.pdf).
3. **Repository**: [github.com/RahilBhavan/x402-exception-desk](https://github.com/RahilBhavan/x402-exception-desk). The reducer, oracle, state model, and operator runbook.

## Scope & Limits

- All data is synthetic: incidents, amounts, identities, handling times, arrival rates, and every result.
- No live payments. The desk uses no wallet, signs nothing, calls no facilitator, and sends no transactions.
- Handling times are model inputs, not measurements, so the policy results show tradeoffs, not a production recommendation.
- No payments practitioner has reviewed the workflow yet.
- Independent project, not affiliated with or endorsed by Coinbase, and it does not describe any Coinbase system or process.

---

**Completed:** September 23, 2026
