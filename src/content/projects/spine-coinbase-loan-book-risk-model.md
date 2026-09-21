---
title: "Spine: Coinbase Loan Book Risk Model"
tagline: "Live risk dashboard and liquidation backtest over Coinbase's $1.6B Morpho loan book"
description: "A live risk dashboard and liquidation-queue backtest over Coinbase's on-chain loan book on Morpho (Base): $1.6B of debt, 67,000+ positions, replayed through seven crash paths to argue what haircut BTC and ETH collateral should take."
problem: "Coinbase lends USDC against cbBTC and ETH on Morpho at an 86% liquidation LTV. The book has survived three real stress events with zero bad debt, but those events gave borrowers hours of warning. Nobody had replayed today's book through a March 2020 style cliff with liquidators and borrowers behaving the way the lived events show they behave."
solution: "Built a stdlib-only Python pipeline that fetches every position, liquidation, oracle update, and order book snapshot from public sources, calibrates liquidator latency and borrower response on the three lived events, and replays the book through seven historical crash paths under alternative LLTVs and liquidator capacity scenarios. The result is an hourly-refreshed dashboard on GitHub Pages and a written recommendation per asset."
demoUrl: "https://rahilbhavan.github.io/spine"
githubUrl: "https://github.com/RahilBhavan/spine"
kind: "risk model"
featured: true
completedDate: 2026-09-19
---
## Overview

**What it is:** A live risk dashboard and haircut backtest over Coinbase's on-chain loan book, the Morpho Blue markets on Base where Coinbase lends USDC against cbBTC, WETH, cbETH, and six alt collaterals. The pipeline pulls every position and liquidation from public data, measures how liquidators and borrowers actually behaved in the three stress events the book has lived through, and replays today's book through seven historical crash paths to see what a lender would lose.

**Why it matters:** The book is $1.6B of debt against $3.5B of collateral across 67,000+ positions in nine markets, 97.5% of it Coinbase Smart Wallets. Bad debt on Morpho is socialized to USDC suppliers, which includes depositors in the Coinbase USDC lending product. The zero-bad-debt record is real, but the lived crashes were slow; the question is what happens on a fast one.

**Who it's for:** Risk teams at lenders and protocols, USDC suppliers to these markets, and anyone who wants a reproducible answer to "what haircut should this collateral take" rather than a rule of thumb.

