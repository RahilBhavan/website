---
title: "Presto: Royalty Recovery Engine"
tagline: "Matching engine and claim workflow that recovers unclaimed music royalties"
description: "A stdlib-only Python engine that matches a music catalog against MLC and SoundExchange registry data, produces explainable recovery leads, and drives a crash-recoverable claim workflow that can never pay or invoice the same catalog row twice."
problem: "Songwriters and labels leave royalties unclaimed because the registries that pay them (the MLC for compositions, SoundExchange for recordings) hold shares that are missing, under-claimed, or attached to the wrong party. Finding those gaps means reconciling a partner's catalog against bulk registry feeds with inconsistent identifiers, and any tool that guesses at shares or double-counts a claim creates a financial error rather than fixing one."
solution: "Built the matching engine, the DDEX BWARM ingester, and the recovery workflow for a three-person founding team: exact ISRC/ISWC matching with a fuzzy fallback and near-tie guard, a streaming parser validated against the official DDEX sample, a workspace with atomic writes, an append-only journal, and an exclusive lock, run-independent entry keys that make double payment or double invoicing impossible by construction, and a SHA-256 packet commitment for timestamping on Base."
demoUrl: "https://prestorecovery.com"
kind: "co-founder"
featured: true
completedDate: 2026-09-09
---
## Overview

**What it is:** A local, human-reviewed royalty recovery workflow. It validates a partner's catalog and a registry snapshot (MLC or SoundExchange), matches every catalog row against the registry, creates explainable review leads where a share looks missing or under-claimed, prepares manual claim packets, records claim outcomes and payment evidence, and invoices a configured contingency fee after verified payment. It also reconciles a label's recording catalog against a distributor statement and prepares a draft inquiry packet.

**Why it matters:** The registries pay on what is registered, not on what is owed. A catalog row that is not observed, is marked unclaimed, or is claimed at a lower share than the partner expects is money left on the table. The hard part is not spotting the gap once; it is doing it deterministically across a bulk feed, explaining each lead to a human, and making sure the workflow around it cannot lose or duplicate money.

**Who it's for:** Independent labels, publishers, and the operators who recover royalties on their behalf.

**Impact:** About 5,400 lines of standard-library Python in the `recovery` package with 225 unit tests and a CI matrix across Python 3.10 to 3.13. Validating the ingester against the official DDEX BWARM sample found seven parser defects, one of which would have reported ten fully-claimed works as recovery candidates. As the README states, Presto does not move money, submit portal claims, store credentials, or operate wallets.

**My role:** Software engineer on a three-person founding team, July to September 2026. I built the matcher, the DDEX BWARM ingester, the crash-recoverable workflow, the Base EAS proof, and the demo site.

## The Problem

### The Challenge

A partner hands over a catalog: ISRCs, ISWCs, titles, writers, and the share they believe they own. The registry says what it has actually observed for those works. Reconciling the two is where recovery starts, and everything about the data resists it.

**Specific issues:**
- Identifiers are inconsistent: an ISRC may be present in the catalog and absent from the registry, or an ISWC may be blank on one side
- A work can have many writers; the catalog names one, the registry lists all of them
- Registry shares can be missing (unknown), marked unclaimed, or sum to more than 100
- The MLC's bulk feed is a DDEX BWARM TSV set that escapes delimiters rather than quoting them
- SoundExchange publishes no bulk file and its terms forbid automated collection

**Consequences of getting it wrong:**
- Inferring a share that was never observed tells a customer they are owed money they may not be owed
- A lead that is created twice across two scans can be paid or invoiced twice
- A crash mid-write can leave a workspace half-updated with no record of what happened

### Existing Solutions

Manual review in spreadsheets, one work at a time. It does not scale to a bulk feed and there is no audit trail of why a lead was raised.

### Constraints & Requirements

**Technical constraints:**
- Python 3.10+ standard library only, zero runtime dependencies
- Single-operator, local workspaces; no hosted service, no credentials stored
- Deterministic output: the same source bytes must produce the same leads and packets
- Money as `Decimal` end to end

**Legal constraints:**
- `ingest --source` accepts only `mlc`; SoundExchange rows must be produced manually
- The MLC's only sanctioned bulk path is the paid BWARM subscription
- The official DDEX sample carries no stated licence, so it is not committed; synthetic fixtures reproduce its quirks

## The Solution

### Approach & Methodology

1. **Validate strictly at the boundary.** Catalog and registry CSVs are checked for header, identifier format, decimal shares, source/domain coherence, and duplicates before anything else runs.
2. **Match deterministically.** Exact identifiers first, fuzzy title and writer matching only when no exact hit exists, and route anything ambiguous to a human rather than guess.
3. **Explain every lead.** Each lead carries a match type, a confidence, a runner-up confidence, a candidate reason, and a blocking reason when one applies.
4. **Make the workflow crash-safe.** Atomic state replacement, an append-only event journal, create-once packet and invoice paths, and an exclusive lock.
5. **Prove packet integrity without exposing it.** Hash the packet artifacts into a `bytes32` commitment intended for EAS `timestamp(bytes32)` on Base Sepolia.

