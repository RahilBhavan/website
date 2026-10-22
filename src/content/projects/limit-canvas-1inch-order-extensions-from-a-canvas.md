---
title: "Limit Canvas: 1inch Order Extensions From a Canvas"
tagline: "Draw a limit-order strategy, generate the Solidity, fill it through 1inch LOP"
description: "A local studio and code generator that turn stop-loss, gas-guard, TWAP and DCA strategies into 1inch Limit Order Protocol v4.3.2 extensions, proven by Foundry fill tests against the pinned protocol."
problem: "1inch Limit Order Protocol (LOP) extensions let an order carry conditions like a price trigger or a gas cap, but the extension calldata has to be packed with exact offsets, and the low 160 bits of the order salt must equal the low 160 bits of the extension's hash. Get either wrong and the order never fills."
solution: "Built a Bun monorepo with a Next.js studio where a strategy is drawn as a graph, a Zod-validated strategy format, an SDK that packs extensions and derives the salt, and a code generator that writes Solidity, a deploy script and a deterministic manifest. Foundry tests deploy the pinned LOP locally and fill orders that carry the generated extensions."
result: "Generated stop-loss, gas-guard and TWAP extensions fill through pinned 1inch LOP 4.3.2 in Foundry tests; 22 Bun and 34 Foundry tests passed on 2026-10-21."
status: "prototype"
verification: "The README records 22 Bun and 34 Foundry tests passing on 2026-10-21. CI checks the LOP submodule commit and fails if the gas snapshot or bytecode hashes drift. No external audit."
next: "No deployment, users or orderbook submission. Integration tests cover one EVM-mainnet-shaped environment, and none exercises zkSync Era."
figure:
  src: "/images/projects/limit-canvas-1inch-order-extensions-from-a-canvas/studio-stop-loss.webp"
  alt: "The Limit Canvas studio showing a gas-safe ETH stop-loss as a graph: maker intent, a price condition below 750 and a base-fee cap of 25 gwei joined by AND, packed into an LOP extension, and a readiness gate with 1 warning."
  caption: "The studio after Run demo, with synthetic addresses and inputs. The warning flags that the strategy sets audited: true without an audit provenance record."
kind: "defi tooling"
track: "crypto"
featured: false
githubUrl: "https://github.com/RahilBhavan/limit-canvas"
completedDate: 2026-10-21
---

## Overview

**The question.** Can a limit-order strategy such as "sell if ETH drops below a price, but only when gas is cheap" be drawn, turned into a 1inch Limit Order Protocol (LOP) extension and proven to fill, without hand-packing calldata?

**The answer.** For three of its four templates, yes, in local Foundry tests. Orders carrying the stop-loss, gas-guard and TWAP slice extensions fill through LOP v4.3.2, pinned by commit, in tests that deploy the protocol locally and call `fillOrderArgs`. The fourth template, a DCA schedule, is tested by registering its series, not by filling an order.

**Scope.** Independent portfolio project, not affiliated with or endorsed by 1inch. The studio runs locally. Nothing has been deployed, and nothing signs or submits an order.

## How it works

A strategy moves through five workspace packages:

1. `apps/studio` is a Next.js 15 app. You draw the strategy as a graph, replay fill conditions in a simulation panel, generate the bundle and run `forge test` from the Verify page.
2. `packages/hook-dsl` defines the strategy document as a Zod schema, plus the template catalog.
3. `packages/lop-sdk` packs extensions, derives the order salt and holds an LOP address registry of 10 chains (9 mainnets and Sepolia).
4. `packages/codegen` writes the Solidity, a deploy script, a README and a `manifest.json` with the strategy hash, extension hash, LOP pin and compiled bytecode hash. The same input produces byte-identical output.
5. `packages/contracts` holds the Foundry templates and a harness that deploys LOP 4.3.2 locally with mock oracles and tokens.

The demo strategy is `AND(stop-loss, gas-guard)`. The stop-loss reads the oracle's latest round and reverts on stale, incomplete or wrong-decimals data. The codegen command line refuses mainnet output unless the template is marked `audit-ready` and the strategy sets `audited: true`. `audit-ready` is this repo's own maturity label, not an audit.

## Results

- **Four templates generate code.** Stop-loss, gas guard, TWAP slice and DCA schedule each go from strategy file to Solidity, manifest and a Foundry integration test. The stop-loss, gas-guard and TWAP tests fill an order through LOP, including revert cases for a stale oracle, a decimals mismatch, a base fee above the cap and a slice above the TWAP cap. The DCA test checks that its series registers. Four more catalog entries (oracle band, deadline window, private taker, Dutch auction) are marked planned or research only and generate no code.
- **The salt rule is tested in two languages.** A TypeScript test asserts the low 160 bits of the salt equal the extension hash, and a Solidity test helper applies the same rule.
- **Gas snapshot.** The checked-in snapshot records 208,825 gas for a full `fillOrderArgs` call on a stop-loss order with a gas guard. The stop-loss check costs 22,712 gas against 13,526 for a naive baseline that skips the staleness, round and decimals checks.

## How it was checked

The README records all 22 Bun tests (across the strategy format, SDK and code generator) and all 34 Foundry tests (17 unit, 11 integration, 1 fuzz, 5 benchmark) passing on 2026-10-21. CI builds and tests the contracts, runs `forge snapshot --check`, asserts the LOP submodule is at the 4.3.2 commit, and fails if the committed bytecode hashes change.

A self-review in `docs/1inch-review.md` is written from the point of view of a 1inch protocol engineer. No one at 1inch wrote, reviewed or endorsed it. It lists the four release blockers and five production gaps it found as closed.

## Limits and next steps

- No external audit. Generated contracts are not audited.
- No deployment and no live users.
- No orderbook submission. The SDK builds the payload shape for the 1inch Orderbook API, but nothing signs or submits it.
- Integration tests cover one EVM-mainnet-shaped environment. The registry lists 10 chains, but no test exercises zkSync Era, which has a different LOP address.
- The studio simulation is a logical replay with synthetic inputs, not an on-chain `simulate` call.
- TWAP and DCA fills depend on a keeper, and the project ships none. The generated bundle documents what a keeper must do.

## Links

1. [Repository](https://github.com/RahilBhavan/limit-canvas)
2. [Why Limit Canvas](https://github.com/RahilBhavan/limit-canvas/blob/main/docs/why-limit-canvas.md)
3. [Self-review and open items](https://github.com/RahilBhavan/limit-canvas/blob/main/docs/1inch-review.md)

---

**Completed:** October 21, 2026
