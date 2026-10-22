---
title: "Ondo Flows: Stablecoin and Treasury-Fund Issuance"
tagline: "Mints and redemptions for six dollar tokens, decoded from Ethereum logs"
description: "A Next.js dashboard that decodes Ondo's OUSG and USDY mint and redeem events on Ethereum and puts USDC, USDT, PYUSD and BUIDL beside them, with every number badged live, estimated or mocked."
problem: "Ondo Nexus has no contracts of its own, so its on-chain activity has to be read through Ondo's OUSG and USDY InstantManager events. Comparing those tokenized Treasury funds with stablecoins also needs one definition of a mint and a redemption across six tokens with different event formats."
solution: "Built a dashboard that pages InstantManager logs from Blockscout, decodes them with viem and groups them by week. A stablecoin tracker reads Ethereum logs for USDC, USDT, PYUSD, BUIDL, OUSG and USDY, removes cross-chain transfers, and lines net issuance up against the Fed's rate cuts. Each number carries a live, estimated or mocked badge."
result: "From Ethereum logs read Oct 17, 2026: five issuers minted $521.1B and redeemed $484.5B across 3,162,056 decoded events, after removing $188.7B of USDC CCTP transfers."
status: "prototype"
verification: "Six self-check scripts passed on Oct 21, 2026. Log-derived net issuance matched DefiLlama's Ethereum supply change within 16% for USDC and 5% for PYUSD. CI runs lint, types and build."
next: "The stablecoin data is a frozen Oct 17, 2026 snapshot, and on Oct 21 the DefiLlama benchmark source returned 0 for all four products, so those rows show a mocked Sep 24 snapshot."
figure:
  src: "/images/projects/ondo-flows-stablecoin-and-treasury-fund-issuance/summary.webp"
  alt: "One-page summary titled 'Fed cuts split stablecoin and Treasury-fund issuance in 2024; 2025 blurred it', with cumulative net issuance for six tokens, a dot plot of net issuance before and during two easing episodes, and a mints and redemptions table."
  caption: "The /summary page from the October 17, 2026 snapshot. Weekly mints and redemptions on Ethereum from January 2023 to October 5, 2026."
kind: "data dashboard"
track: "crypto"
featured: false
demoUrl: "https://ondo-nexus.vercel.app"
githubUrl: "https://github.com/RahilBhavan/Ondo"
completedDate: 2026-10-21
---

## Overview

**The question:** How much money moves into and out of Ondo's tokenized Treasury funds, and how does that compare with the largest stablecoins and BlackRock's BUIDL when the Fed cuts rates?

**The answer, from Ethereum logs read October 17, 2026:** Five issuers minted $521.1B and redeemed $484.5B between the weeks of December 26, 2022 and October 5, 2026. In the 2024 easing episode, USDC and USDT net issuance ran above their own norm while BUIDL and OUSG ran below theirs. The 2025 episode only partly repeated that. With two episodes, this is descriptive, not evidence of cause.

**Scope:** Independent project. It is not affiliated with or endorsed by Ondo Finance, Circle, Tether, PayPal, Paxos, BlackRock or Securitize.

## How it works

- **Ondo flows (`/`, `/flows`).** The app pages OUSG and USDY InstantManager logs from Blockscout's keyless API, decodes them with viem, and groups them by Monday-UTC week. It reads the current OUSG manager, the legacy OUSG manager and the USDY manager. Newer log pages refresh hourly.
- **Home page.** Supply on 13 chains is priced with Ondo's on-chain oracle. Holders come from Blockscout, and competitor TVL comes from DefiLlama. When a source fails, the getter returns a dated snapshot labeled as such.
- **Stablecoin flows (`/issuance`, `/summary`).** Backfill scripts read Ethereum event logs in 100,000-block windows and add DefiLlama supply by chain and the FRED target rate. They freeze the result as dated JSON, which the pages read.

A mint is supply created and a redemption is supply destroyed. Circle CCTP mints and burns move USDC between chains, so the tracker counts them and then removes them. It also drops Paxos's mistaken 300 trillion PYUSD mint and its burn on October 15, 2025.

## Results

From the snapshot in `src/data/issuance.json`, Ethereum only, weeks of December 26, 2022 through October 5, 2026:

| Asset | Mints | Redemptions | Net |
|---|---:|---:|---:|
| USDC | $415.6B | $438.4B | −$22.8B |
| USDT | $82.8B | $26.1B | $56.7B |
| PYUSD | $19.0B | $17.2B | $1.8B |
| BUIDL | $2.3B | $2.1B | $195.7M |
| OUSG | $1.3B | $747.9M | $598.1M |
| USDY | $215.1M | $66.6M | $148.5M |
| Five issuers | $521.1B | $484.5B | $36.6B |

- The snapshot holds 3,162,056 decoded event logs, 3.12M of them USDC.
- $188.7B of USDC mints and burns were CCTP transfers between chains and are excluded.
- In the 2024 easing episode (September to December 2024, 100 bp), USDC and USDT net issuance ran +0.5σ above their own norm, and BUIDL and OUSG ran −0.2σ and −0.3σ below theirs. The 2025 episode (September to December 2025, 75 bp) only partly repeated it.

## How it was checked

- Six self-check scripts in `src/lib/*.check.ts` passed on October 21, 2026. One reconciles the committed snapshots.
- Ethereum log-derived net issuance matched DefiLlama's Ethereum supply change within 16% for USDC and 5% for PYUSD.
- CI runs lint, the type check and the production build. It does not run the self-checks.

## Limits and next steps

- The stablecoin data is a snapshot from October 17, 2026. It stays stale until someone reruns the backfill scripts.
- On October 21, 2026, DefiLlama's TVL endpoint returned 0 for all four benchmark products. The competitor rows show the September 24, 2026 snapshot, labeled mocked.
- Gross flows are Ethereum only. Tron holds about half of USDT supply, so Ethereum logs understate USDT and USDC issuance. Net issuance for the three stablecoins uses all-chain supply instead.
- The dashboard counts instant mints and redemptions only, not secondary transfers, DEX trades or bridged balances.
- The rate-cut comparison covers two easing episodes, so it is descriptive only.

## Links

1. [Live dashboard](https://ondo-nexus.vercel.app)
2. [Repository](https://github.com/RahilBhavan/Ondo)
3. [Methodology](https://github.com/RahilBhavan/Ondo/blob/main/docs/METHODOLOGY.md)

---

**Completed:** October 21, 2026