### Technology Stack

**Engine:**
- Python 3.10+, standard library only (`csv`, `decimal`, `difflib`, `hashlib`, `fcntl`, `sqlite3`, `unittest`)
- 225 unit tests, CI matrix on Python 3.10, 3.11, 3.12, and 3.13

**Workflow storage:**
- JSON workspace state replaced atomically via `os.replace`
- Append-only JSONL event journal
- Exclusive `fcntl` lock per workspace
- SQLite for the persistent local operator application

**Demo site:**
- Next.js and React, deployed on Vercel, with 85 tests of its own

**On-chain proof:**
- SHA-256 packet commitment prepared for Ethereum Attestation Service on Base Sepolia; submission is opt-in via an external `cast` call

**Why this stack:**
- Zero dependencies means a partner can run it from a fresh clone with nothing but Python
- Deterministic stdlib primitives make the golden-bytes fixture tests meaningful
- Local files and a lock are enough for one operator; a multi-user service is a separate build

### Architecture & Design Decisions

**Two identities per lead.** `candidate_id` is run-scoped: it hashes the run id with the catalog row, so an improved matcher can re-scan the same catalog and produce genuinely new leads instead of being refused. `entry_key` is run-independent: the identity of the catalog row itself. Every money artifact checks `entry_key` across runs, so the same row cannot be paid or invoiced twice however many times it was scanned.

**Blank means unknown.** The DDEX spec nowhere states that claimed and unclaimed shares sum to 100, so `100 - unclaimed` is never computed. Unclaimed rows emit a blank claimed share; a share sum over 100 is emitted blank and counted as a warning, never clamped.

**Header-name column resolution.** BWARM columns are resolved by name, never by position, and a missing column raises an error naming the file and every accepted alternative.

**Trade-offs:**
- Advisory `flock` locking and application-level create-once paths, not OS-enforced immutability
- BWARM works, parties, and join indexes stay memory-resident; registry output streams to an atomic temp file
- The fuzzy pass is `O(catalog x registry x writers)` until registries exceed 512 compatible faces, at which point token blocking kicks in

### Key Features

1. **Strict CSV validation** with normalised ISRC, ISWC, and IPI/CAE identifiers and exact-decimal shares
2. **Deterministic matcher** with exact-identifier pass, fuzzy fallback, conflict detection, and near-tie guard
3. **DDEX BWARM ingester** that streams the MLC bulk feed into the registry schema
4. **Crash-recoverable workflow** across `init`, `validate`, `ingest`, `scan`, `review`, `packet`, `transition`, `record-payment`, and `invoice`
5. **Base proof** commands to prepare, verify, and optionally submit a packet commitment
6. **Statement audit** for reconciling a label catalog against a distributor statement without MLC data
7. **Label operator demo site** presenting both synthetic paths

## Technical Highlights

### The match result

Every match carries enough to explain itself to a reviewer:

```python
@dataclass
class MatchResult:
    catalog_entry: CatalogEntry
    registry_record: RegistryRecord | None
    match_type: Literal["exact_isrc", "exact_iswc", "fuzzy", "unmatched", "ambiguous", "conflict"]
    confidence: float
    runner_up_confidence: float = 0.0
    candidate_reason: CandidateReason = "not_a_candidate"
    candidate_id: str = ""
    blocking_reason: str | None = None
```

The exact pass tries ISRC, then ISWC (tightened by IPI/CAE when the entry carries one). More than one hit is `ambiguous` with `blocking_reason="duplicate exact identifier"`; a single hit whose other identifier contradicts the entry is `conflict`. The fuzzy pass scores `difflib.SequenceMatcher` over the title paired with every writer of the record, requires a best score of at least 0.85, and returns `ambiguous` with `"fuzzy near-tie"` when the runner-up is within 0.03.

### Atomic writes and the workspace lock

```python
def _atomic_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(dir=path.parent, prefix=".tmp-")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(data, handle, indent=2, sort_keys=True, default=_json_default)
            handle.write("\n")
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


@contextmanager
def _workspace_lock(root: Path):
    """Exclusive non-blocking lock so two CLI processes cannot mutate one workspace."""
    lock_path = root / _LOCK_NAME
    fd = os.open(lock_path, os.O_CREAT | os.O_RDWR, 0o600)
    try:
        try:
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError as exc:
            raise ValueError("workspace is locked by another presto-recovery process") from exc
        yield
    finally:
        fcntl.flock(fd, fcntl.LOCK_UN)
        os.close(fd)
```

State is written to a temp file in the same directory and swapped in with `os.replace`, so a crash leaves either the old file or the new one, never a partial. Scan publication stages the run directory and replaces it the same way.

