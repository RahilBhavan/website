---
title: "MEV Sandwich Study: Two-Phase Clearing on Uniswap"
tagline: "One week of Uniswap v3 sandwich losses, replayed through per-block clearing"
description: "An exact replay of one week of Uniswap v3 WETH/USDT swaps that measures sandwich losses, then re-clears each block under Chan, Wu and Shi's per-block two-phase mechanism as a counterfactual."
problem: "A sandwich attacker buys just ahead of a victim's swap and sells right after it, so the victim gets a worse price. Researchers have proposed per-block clearing rules that should remove the attacker's profit, but it is hard to know how much loss such a rule would prevent on real order flow."
solution: "A Python pipeline ports Uniswap v3's integer swap math, reproduces every swap of one week on the WETH/USDT 0.01% pool, and detects sandwiches. It measures each victim's loss against a replay with the attacker removed, then re-clears every sandwich block under the two-phase mechanism of Chan, Wu and Shi (AFT 2025)."
result: "In one week on one WETH/USDT pool, 236 sandwiches cost 244 victims $12,387. Replaying the same orders through two-phase clearing cut that to $3,041, a counterfactual."
status: "prototype"
verification: "70,669 of 70,669 swaps replayed bit-exactly, and 19 tests passed on Oct 21, 2026. A local copy of Dune's rule confirms 99.6% of sandwich blocks. A human Etherscan spot-check is pending."
next: "The counterfactual replays the observed orders, so it cannot say how bots, builders and traders would respond. One pool and one week are one sample, not a yearly rate."
figure:
  src: "/images/projects/mev-sandwich-study-two-phase-clearing-on-uniswap/cumulative-loss.webp"
  alt: "Step chart of cumulative victim loss over 236 sandwiches ranked by loss: $12,387 in the status quo, $3,041 with the same orders under per-block clearing, and about $0 if attackers stop."
  caption: "Uniswap v3 WETH/USDT 0.01%, October 5 to 11, 2026. The two lower lines are counterfactual replays, the middle one the mean of 200 random tie-breaks."
kind: "research"
track: "crypto"
featured: false
githubUrl: "https://github.com/RahilBhavan/mev-sandwich-batch-study"
completedDate: 2026-10-21
---

## Overview

**The question:** In one week, how many swaps on the Uniswap v3 WETH/USDT 0.01% pool were sandwiched, how much did the victims lose, and how much of that loss would Chan, Wu and Shi's per-block two-phase mechanism have prevented?

**The answer:** From October 5 to 11, 2026, 236 sandwiches hit 244 victims, who lost $12,387. Replayed through the mechanism, no sandwich makes money for its attacker. If attackers stop, victims keep about 100% of that loss. If the same orders arrive anyway, victims keep 75% on average across 200 random tie-breaks.

**Scope:** A counterfactual on one pool and one week. Independent research, not affiliated with the paper's authors, Uniswap, Dune or any MEV searcher.

## How it works

1. `scripts/ingest.py` pulls the week's Swap, Mint and Burn logs, the transactions and the pool's starting state from a free archive RPC endpoint.
2. `scripts/replay.py` checks that `mev/v3.py`, a Python port of Uniswap v3's integer swap math, reproduces every swap. The gate requires 100% of swaps to match amounts and post-swap pool state.
3. `mev/detect.py` finds sandwiches: a front-run and a back-run in the same block, in opposite directions, with a victim trading between them, and a back-run that sells 90 to 110% of what the front-run bought.
4. Each victim's loss is its output with every attacker swap removed minus its actual output.
5. `mev/mechanism.py` re-clears each sandwich block. Phase 1 fills the minority side at the block's starting price without moving the pool. Phase 2 runs the rest of the dominant side one order at a time, each stopped at its own limit price.

## Results

Uniswap v3 WETH/USDT 0.01%, October 5 to 11, 2026 UTC, blocks 26,122,440 to 26,172,657.

| Finding | Value |
|---|---|
| Swaps in the week | 70,669 |
| Sandwiches found | 236 (193 at the strict ±1% amount match) |
| Victims and their loss | 244 victims lost $12,387 |
| Attacker gross and gas | $8,713 gross, of which $4,400 (50%) went to gas |
| Slippage taken | 98% of victims' decodable slippage tolerance ($1,544 of $1,582) |
| Attacker profit under the mechanism | No sandwich makes money in any run |
| Loss victims keep, same orders | 75% on average across 200 tie-breaks (5th to 95th percentile 68 to 84%) |
| Loss victims keep if attackers stop | About 100% |

The same pipeline, run unchanged on the SIMD/WETH 0.01% memecoin pool for the same week, found 240 sandwiches and $1,330 lost. One automated buyer carried 95% of that loss. No attack pays under the mechanism there either, and victims keep 73% on average with the same orders.

## How it was checked

- **Exact replay.** 70,669 of 70,669 swaps reproduce bit-exactly, 4,041 of them across liquidity changes. A wrong fee breaks 70,645 swaps, which shows the gate can fail.
- **Tests.** `19 passed` on October 21, 2026, covering the v3 math, calldata decoding, the detector and the mechanism's rules.
- **Detection cross-check.** A local re-implementation of Dune's spellbook rule confirms 99.6% of the study's WETH/USDT sandwich blocks and 100% on SIMD/WETH.
- **Precision.** 30 of 30 randomly sampled hits have sandwich structure. The AI agent that built the pipeline did that review from receipts and read Etherscan pages for 5 hits.

## Limits and next steps

- The counterfactual replays the observed orders. It cannot say how bots, builders and traders would respond to the mechanism.
- One pool and one week. A week is one sample, not a yearly rate.
- The study pool is the busiest WETH/USDT pool, not the busiest pool. A later scan found v3 USDC/WETH 0.01% has about 2.4 times the swaps.
- The detector sees only same-block, single-pool sandwiches.
- Builder payments by internal ETH transfer are not counted, so attacker profit net of gas is an upper bound.
- A human Etherscan spot-check is still pending, and the Dune query in `docs/dune/` has not been run on Dune itself.

## Links

1. [Repository](https://github.com/RahilBhavan/mev-sandwich-batch-study)
2. [Methods note](https://github.com/RahilBhavan/mev-sandwich-batch-study/blob/main/docs/methods.md)
3. [Chan, Wu and Shi, "Mechanism Design for Automated Market Makers"](https://arxiv.org/abs/2402.09357)

---

**Completed:** October 21, 2026
