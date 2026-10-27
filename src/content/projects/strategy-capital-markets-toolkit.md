---
title: "Strategy Capital Markets Toolkit"
tagline: "Five small tools, one financing question each"
description: "Five open-source Python tools built from Strategy's public filings: a source-linked 8-K ledger, an issuance cost router, a fair-value earnings model for the S&P profit test, a preferred yield and convertible note curve, and a preferred dividend accrual ledger."
problem: "Strategy funds its bitcoin purchases by selling common stock (MSTR) and five preferred stocks, then pays dividends and interest on those claims. The facts a treasury reader needs are spread across weekly 8-Ks, 10-Qs and market prices. One headline number can mix filed values, market data and assumptions."
solution: "Built five offline Python tools, one per question: what was filed each week, which instrument is cheapest to issue, what bitcoin price passes the S&P earnings screen, what the preferreds yield at market, and what dividends are owed. Each runs from frozen, hashed public data, keeps its source links and states its own limits."
result: "Using filings through Oct 21, 2026: Strategy's preferreds yielded 10.03% to 14.96% at that day's closes, and a Dec 31 bitcoin close above $86,459 passes the modeled S&P profit test, give or take about $540."
status: "prototype"
verification: "263 unit tests pass across the five repos, rerun from fresh clones on Oct 26, 2026. Each repo's latest GitHub Actions run passed on its Oct 25 commit. Page numbers come from repo outputs and were not rechecked against the filings."
next: "Every tool reads a frozen October 21, 2026 snapshot, so the numbers age with each filing. The October 28 vote on daily STRC dividends was pending at that cutoff and no tool assumes it passes. The router still needs real point-in-time mNAV and yields, and five dividend checks remain open."
kind: "open-source tools"
track: "crypto"
featured: false
githubUrl: "https://github.com/RahilBhavan/strategy-8k-ledger"
completedDate: 2026-10-25
---

## Five questions about one issuer

Strategy buys bitcoin with money it raises by selling common stock (MSTR) and five preferred stocks: STRF, STRC, STRE, STRK and STRD. Reading that from a treasury desk means answering separate questions. What was filed? What does each source of capital cost? What do the earnings look like? What does the market charge? What is owed? Each tool here answers one of them, so each answer keeps its own sources and its own limits.

**Data cutoff:** Strategy filings through the October 19, 2026 8-K, reviewed as of October 21, 2026. Market prices are October 20 or 21 closes, depending on the tool. The October 28, 2026 vote on daily STRC dividends was still pending, and no tool assumes it passes.

**Scope:** Independent research from public filings and market data. Not affiliated with Strategy and not investment advice. Each tool is a prototype that runs offline on frozen, hashed data. None of them is a live feed.

## The 8-K ledger: what was filed each week

**Question:** What did Strategy report to the SEC each week about bitcoin, cash and stock sales, and which filing does each number come from?

The ledger reads 147 candidate 8-K filings from January 6, 2025 to October 19, 2026. It writes 97 period rows and 432 instrument rows, each with its source URL and date. Checks on holdings, cost basis, dates, stated averages, ATM totals and authorizations write exceptions to `data/checks.csv` instead of hiding them. An `evidence` command prints the exact filing lines and hashes behind any field.

**Result:** In the October 12–18, 2026 period, Strategy bought 267 BTC, bringing holdings to 848,517 BTC. It raised $22M net from MSTR at-the-market (ATM) sales, and its USD Reserve fell from $4.88B to $4.83B (8-K filed October 19, 2026).

**Limit:** Weekly 8-Ks printed a basic share count only from January 12 to February 23, 2025. So a same-date sats-per-share figure exists for just those five periods (182,564 to 191,749 sats per basic share). After that, the ledger shows ranges built from 10-Q and 10-K cover pages, the latest 219,604 sats on July 24, 2026. It computes no current weekly ratio. Filed values are rounded, not audited transaction records.

