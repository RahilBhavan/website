---
title: "Presto: Royalty Recovery Engine"
tagline: "Find the registration gap. Show the evidence. Keep a human in control."
description: "A local royalty-recovery prototype that reconciles music catalogs with registry records, explains possible registration gaps, and keeps claim review and payment evidence traceable."
problem: "Songwriters and labels leave royalties unclaimed because the registries that pay them (the MLC for compositions, SoundExchange for recordings) hold shares that are missing, under-claimed, or attached to the wrong party. Finding those gaps means reconciling a partner's catalog against bulk registry feeds with inconsistent identifiers, and any tool that guesses at shares or double-counts a claim creates a financial error rather than fixing one."
solution: "Built a deterministic matcher, a DDEX BWARM ingester, and a local review workflow for a three-person founding team. Ambiguous matches wait for a human; stable catalog-row identities guard payment records and invoices across repeat scans."
result: "Testing the official DDEX sample exposed seven parser defects, including one that would have flagged ten fully claimed works as recovery leads. All seven were fixed; no royalties have been recovered."
status: "prototype"
verification: "431 unit tests and a CI matrix on Python 3.10 to 3.13. Running the ingester on the official DDEX BWARM sample found seven parser defects, all fixed."
next: "No customers, recovered dollars or production accuracy yet, and the sample leaves every ISWC and IPI blank, so exact-identifier matching has not seen real data."
demoUrl: "https://prestorecovery.com"
kind: "royalty reconciliation"
track: "product"
featured: true
completedDate: 2026-09-09
---

## A recovery lead is not money owed

A missing registry match is a reason to investigate. It is not proof that a songwriter or label has unpaid royalties. Presto is a local prototype for making that distinction visible: reconcile a catalog, explain the possible gap, and give an operator the evidence to review it.

**My role:** Software engineer on a three-person founding team, July–September 2026. I built the matcher, DDEX BWARM ingester, local recovery workflow, packet-integrity proof, and demo site.

**Project boundary:** No customers, recovered dollars, or measured production accuracy. Presto prepares evidence; it does not submit portal claims, move money, store credentials, or operate wallets.

## The sample that changed the parser

Synthetic fixtures passed. The official DDEX BWARM sample still exposed **seven parser defects**. One would have flagged **ten fully claimed works** as recovery candidates—the exact kind of false lead the product needed to avoid.

After the fixes, the sample ingested ten works, skipped none, and reported each as 100% claimed. Fixtures were updated to reproduce the sample's quirks rather than an idealized feed.

That check has a clear limit: every ISWC and IPI in the sample is blank, and its unclaimed-share file is empty. It exercises the parser, but does not establish real-world exact-identifier matching or recovery accuracy.

## From catalog to reviewable evidence

1. **Validate the inputs.** Check catalog and registry headers, identifiers, decimal shares, source compatibility, and duplicates before matching.
2. **Match identifiers first.** Try ISRC and ISWC; use title and writer similarity only when an exact hit is absent. Conflicts, duplicate identifiers, and near-ties wait for review.
3. **Explain the lead.** Preserve the match type, confidence, runner-up score, candidate reason, and any blocking reason.
4. **Prepare a manual packet.** An operator reviews the evidence before a claim moves forward. Outcome and payment records remain separate steps.
5. **Record without double-counting.** Stable catalog-row identities link repeat scans to the same underlying entry when recording payment evidence and preparing invoices.

The engine accepts MLC bulk input through its DDEX BWARM ingester. SoundExchange records must be prepared manually; the project does not scrape its registry. Access to the MLC bulk feed requires its subscription.

## Three decisions that matter

### Unknown shares stay unknown

A blank share is not zero. An unclaimed percentage does not justify inventing a claimed percentage as `100 − unclaimed`. A total above 100 is reported as unknown with a warning, rather than clamped into a plausible-looking answer.

The point is to preserve what the source says, even when that leaves a reviewer with an unresolved question.

### A scan and a catalog row need different identities

A new matcher version must be able to scan the same catalog again. That creates a new run-scoped `candidate_id`, while a run-independent `entry_key` preserves the underlying catalog-row identity.

Both payment recording and invoice preparation check that stable identity across runs. Each guard is tested independently. These are application-level checks in a local workspace, not a guarantee against arbitrary edits or a multi-user payment system.

### Recovery includes the write path

Atomic file replacement, an append-only event journal, and an exclusive workspace lock support crash recovery and prevent competing CLI mutations. Packet and invoice files use create-once paths.

These choices fit a single local operator. They do not establish hosted-service reliability or multi-user concurrency.

## What was checked

- **431 Python unit tests**, with a CI matrix across Python 3.10–3.13.
- **Official DDEX BWARM sample:** seven parser defects found and fixed; ten works ingested without skips.
- **Synthetic matching benchmark:** at a 0.85 threshold, 72 positives and 56 negatives produced precision 1.000, recall 0.556, and false-positive rate 0.000. This is typo-tolerance evidence on synthetic ground truth, not production accuracy.
- **Workflow guards:** independent checks for repeat payment records and invoices, atomic state replacement, journal entries, exclusive locking, and checksummed payment evidence.

## Implementation notes

The recovery engine uses the Python 3.10+ standard library with `Decimal` for money. Local workflow state uses JSON and a JSONL journal; the operator application also uses SQLite. The demo site uses Next.js and React.

The exact matcher rejects contradictory identifiers. The fuzzy fallback requires a best score of at least 0.85 and blocks a result when its runner-up is within 0.03. These are explicit thresholds to evaluate, not evidence that all accepted matches are correct.

An optional SHA-256 packet commitment can be timestamped through Ethereum Attestation Service on Base Sepolia. It establishes a commitment to packet bytes—not ownership, payment, or entitlement to royalties.

## What remains unproven

Real catalog data with populated ISWCs and IPIs is needed to evaluate exact matching. A representative labeled dataset is needed to measure accuracy. Full-feed memory and latency remain separate checks before expanding beyond the local prototype.

The useful outcome so far is a reviewable reconciliation workflow and a parser corrected by a real format sample. Customer recovery results remain an open question.

## Explore the prototype

- [Open the Presto demo](https://prestorecovery.com)
- The source repository is private.

**Work period:** July–September 2026. **Project snapshot:** September 9, 2026.
