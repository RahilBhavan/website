---
title: "Guardian Pipeline: 12 Invariants From CI to Testnet"
tagline: "A lending vault's 12 safety rules, fuzzed in CI and re-checked on a testnet"
description: "A Solidity lending vault with 12 invariants, fuzzed in Foundry CI, mirrored by a TypeScript monitor on Base Sepolia, and traced to a self-review and a self-graded assurance score."
problem: "An audit checks a contract once, then the code and its state keep changing. A lending vault has to stay solvent after every deposit, borrow, repayment and liquidation, so the same safety rules should be checked before deployment and again against live state. Off-by-one-wei rounding is easy to miss by reading."
solution: "Wrote a two-asset lending vault in Solidity with 12 named invariants, a Foundry harness that drives it through random call sequences, and a TypeScript monitor with one check per invariant that writes violations to Supabase for a React dashboard. An assurance layer replays 10 exploit classes, binds each self-review finding to a test, and computes a score CI gates on."
result: "92 Foundry tests pass, 10 of 10 exploit-class replays are prevented, and the solvency invariant caught a real one-wei rounding bug during development."
status: "prototype"
verification: "The README records all 92 Foundry tests, 50 assurance tests and 66 monitor tests passing on 2026-10-21. The security review and the 94/100 AMC score are self-graded, not an audit."
next: "Fuzzing does not prove the invariants, and no Certora or Halmos proof exists. The scheduled monitor last ran on 2026-08-23 and GitHub has disabled it."
figure:
  src: "/images/projects/guardian-pipeline-12-invariants-from-ci-to-testnet/assurance-panels.webp"
  alt: "Dashboard panels showing an AMC score of 94 out of 100, grade A, 8 of 8 self-review findings traced to a re-runnable check, and 10 exploit replays prevented with 0 detected and 0 missed."
  caption: "The dashboard's assurance panels on October 21, 2026. The AMC score is self-graded and dates from June 10, 2026. It measures how fully the project ran its own method, not how secure the vault is."
kind: "smart contract security"
track: "crypto"
featured: false
githubUrl: "https://github.com/RahilBhavan/guardian-pipeline"
completedDate: 2026-10-21
---

## Overview

**The question.** Can the same set of safety rules for a lending vault be checked twice, once by a fuzzer before deployment and once by a monitor against live chain state, without the two drifting apart?

**The answer.** In this repo, yes, for a teaching vault on a test network. A Foundry harness asserts 12 invariants after every random call, and a TypeScript monitor re-checks the same 12 against a demo vault on Base Sepolia, a test network that holds no real value. A CI job fails if the two copies drift.

**How it differs from my 2024 project.** The [Smart Contract Invariant Monitor & Guardian](/projects/smart-contract-invariant-monitor-and-guardian) was a Rust tool that replayed the Euler exploit against mainnet history, while Guardian Pipeline is a separate 2026 codebase that writes its own Solidity vault, fuzzes its invariants in Foundry CI and mirrors them in a TypeScript monitor.

**Scope.** Independent research demo, with no affiliation with Base, Coinbase or any protocol named in the replays. `Vault.sol` is a teaching example with a permissionless mock oracle, no bad-debt reserve and no governance.

## How it works

1. `src/Vault.sol` is an interest-bearing, over-collateralized lending vault with two assets. Lenders supply the debt asset, and borrowers post a separate collateral asset priced by an oracle.
2. A Foundry invariant harness drives the vault with eight handlers (deposit, collateral, borrow, time warp, liquidate, donation, oracle moves and reentrancy) and asserts the 12 invariants after each call. INV-01, protocol solvency, says idle cash plus debt owed must cover everything lenders can claim.
3. `guardian/src/evaluator.ts` has one check per invariant. The monitor runs it per block as a daemon, or once from a scheduled GitHub Actions workflow, and writes violations to Supabase.
4. A React dashboard reads Supabase and shows invariant health, alerts and the assurance panels.
5. The assurance layer computes the Assurance Methodology Coverage (AMC) score from coverage, the exploit replays and the finding bindings. CI fails if it drops below 80.

## Results

- **92 Foundry tests.** 39 unit and boundary, 8 parameterized fuzz, 13 invariant, 9 differential, 10 exploit replays and 13 mutation tests. The mutation tests break the vault on purpose and assert that the matching invariant catches each break.
- **A real bug found.** The solvency invariant caught a full-close repayment that eroded the solvency margin by one wei during development. The self-review records it as GUA-02, High, Resolved.
- **10 mechanism replays, 10 prevented, 0 missed.** Each test requires the attack to drain a deliberately weakened copy of the vault and to fail against the real `Vault.sol`. These are rebuilt mechanisms, not replays of mainnet transactions.
- **Coverage.** `Vault.sol` has 100% line coverage (130 of 130 lines, 28 of 31 branches), observed on 2026-10-21.
- **Self-review.** 8 findings, GUA-01 to GUA-08: 3 resolved and 5 acknowledged. All 8 are bound to a re-runnable check.
- **AMC score.** 94/100 (grade A) on 2026-06-10. It is self-graded. The same author writes the invariants, picks the exploit set, binds the findings and grades the result.

## How it was checked

The README records `forge test` passing all 92 test functions on 2026-10-21, plus 50 of 50 assurance tests and 66 of 66 monitor tests. The CI invariant campaign runs 2,000 runs at depth 150 on every push and pull request to `main`. On 2026-10-21 that campaign made 300,000 handler calls in 135 seconds, and all 13 invariant functions passed. CI has 7 jobs, including a harness-to-monitor parity check and Slither and Aderyn static analysis.

## Limits and next steps

- The security review is a self-review, not a third-party audit.
- Fuzzing does not prove the invariants. No Certora or Halmos proof exists yet, and the invariant docs name INV-01, INV-04 and INV-06 as candidates for one.
- The monitor is a best-effort reference implementation with no uptime promise. Its scheduled workflow last ran on 2026-08-23, and GitHub has since disabled it for inactivity. On 2026-10-21 the live dashboard showed "Guardian down" and no recent checks, so this page doesn't link it as a demo.
- The staged demo is not an exploit. It forces an INV-01 violation so the monitor has something to catch.

## Links

1. [Repository](https://github.com/RahilBhavan/guardian-pipeline)
2. [Assurance method and what the score does not measure](https://github.com/RahilBhavan/guardian-pipeline/blob/main/docs/assurance.md)

---

**Completed:** October 21, 2026