[Code and data: strategy-8k-ledger](https://github.com/RahilBhavan/strategy-8k-ledger)

## The issuance router: which capital costs least

**Question:** To raise a set net amount in one week, which instrument is cheapest, common MSTR or one of the preferreds? And how does that compare with what Strategy actually sold?

The router prices every instrument on one basis: the value handed to new holders for each net dollar raised. It reports what limits each one (the target, a dividend budget, a user limit or disclosed capacity) and the discount rate at which a preferred would beat common. It warns, or blocks, when common would be sold below 1x mNAV. The decision date has to come before the target week, so later issuance can't leak into the choice.

**Result, in a synthetic demo:** At an assumed 1.2x mNAV and a 10% discount rate, for an October 9, 2026 decision, MSTR hands new holders $0.84 of value per dollar raised. The four preferreds cost $0.89 to $1.21. STRK has the lowest break-even discount rate, 10.74%; above it, common is no longer the cheapest. For an illustrative $25M target, the router picks $24.875M of MSTR and $0.125M of STRK. In the actual October 12–18 week, Strategy sold $22M of MSTR net and no preferreds.

**Limit:** The mNAV, yields and discount rate are synthetic, and the $25M target is not a filed or planned raise. This is a scenario replay, not a historical backtest. Capacity comes from filings through a pinned extract of the 8-K ledger and may be stale; it is a ceiling, not proof the shares can be sold. Taxes, liquidity, calls and the euro-denominated STRE are not modeled.

[Code and demo: strategy-issuance-router](https://github.com/RahilBhavan/strategy-issuance-router)

## Fair-value earnings: what passes the S&P test

**Question:** Strategy's latest reported quarter and its trailing four quarters were losses, so it fails the S&P 500 profit test. What year-end bitcoin price would change that?

The model rebuilds Strategy's earnings under fair-value accounting for bitcoin. It applies the S&P screen: GAAP net income above zero for the latest quarter and for the sum of the last four. Then it solves for the December 31, 2026 bitcoin price that passes. It also runs seeded price scenarios and scores its own error against six reported quarters.

**Result:** The quarter to June 30, 2026 lost $8.22B, and the four quarters to that date lost $30.41B (June 2026 10-Q). A Coinbase BTC-USD daily close above $86,459 on December 31, 2026 passes the test on net income. After preferred dividends, the bar is $88,826.

**Limit:** The model missed reported net income by $326.77M on average over six quarters. That is about $540 of bitcoin price, so a close within that band of the threshold is undecided. Q3 2026 uses Strategy's preliminary 8-K estimates plus modeled other income; it is not reported GAAP earnings. S&P's method does not say which earnings line counts, so the model uses net (loss) income and shows the after-preferred line as a sensitivity. Only the earnings rule is modeled, not market cap, liquidity, float or Index Committee discretion.

[Code and results: strategy-fair-value-earnings](https://github.com/RahilBhavan/strategy-fair-value-earnings)

## The credit curve: what the market charges

**Question:** What do Strategy's preferreds yield at their actual market prices, and what are its convertible notes worth under stated assumptions?

The curve takes each preferred's October 21, 2026 Nasdaq close and computes its effective annual yield and its spread over a 30-year Treasury par rate of 5.49%. It values six convertible notes with a Tsiveriotis-Fernandes tree at the $153.48 MSTR close, across a grid of volatility and credit-spread assumptions.

**Result, at the October 21, 2026 closes:**

| Preferred | Close | Effective yield | Spread over UST 30y |
|---|--:|--:|--:|
| STRF | $103.42 | 10.03% | 453 bp |
| STRC | $99.20 | 12.82% | 733 bp |
| STRK | $73.00 | 11.42% | 592 bp |
| STRD | $70.50 | 14.96% | 946 bp |

STRD, the most junior and the only noncumulative preferred, yields the most. STRE has not traded since January 29, 2026, so it is left out. At a central 60% volatility and 5% credit spread, the six notes are worth $860.67 to $1,197.15 per $1,000 face.

**Limit:** Prices are one day's closes, not live quotes. Note volatilities (40, 60 and 80%) and credit spreads (2, 5 and 10%) are assumptions, not fitted or implied, so the note values are model outputs, not quotes. Treasury par rates stand in for a bootstrapped curve. The later-date example inputs in the repo are synthetic.

[Code and results: strategy-credit-curve](https://github.com/RahilBhavan/strategy-credit-curve)

## The accrual ledger: what is owed, and does it match

**Question:** How much does Strategy owe in dividends on its five preferreds, and when? Do the totals match what it reported paying?

The ledger replays 37 sourced events from a June 30, 2026 opening balance and writes dated dividend schedules through March 2027. Entitlement is fixed at record dates, USD and EUR stay separate, and STRD's noncumulative dividends are kept apart from cumulative arrears. Then it checks the modeled totals against the filed totals.

**Result:** 11 of 16 aggregate checks match within the filings' rounding. The other five stay open, each with its reason: STRE cash dividends for Q1 and Q2 2026, and three weekly funding checks. Along the way it found that Strategy's two 2026 10-Qs disagree on Q1 STRE cash dividends by $553 thousand ($22,895 thousand in the March 10-Q against $22,342 thousand implied by the June 10-Q).

**Limit:** This is not a paying-agent ledger, and no bank settlement feed is connected; every seeded payment is marked assumed settled. Funding is not settlement, and the ECB reference rate may differ from the rate Strategy paid at. The future payment form for STRK is unknown.

[Code and schedules: preferred-accrual-ledger](https://github.com/RahilBhavan/preferred-accrual-ledger)

## How they fit together

- The 8-K ledger is the filing layer. The issuance router reads a pinned, hashed extract of its output for disclosed capacity and actual issuance. The other three tools read their own frozen filing and price snapshots.
- The router and the credit curve look at the cost of capital from two sides: what the issuer hands new holders, and what the market yields at the close.
- Fair-value earnings covers the income statement. The accrual ledger covers what the preferreds are owed.
- The [Preferred Coverage Model](/projects/strategy-preferred-coverage-model-dividend-runway) is the Excel sibling. It asks how long cash and common sales can fund those dividends, from an earlier October 15, 2026 snapshot.
- The [DAT Accretion Monitor](/projects/dat-accretion-monitor) measures what each capital action does to net coins per share. Parts of the 8-K ledger's filing parser were adapted from it.

## How each tool was checked

| Tool | Tests | Also checked |
|---|--:|---|
| 8-K ledger | 60 | Restores frozen sources and verifies its data contract |
| Issuance router | 45 | CI replays the demo against the saved result |
| Fair-value earnings | 43 | Snapshot reproduces 7 output hashes; CI on Python 3.12 and 3.14 |
| Credit curve | 60 | Restores 34 source files and checks their SHA-256 hashes |
| Accrual ledger | 55 | Snapshot reproduces 10 output hashes |

All 263 tests passed on fresh clones on October 26, 2026, and each repo's latest GitHub Actions run passed on its October 25 head commit. The numbers on this page are copied from each repo's README and result files. They were not rechecked against the SEC filings for this page. The 8-K ledger spot-checked primary filing pages; it did not review every filing.

## Open the repositories

Each README carries its full results and limits. Code is MIT licensed; filings and market data keep their own rights.

1. [strategy-8k-ledger](https://github.com/RahilBhavan/strategy-8k-ledger): weekly filings, source-linked
2. [strategy-issuance-router](https://github.com/RahilBhavan/strategy-issuance-router): issuance cost per net dollar
3. [strategy-fair-value-earnings](https://github.com/RahilBhavan/strategy-fair-value-earnings): S&P profit-test threshold
4. [strategy-credit-curve](https://github.com/RahilBhavan/strategy-credit-curve): preferred yields and note values
5. [preferred-accrual-ledger](https://github.com/RahilBhavan/preferred-accrual-ledger): dividend schedules and reconciliation

---

**Completed:** October 25, 2026