**Impact:** A public dashboard that refreshes hourly, a written recommendation per asset (cbBTC 86% to 80% LLTV with a committed backstop liquidator first, WETH 77%, alt book caps tied to Coinbase's own depth), and a changelog showing how the answer moved as bugs were fixed. Every number in the writeup is printed by a script from generated data.

## The Problem

### The Challenge

Coinbase lends USDC against cbBTC and ETH on Morpho (Base) at an 86% liquidation LTV with a 4.38% liquidation bonus. The cbBTC market alone is $1.41B of debt against $2.86B of collateral, 39,000 positions. It has been through three real stress events (Oct 2025, Feb 2026, Jun 2026), cleared $256M of liquidations in the four stress weeks alone, and taken zero bad debt.

That record is not the test. The lived events gave borrowers hours to days of warning before liquidation; March 2020 gave 25 minutes. A -10% instantaneous move puts $30M of debt over the 86% line; -20%, $112M; -30%, $336M.

**Specific issues:**
- Static shock tables say how much debt crosses LLTV, not whether it can be liquidated before it goes underwater
- Liquidator capacity in a crash is unobserved; the only measurement is a day when it did not bind
- Borrowers cure positions during slow crashes, so a frozen-book replay overstates liquidations
- Coinbase does not, on the public record, liquidate its own book

**Who was affected:**
- USDC suppliers to the Morpho markets, who absorb any bad debt
- Coinbase, which sets the LLTV and origination cap
- Borrowers, whose liquidation frequency depends on the origination cap

### Existing Solutions

Morpho's own Dune dashboard shows the static liquidatable-debt curve and puts $1.1B of collateral at risk at -50%. RiskDAO's SmartLTV formula gives a closed-form LTV from volatility and liquidity, but for cbBTC it returns 0.9% at its mildest calibration and negative at the others: with $44M of measured bids inside the 4.38% bonus against a $1.42B book, it is saying the book is thirty times too large for the liquidity at the bonus, not that the LLTV is wrong.

**Gap identified:** No public model replayed this book through a queue with finite liquidator capacity, a lagged oracle, and calibrated borrower response.

### Constraints & Requirements

**Technical constraints:**
- Morpho's API caps queries at 1,000 rows and skip at 10,000; cbBTC has tens of thousands of positions
- Base RPC returns logs in 2,000-block windows
- Historical order books are paid data; depth had to be scaled from live snapshots
- Everything had to run on a GitHub Actions schedule and publish to GitHub Pages with no server

**Resource constraints:**
- One person, stdlib Python for every fetcher, numpy only in the backtest
- Every script had to be resumable within a time budget so the hourly refresh could make progress

## The Solution

### Approach & Methodology

The repository is two lanes that meet through files, not function calls. Lane A is the live book: fetch positions and liquidations, tag Coinbase Smart Wallets, fetch depth, summarize to `summary.json`, and render the dashboard. Lane B is model evidence: fetch five-minute price paths for seven crash windows, fetch Chainlink oracle updates, calibrate liquidator behaviour on the lived events, rebuild historical books from transaction history, and run the backtest.

**Methodology:**
- **Measure the lived events first.** Every liquidation in the three stress events, valued at the Chainlink price in the liquidation block, gives latency, bonus, throughput, and how often bots close in full.
- **Fit borrower response.** A two-parameter model (responsive share, reaction time) fit on the three cbBTC events.
- **Replay today's book.** Drop it onto each crash path at five-minute resolution with a queue served largest-first from finite capacity.
- **Report two numbers per path.** Loss realized by the end of the path, and exposure at the lowest print. The second becomes the first if the price does not bounce.

### Technology Stack

**Data sources (all public):**
- Morpho GraphQL API: positions, liquidations, transaction history
- Base JSON-RPC: Multicall3 wallet tagging, Chainlink `AnswerUpdated` logs
- Coinbase Exchange: 5-minute candles and L2 order book
- Uniswap and Aerodrome quoters on Base: on-chain swap capacity by slippage

**Software:**
- Python standard library for every fetcher (hand-encoded ABI calls, no Web3 dependency)
- numpy for the backtest
- pytest for the deterministic algorithms and file contracts
- Plotly in a static `site/` for the dashboard

**Infrastructure:**
- GitHub Actions: hourly refresh runs the live pipeline, advances the resumable backtest, commits generated artifacts, and deploys to GitHub Pages
- The repository is the data store and the audit log

**Why this stack:**
- Stdlib fetchers keep scheduled jobs cheap and dependency-light
- Static publication means zero infrastructure and full transparency
- Generated tables over hand-typed numbers stop the writeup drifting from the model

### Architecture & Design Decisions

**Resumable, overlap-safe fetchers.** Every long script takes `--max-seconds`, checkpoints under `data/cache/`, and resumes. The liquidation fetcher pages backward by timestamp, overlaps the previous saved day, deduplicates by `(transaction, borrower)`, and aborts the write on a count mismatch. The position fetcher compares its assembled count with a fresh unbanded count and retries up to three times rather than write an inconsistent snapshot.

**Wallet tagging without a proprietary list.** A borrower is classified by its ERC-1967 implementation address, checked about 1,000 wallets per RPC call through a hand-built Multicall3 request, with a per-wallet `eth_getStorageAt` fallback.

**Historical books by event replay.** Morpho's historical position snapshots were judged unreliable, so `rebuild_book` walks Borrow, Repay, SupplyCollateral, WithdrawCollateral, and Liquidation transactions and applies deltas per borrower, emitting the same schema as the live fetcher.

**Three capacity scenarios.** A: on-chain bots only (Base DEX depth). AB: plus liquidators who seize cbBTC and sell BTC on Coinbase and Kraken, which matches observed behaviour. ABC: plus Coinbase itself redeeming cbBTC 1:1, effectively unlimited depth. Nothing public says ABC exists; it is what a commitment would buy.

**Trade-offs:**
- Real crash paths over synthetic ones: legible and auditable against named events, but seven paths do not exhaust future risk
- Static largest-debt-first service order: fast and deterministic, but partial repayment does not re-rank a wallet
- Live depth times stress multipliers: uncertainty is exposed through sensitivities rather than bought historical order books

### Key Features

1. **Live dashboard**: LTV distribution, liquidatable-vs-capacity curve, liquidation history, per market, refreshed hourly
2. **Calibration on lived events**: latency, bonus, throughput, concentration, full-close share, and warning time for 23,000+ liquidation events
3. **Liquidation-queue backtest**: seven crash paths, LLTV and origination cap grid, capital multiples, borrower response sensitivity, held-at-the-low variants
4. **Origination cap rule**: cap = LLTV x (1 - p95 seven-day drawdown), per asset
5. **Generated writeup**: every table printed by `writeup_tables.py` and `caps.py` from JSON artifacts, rendered to the site

## Technical Highlights

### The backtest defaults

Every run is keyed on its parameters, so results append to `data/backtest.json` and runs already there are skipped. The Tier B capital cap defaults to the most collateral the book has ever seen seized in a UTC day, read from the calibration file.

```python
def cex_cap_default():
    """Max single-UTC-day collateral seized on cbBTC across the calibration windows (Feb 5 2026): the observed ceiling on Tier B
    inventory. Seized (market value of collateral), not repaid, because that is what the ring charges against the cap.
    Rounded to $0.1M so the value is stable across calibration reruns: it is part of every run key."""
    days = [d['seized_usd'] for w in (load('calibration') or {'windows': {}})['windows'].values() for d in w.get('cbBTC', {}).get('daily', {}).values()]
    return round(max(days), -5) if days else 101.1e6


DEFAULTS = dict(lltv=0.86, cap=0.75, scenario='AB', k_dex=0.5, k_cex=0.3, r=0.2, lag_bars=1, reshape=True,
                warn_gap=0.06, resp_share=0.0, react_min=60, cure=0.0, margin=0.01, cex_cap_usd=cex_cap_default(),
                close_target=1.0, full_below_usd=0.0, beta=0.0, seed=0, hold_bars=0, book_multiple=1.0)
```

### What `simulate()` does at each five-minute step

1. Rolls the trailing 24-hour CEX-capital ring buffer
2. Replenishes DEX and CEX capacity, optionally shrinking it after large hourly returns
3. Advances the lagged oracle separately from market price
4. Accumulates warning-zone time and lets designated borrowers cure
5. Queues positions over LLTV
6. Computes full or target-LTV liquidations
7. Refuses unprofitable liquidation when the market has outrun the oracle bonus
8. Serves the queue from capacity, largest debt first
9. Records realized shortfall, remaining underwater debt, queue times, volume, and trough exposure

Positions are sorted by initial liquidation price so a calm bar costs one `searchsorted`; crash bars work on contiguous slices in 1,024-position chunks.

**Key Technical Decisions:**

1. **Full closes, measured by debt repaid.** A first cut counted 28-50% full closes because dust shares survive a full close. Measured by debt repaid, 80-94% of lived liquidations closed the position, and the median "partial" repaid 99.99%. The model closes in full.
2. **Loss and exposure both reported.** End-of-path loss depends on the bounce; trough exposure depends on liquidator capital. A lender does not get to choose which one it is judged on.
3. **Depth collapse off by default.** Anchored on Kaiko's Oct 10 2025 measurement, it under-predicts the liquidations that actually happened that day by 40%, so it stays a sensitivity.

## Process & Timeline

### Phase 1: Live book and dashboard

- Position, liquidation, and depth fetchers; Coinbase wallet tagging; `summarize` and the static site
- Hourly GitHub Actions refresh and Pages deploy

### Phase 2: Calibration on lived events

- Chainlink oracle paths for the three stress windows
- Latency, bonus, throughput, concentration, and full-close share per window
- Historical books rebuilt from events for Oct 2025, Feb 2026, Jun 2026

### Phase 3: Backtest and writeup (v1 to Phase G, Sep 15 to Sep 19, 2026)

- Queue model, three capacity scenarios, LLTV and cap grid
- Borrower response fit, partial-liquidation and depth-collapse sensitivities
- Held-at-the-low table, alt replays, book-size sweep, generated tables and rendered writeup

## Challenges & Solutions

### Challenge 1: A frozen book overstated every lived event

**The Problem:** Replaying the exact cbBTC book from Feb 3 2026 ($1,075M debt) at the Feb 6 trough puts $515M of debt over 86%. Only $151M was actually liquidated. Without borrower response the model overstates the three events by 2.0x, 2.9x and 1.7x.

**The Solution:** A responsive share of borrowers who repay to 74% LTV once they have spent a reaction time inside the 80-86% warning zone. Fitting on the three cbBTC events gives 70% responsive with a two-hour reaction, reproducing all three within 15% (Feb 0.99x, Jun 0.85x, Oct 0.95x). Held-out WETH comes in at 1.58x and 0.85x.

**What I learned:** The fit is a plateau (60-70% responsive, one to two hours all fit about equally), and two parameters on three events deserve modest confidence. The ranking of effects holds even where the point estimates do not.

### Challenge 2: Miscounting full closes flipped the answer

**The Problem:** Counting liquidations that left any shares behind as "partial" gave 28-50% full closes, which pushed v2 of the model to calm-day partial-liquidation behaviour and a March 2020 loss of $140M (8.9% of supply).

**The Solution:** Measure by debt repaid. 80-94% of lived liquidations repaid the whole debt. Switching the model to full closes brought the realized loss to single-digit millions and moved the argument to trough exposure, which the LLTV does not fix.

**What I learned:** Get the calibration sample right before tuning the model to it.

### Challenge 3: Liquidator capital is the biggest lever and the least known input

**The Problem:** Peak throughput on Feb 5 2026 was $96.8M repaid in a day ($101M of collateral seized). That day was not binding, so it is a floor on capacity, not an estimate.

**The Solution:** Treat it as a rolling 24-hour cap measured in seized units, and sweep it at 1x, 3x, 10x, and unlimited. On March 2020 at 86% LLTV, tripling capital takes trough exposure from 10.0% to 6.2% of supply; the LLTV alone buys about a point.

**What I learned:** The recommendation had to lead with a backstop liquidator and put the LLTV second, because that is the ordering the sensitivities show.

## Results & Metrics

### The book

- $1.6B debt, $3.5B collateral, 67,000+ positions across 9 markets; 97.5% of borrow from Coinbase Smart Wallets
- cbBTC/USDC 86%: $1.413B borrowed, $2.860B collateral, utilization 90%, book LTV 49%, largest position $5.2M
- Realized bad debt across all nine markets since inception: $0.07

### Lived events (cbBTC, valued at the Chainlink price in the liquidation block)

| Window | Liquidations | Repaid | Latency p50 / p90 | Within 60s | Liquidators |
|---|---|---|---|---|---|
| Oct 9-12 2025 | 410 | $17.6M | 4s / 70s | 90% | 21 |
| Feb 2-8 2026 | 4,116 | $150.8M | 2s / 88s | 87% | 46 |
| Jun 1-7 2026 | 3,308 | $72.1M | 0s / 6s | 97% | 110 |
| Jun 23-27 2026 | 394 | $15.4M | 0s / 6s | 98% | 43 |

### Backtest headline (cbBTC at 86% / 75%, scenario AB, fitted behaviour)

| Path | Worst 4h / 24h | Liquidated | Loss by end of path | Exposure at trough |
|---|---|---|---|---|
| Mar 2020 | -35% / -50% | $618.3M | $9.2M (0.6%) | $158.4M (10.0%) |
| May 2021 | -26% / -32% | $356.5M | $0.28M (0.0%) | $17.1M (1.1%) |
| FTX Nov 2022 | -15% / -19% | $64.6M | 0 | 0 |
| Aug 2024 | -11% / -20% | $81.5M | 0 | 0 |
| Oct 2025 | -10% / -13% | $18.0M | 0 | 0 |
| Feb 2026 | -9% / -18% | $94.6M | 0 | 0 |
| Jun 2026 | -7% / -9% | $25.7M | 0 | 0 |

Percentages are of the $1.58B USDC supplied to the market.

### Recommendation

| Collateral | Today (LLTV / max draw) | Recommended |
|---|---|---|
| cbBTC | 86% / 75% | A committed backstop liquidator first; then 80% / 66-70% |
| WETH | 86% / 75% | 77% / 70% |
| cbXRP, SOL, cbDOGE, cbADA, cbLTC, JitoSOL | 62.5% / 55% | 62.5%, max draw 47%, plus a per-asset book cap tied to Coinbase's own order-book depth |

### Engineering

- 79 commits, 2,412 lines of Python across the `spine/` package, 12 tests
- Every fetcher stdlib-only and resumable; `backtest.py` needs numpy
- Hourly refresh and Pages deploy via GitHub Actions

## Learnings

### What Worked Well

- Files as the interface between stages: every artifact is inspectable, cacheable, and publishable
- Measuring the lived events before modelling them: latency and full-close share came from data, not assumption
- Reporting loss and exposure side by side, which is what made the backstop-first recommendation legible

### What Didn't Work

- The first full-close count (28-50%) was wrong and sent v2 in the wrong direction
- The depth-collapse term, applied literally, contradicts the liquidations that happened on Oct 10 2025
- Python's JSON writer emits `Infinity` for unlimited-capital rows, which the browser patches before parsing

### How the answer moved

The cbBTC row is the one that moved. WETH has read 77% / 70% since the first draft; the alts have read 62.5% plus a size cap since the first draft, with the max draw cut to 47% in v2. Numbers below are as each version printed them.

| Date | Change to the model or data | cbBTC recommendation | March 2020 at 86% |
|---|---|---|---|
| 2026-09-15 (v1) | Today's book reshaped by haircut, full seizure, constant depth, borrower response fit on the three lived events (70% responsive, 2 h) | 80% / 70%, or keep 86% with a disclosed backstop | $64M bad debt (4.1% of supply) |
| 2026-09-15 | Bad-debt double count and stale queue flag fixed; depth-collapse sensitivity added | 80% / 70% and a pre-liquidation band | $24M (1.5%) at 30% surviving depth; $62-76M if depth collapses 90% |
| 2026-09-17 (Phase A) | Capacity margin below the bonus; Tier B liquidator capital capped at the observed daily maximum ($96.8M); calibration asserted within 25% of the three lived events | Backstop liquidator first; then 80% / 70% | $34-72M (2.2-4.6%) across the capital range |
| 2026-09-17 | Tier B cap moved to a rolling 24 h window and measured in seized units | Unchanged | $23-81M (1.5-5.1%) |
| 2026-09-18 (Phase E, v2) | Partial liquidations (repay to 74%, full close under $2.5k), vol-driven depth collapse, seed and liquidation-style sensitivities, origination cap from the p95 weekly drawdown | Cliff protocol first (full closes, backstop capital); then 80% / 66-70% | $140M (8.9%) under calm-day liquidator behaviour; $76M with full closes |
| 2026-09-18 (v3) | Full closes measured by debt repaid (80-94% of lived liquidations, not 28-50%); the model closes in full; beta off by default; exposure at the trough reported next to realized loss | Backstop liquidator first; then 80% / 66-70% | $10M realized (0.7%), $164M exposed at the trough (10.4%) |
| 2026-09-19 (Phase G) | Ranges over hash seeds in the headline rows; held-at-the-low table; alt replays for cbXRP and SOL against Coinbase depth alone; book-size sweep to 32x; grid keyed by book date | Unchanged | $9.2M realized (0.6%), $158.4M exposed (10.0%); $38.1M realized if held a day at the low |

The first drafts overstated realized loss because they seized in full at a constant depth, then understated it once partial liquidations were taken from a miscounted sample. Once the lived events were measured by debt repaid, the headline stopped moving.

### What this does not capture

- Liquidator capital in a crash is unobserved
- The realized loss on March 2020 depends on the bounce; holding the low for a day takes the 86% loss from $9.2M to $38.1M
- Depth in a crash is scaled from today, not bought from historical order books
- The March 2020 replay drops a 2026-sized book onto 2020 prices
- The ABC column is a hypothetical commitment, not a description of what Coinbase does

## Links & Resources

- **Dashboard**: [rahilbhavan.github.io/spine](https://rahilbhavan.github.io/spine)
- **Repository**: [github.com/RahilBhavan/spine](https://github.com/RahilBhavan/spine)
- **Writeup as a blog post**: [What haircut should Coinbase take on BTC and ETH collateral?](/writing/what-haircut-should-coinbase-take-on-btc-and-eth-collateral/)

---

**Completed:** September 19, 2026