**Key Technical Decisions:**

1. **Money-safety invariants are tested independently.** `record_payment` refuses when any other candidate with the same `entry_key` is already `paid`. `invoice` performs the same check on its own and additionally refuses when an invoice file exists for any sibling. The second guard is verified by forcing a candidate to `paid` without going through `record_payment`.
2. **`QUOTE_NONE` for BWARM.** DDEX escapes delimiters rather than quoting them; the csv module's default would strip quotes from a title like `"Heroes" (Live)` and let a quoted tab swallow a column boundary.
3. **Matcher versioning is source, not a flag.** Bumping `MATCHER_VERSION` and re-scanning produces a new run; `entry_key` still prevents double pay.

## Process & Timeline

### Phase 1: Step-1 recovery CLI (July 2026)

- Workflow, matcher, loaders, docs, and CI in the first commit
- Source-format spec, multi-writer registry schema, and the BWARM ingester
- Six ingester defects fixed after adversarial review

### Phase 2: Hardening and evidence (August 2026)

- Run-scoped candidate ids so an improved matcher can re-scan an unchanged catalog
- `entry_key` guards so the same catalog row cannot be paid or invoiced twice
- Match-accuracy benchmark harness on synthetic ground truth
- Seven ingester defects fixed against the official DDEX BWARM sample
- Crash-recoverable workflow mutations and scan publication

### Phase 3: Proof and demo (September 2026)

- Base proof v2 and shippable-facts sync
- Record-led demo website with interactive case review

## Challenges & Solutions

### Challenge 1: The parser had never seen real data

**The Problem:** Every fixture was synthetic. DDEX publishes a free 42 KB official BWARM sample, heavily scrubbed but real.

**The Solution:** Ran the ingester against it. It found seven defects, including one that would have reported ten fully-claimed works as recovery candidates. All seven were fixed, and the sample now ingests cleanly: 10 works, 0 skipped, every one at `claimed_share_pct=100`. The synthetic fixtures were restructured to reproduce the sample's real-world quirks.

**What I learned:** The sample still leaves gaps. Every ISWC and IPI in it is blank, so the exact-identifier path has still never seen real data, and the unclaimed-share file is 0 bytes. The STATUS document records exactly what the sample did and did not validate.

### Challenge 2: Run scoping removed an accidental guarantee

**The Problem:** Before run scoping, an id collision made overlapping leads impossible, so "one lead per row" held by accident. Adding run scoping (needed so a better matcher could re-scan) meant the same recovery could be paid and invoiced twice, because every money artifact was keyed on `candidate_id`.

**The Solution:** A second, run-independent `entry_key` on every lead, and sibling checks on both `record_payment` and `invoice` that iterate a sorted candidate list so the error names a stable sibling.

**What I learned:** Fix the invariant explicitly, and test each guard on its own.

### Challenge 3: Shares that do not add up

**The Problem:** Registry shares can be blank, can sum to more than 100 across writers, or can arrive as an unclaimed percentage with no claimed figure.

**The Solution:** Blank means unknown and is never inferred. A sum over 100 is emitted blank and counted as a warning. An unknown share yields `not_observed` before the `unclaimed` branch is even considered.

**What I learned:** In a recovery product, a fabricated candidate is worse than a missed one.

## Results & Metrics

- About 5,400 lines of standard-library Python in the `recovery` package, zero runtime dependencies
- 225 Python unit tests; 85 demo-site tests; CI matrix Python 3.10, 3.11, 3.12, 3.13
- 20 CLI commands
- Seven parser defects found and fixed against the official DDEX BWARM sample
- Synthetic benchmark at threshold 0.85: 72 positives and 56 negatives, precision 1.000, recall 0.556, FPR 0.000 (typo-tolerance evidence only, not production accuracy)
- Workflow guarantees: atomic state replacement, append-only journal, create-once packet and invoice paths, exclusive lock, checksummed payment evidence

**Boundaries, stated as the README states them:** no customers, no recovered dollars, and no measured production accuracy yet. Presto does not move money, submit portal claims, store credentials, or operate wallets. The Base proof timestamps packet integrity only; it proves nothing about ownership, payment, or recovery.

## Learnings

### What Worked Well

- Standard library only: nothing to install, and the golden-bytes fixture tests stay byte-identical across Python versions
- Two identities per lead, each solving one problem
- Writing down what the evidence does not validate, in STATUS, next to what it does

### What Didn't Work

- Synthetic fixtures alone. The first real sample found seven defects
- The benchmark's ground truth is synthetic, so its precision and recall cannot be quoted as accuracy

### What I'd Do Differently

- Get real sample data in front of the parser on day one
- Measure full-feed memory and latency before designing the indexing strategy

## Links & Resources

- **Demo site**: [prestorecovery.com](https://prestorecovery.com)
- The repository is private

---

**Completed:** September 9, 2026
