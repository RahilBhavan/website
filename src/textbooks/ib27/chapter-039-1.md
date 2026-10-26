### Sources/as-of

`docs/06-operations.md`; `PROJECT.md`; registered repository freezes.

---

# Appendix A — Glossary

**Accretion/dilution:** Percentage change in buyer EPS after a transaction.

**All-stock merger:** Target shareholders receive buyer shares rather than cash.

**Announced equity value:** Equity consideration calculated using announcement-date inputs.

**Break value:** Implied target standalone value under an assumed probability that a deal breaks.

**Consideration:** What target shareholders receive.

**Enterprise value:** Equity value plus debt and other claims, less cash and cash-like assets.

**Fairness opinion:** Adviser analysis of financial fairness from a specified perspective; it is not automatically an independent fairness determination by this project.

**Fixed exchange ratio:** Share ratio that does not change with buyer stock price.

**Ion implantation:** Process introducing dopants into semiconductor material.

**MOCVD:** Metal-organic chemical vapor deposition.

**Mid-cycle margin:** Normalized margin calculated over a selected cycle window; in this project, the window covers one selected broad-cycle period and is not a validated full-cycle normalization.

**Operating-proxy accretion:** EPS analysis excluding one or more final transaction accounting items.

**PPA:** Purchase-price allocation.

**Run-rate synergy:** Annualized savings target, not necessarily first-year realized savings. The frozen management guide targets delivery within 24 months, with the majority expected in the first 12 months; tax status is not established by the registered source.

**SAMR:** China’s State Administration for Market Regulation.

**Tie-out:** Reconciliation between a model value and an authoritative source value.

**XBRL:** Structured financial-reporting data format.

---

# Appendix B — Formula Reference

## Transaction

\[
Offer\ value/share=ACLS\ price\times0.3575
\]

\[
Shares\ issued=VECO\ shares\times0.3575
\]

\[
PF\ shares=ACLS\ shares+Shares\ issued
\]

\[
ACLS\ ownership=ACLS\ shares/PF\ shares
\]

\[
VECO\ ownership=Shares\ issued/PF\ shares
\]

## Operating model

\[
GP=Revenue-COGS
\]

\[
OI=GP-R\&D-SG\&A
\]

\[
NI=Pre-tax\ income-Taxes
\]

\[
EPS=NI/Diluted\ shares
\]

## Contribution

\[
Contribution_A=A/(A+V)
\]

\[
Contribution_V=V/(A+V)
\]

## Accretion

The following is an **illustrative operating-proxy identity**, not necessarily the complete frozen workbook formula:

\[
PF\ NI=ACLS\ NI+VECO\ NI+After-tax\ synergies-\text{transaction adjustments}
\]

\[
PF\ EPS=PF\ NI/PF\ shares
\]

\[
Accretion=PF\ EPS/ACLS\ EPS-1
\]

The project does not provide complete PPA, financing, costs-to-achieve, or diluted-share treatment.

## Spread

\[
Implied\ consideration=ACLS\ price\times0.3575
\]

\[
Dollar\ spread=VECO\ price-Implied\ consideration
\]

\[
Workbook\ spread=Dollar\ spread/Implied\ consideration
\]

\[
Break\ value=\frac{VECO\ price-p\times Deal\ value}{1-p}
\]

Any spread output is frozen market data **as of 2026-08-05 under the workbook convention** and is **not a recommendation or forecast**.

Source: `research/09_qa/claim_ledger.md`; applicable workbook cells; market data as of 2026-08-05.

---

# Appendix C — Repository Reference

| Path | Purpose |
|---|---|
| `PROJECT.md` | Scope and methodology |
| `README.md` | Public overview |
| `index.html` | App shell |
| `content.js` | Curriculum |
| `core.js` | Pure application logic |
| `app.js` | UI and persistence |
| `styles.css` | Presentation |
| `docs/01-overview.md` | Project overview |
| `docs/02-coach-application.md` | Coach behavior |
| `docs/03-deal-research.md` | Research workflow |
| `docs/04-workbook.md` | Workbook documentation |
| `docs/05-testing-qa.md` | QA |
| `docs/06-operations.md` | Operations |
| `research/01_sources/` | Registered sources and raw files |
| `research/03_scripts/` | Extraction, build, validation |
| `research/04_model/ACLS_VECO_Model.xlsx` | Model authority |
| `research/05_analysis/` | Analysis notes |
| `research/06_deliverables/` | Deliverable source copy and generated outputs |
| `research/09_qa/` | QA evidence |

Canonical checks:

```sh
node test.mjs
node smoke.mjs
python3 research/03_scripts/tests/test_extract.py
python3 research/03_scripts/validate_workbook.py
```

Passing commands do not close Excel, print, GitHub Pages, recording, oral-mastery, or fresh-data gates.

---

# Appendix D — Audit Checklists

## Provenance

- [ ] Every claim has a source.
- [ ] Every claim has a date.
- [ ] Raw data is immutable.
- [ ] Exceptions are documented.
- [ ] Assumptions are labeled.
- [ ] Pending values are not silently filled.

## Workbook

- [ ] Valid XLSX.
- [ ] Ten tabs in order.
- [ ] Metadata on numeric leaves where established by cited workbook evidence.
- [ ] Source IDs resolve.
- [ ] Formula audit passes.
- [ ] Semantic invariants pass.
- [ ] Ownership sums to 100%.
- [ ] S-4 tie-out works.
- [ ] Spread formulas work.
- [ ] Excel recalculation completed separately — unresolved/open in the frozen package.

## Deliverables

- [ ] Memo: automated page-count check reported four pages.
- [ ] Tearsheet: automated page-count check reported one page.
- [ ] Limitations: automated page-count check reported one page.
- [ ] Physics appendix: automated page-count check reported one page.
- [ ] Values match workbook.
- [ ] Sources appear near claims.
- [ ] Falsifiers included.
- [ ] No prohibited claims.
- [ ] Tearsheet one page; grayscale readability inspection remains open.

## Human gates

- [ ] Excel full recalculation.
- [ ] Circular-reference review.
- [ ] Grayscale print inspection.
- [ ] Authentic recordings.
- [ ] Oral practice without notes.
- [ ] Live Pages verification remains unverified in the 2026-08-07 package.
- [ ] Fresh-data review before current claims.

---

# Appendix E — Interview Question Bank

## Beginner

1. **What is the transaction?**  
   A pending all-stock merger with a fixed 0.3575 ACLS-share exchange ratio per VECO share.

2. **What is the deal worth?**  
   Approximately $2.13 billion announced equity value, using announcement-date inputs.

3. **What is accretion?**  
   Pro forma EPS divided by standalone ACLS EPS minus one.

4. **What are synergies?**  
   Expected benefits from combining companies. Management guided approximately $35 million of annual run-rate cost synergies, targeted within 24 months with the majority expected in the first 12 months. The registered source does not establish whether the guide is pretax or after-tax.

5. **What is the main finding?**  
   The $35 million annual run-rate guide is modest relative to revenue but large relative to current combined operating income; the ratio is a calculation from Q1 2026 operating-income inputs, not a valuation conclusion.

6. **What is a tie-out?**  
   A reconciliation between a model value and a filed or authoritative value.

7. **Why use XBRL carefully?**  
   ACLS and VECO use different concepts, so extraction requires concept-aware handling and hand checks.

8. **What is SAMR?**  
   China’s State Administration for Market Regulation. The frozen project reports its status as stated in registered transaction materials, but does not assign approval odds.

9. **What is a comparable company?**  
   A company used to contextualize operating performance and valuation.

10. **What is the project’s conclusion?**  
    The ratio appears within disclosed adviser fairness ranges and is reasonably positioned relative to selected contribution lenses; that is an analyst judgment, not proof of fairness. Economics depend on recovery, synergy realization, and unresolved transaction-accounting and financing items.

## Intermediate

1. **How did you calculate ownership?**  
   VECO shares multiplied by 0.3575 gives ACLS shares issued; issued shares are added to existing ACLS shares.

2. **Why does ownership differ slightly from the deck?**  
   Basic versus fully diluted treatment and different share-count vintages.

3. **Why use mid-cycle margins?**  
   To avoid treating a trough-year margin as permanent, while recognizing that FY2018–FY2025 is only one selected broad-cycle window.

4. **What is the limitation of mid-cycle analysis?**  
   The window is not a validated full-cycle normalization.

5. **Why not lead with a DCF?**  
   A cyclical DCF can create false precision; normalized earnings and comps are clearer primary lenses in this scoped project.

6. **What is the accretion bridge?**  
   An operating-proxy calculation using standalone ACLS NI, VECO NI, after-tax synergies where modeled, transaction adjustments where modeled, and pro forma shares. It is not a complete PPA, financing, costs-to-achieve, or diluted-share schedule.

7. **Why is no synergy dilutive?**  
   VECO’s current operating earnings are weak and new ACLS shares are issued.

8. **What is breakeven synergy?**  
   Approximately $9.482 million in the frozen FY2026E operating-proxy case.

9. **Why does the convert matter?**  
   Debt versus as-converted treatment changes enterprise value by approximately $225.7 million under the workbook framework.

10. **What is the spread?**  
    Approximately +10.72% under the workbook convention as of 2026-08-05, calculated as `(VECO − implied consideration) / implied consideration`; it is not a recommendation or forecast.

## Advanced and skeptical

1. **Did you build a bottoms-up synergy model?**  
   No. I stress-tested management’s $35 million annual run-rate guide, targeted within 24 months with the majority in the first 12 months. A bottoms-up build requires unavailable operating data.

2. **Did you calculate SAMR approval odds?**  
   No. The registered public evidence does not support a defensible probability.

3. **Did you complete a beta regression?**  
   No. The claim ledger explicitly says not to claim one.

4. **Did you validate Excel?**  
   The independent validator reported its results on 2026-08-06; Excel-engine recalculation remains an open human gate.

5. **Why trust the ratio?**  
   The ratio appears within the disclosed adviser fairness ranges and is reasonably positioned relative to the selected contribution lenses. Adviser ranges are adviser analyses, and contribution lenses do not mechanically determine value; this is an analyst judgment, not proof of fairness.

6. **What could falsify your view?**  
   Large PPA amortization, failed synergies, costs-to-achieve, prolonged trough conditions, regulatory failure, or customer and qualification weakness.

7. **Why is $35 million more important than it sounds?**  
   It is approximately 1.7 times annualized Q1 2026 combined operating income, a calculation from operating-income inputs rather than a valuation conclusion.

8. **What if the deal breaks?**  
   The spread tracker shows illustrative break values under assumed probabilities as of the frozen market-data date; those are scenarios, not standalone valuations.

9. **What did the validator prove?**  
   The 2026-08-06 run proved bounded structural, formula, provenance, and invariant conditions. It did not prove economic truth, Excel-engine recalculation, print quality, or human mastery.

10. **What would you do next?**  
    Complete PPA, financing, diluted shares, cash flow, synergy build, multi-cycle normalization, event study, and human release gates.

---

# Appendix F — Exercises and Solution Index

| Exercise | Skill | Reference |
|---|---|---|
| Calculate implied offer value | Transaction arithmetic | `Merger`, `Spread` |
| Calculate shares issued | Ownership | `PROJECT.md`, §8 |
| Reconcile basic and fully diluted ownership | Definition control | `Merger` notes |
| Calculate gross and operating margins | Accounting | `ACLS Hist`, `VECO Hist` |
| Build EV bridge | Valuation | `Comps` |
| Calculate contribution mixes | Exchange-ratio analysis | `Contribution` |
| Build forecast cases | Forecasting | `ACLS Model`, `VECO Model` |
| Build synergy cases | Accretion | `Merger` |
| Solve breakeven synergy | Inverse modeling | `Merger!B88` |
| Calculate spread and break value | Market context | `Spread` |
| Test source metadata | Provenance | `research/03_scripts/validate_workbook.py` |
| Separate automated and human QA | Release discipline | `docs/05-testing-qa.md` |
| Write a one-page conclusion | Communication | `research/06_deliverables/deliverable_copy.py` |
| Practice a pitch | Interviewing | `project-pitch-30s.md`, `project-pitch-90s.md` |

This appendix is **study guidance**, not evidence that each exercise has been completed or that the project has been validated by completing every exercise.

A satisfactory study response should state:

1. Formula.
2. Inputs.
3. Units.
4. Source path.
5. As-of date.
6. Classification.
7. Limitation.
8. Reconciliation to the workbook where applicable.

---

# Appendix G — Source and As-of-Date Register

## Core dates

| Item | Date | Meaning |
|---|---|---|
| Repository scope freeze | 2026-08-03 | Scope definition freeze |
| Merger signed | 2025-09-30 | Agreement execution |
| Merger announced | 2025-10-01 | Public announcement |
| Initial outside date | 2026-09-30 | Agreement deadline |
| First extension | 2027-03-30 | Limited regulatory extension |
| Second extension | 2027-06-30 | Limited regulatory extension |
| Model market-data freeze | 2026-08-05 | Workbook market-data as-of |
| QA run | 2026-08-06 | Automated QA evidence |
| Packaging refresh | 2026-08-07 | Package and scorecard refresh |
| Audit performed | 2026-08-09 | No freshness beyond registered freezes is implied |

## Primary sources

- Merger agreement and 8-K exhibits.
- Rule 425 filings.
- Investor presentation.
- Press release.
- S-4/A.
- 424B3.
- ACLS FY2025 10-K.
- VECO FY2025 10-K.
- ACLS Q1 2026 10-Q.
- VECO Q1 2026 10-Q.
- SEC companyfacts and submissions.
- Registered price files.

These are the **latest registered sources in the frozen package**, through the dates recorded in `research/01_sources/source_register.csv`. They must not be described as current without a retrieval date.

Exact URLs and identifiers are preserved in `research/01_sources/source_register.csv` and `PROJECT.md`.

## Frozen claims

- Exchange ratio: 0.3575.
- Announced equity value: approximately $2,130.45 million.
- Basic ownership: 58.48% / 41.52%.
- Synergy guide: $35 million annual run-rate, targeted within 24 months with the majority in the first 12 months; pretax or after-tax status unresolved.
- Synergy/current annualized OI: approximately 1.7x, calculated from Q1 2026 operating-income inputs.
- FY2026E base EPS: $2.1304.
- FY2026E base accretion: +6.52%.
- Breakeven synergy: $9.482 million.
- Spread: +10.72% as of 2026-08-05 under the workbook convention; not a recommendation or forecast.
- Break values: approximately $58.87, $61.46, and $69.26 under assumed probabilities.
- Six-peer comps.
- Selected S-4 variance: **$0.000mm within float tolerance for `Merger!G73:G76`**.
- Mid-cycle OI mix: 74.17% / 25.83%.

## Explicit non-claims

The repository does not establish:

- SAMR approval probability.
- Formal beta/event-study regression.
- Bottoms-up synergy build.
- Final PPA.
- Final post-closing diluted-share schedule.
- Authentic pitch mastery from synthetic audio.
- Fresh information beyond the registered freezes.
- Proprietary or channel-checked forecasts.
- A trading recommendation.
- A complete audit.
- Quantified customer-overlap, qualification, commercial-reach, service-breadth, or revenue-synergy results.

---

# Executive Summary

IB27 is a disciplined public-data transaction project joined to an offline interview-coaching application. Its analytical spine is the question of whether the fixed 0.3575 ACLS-for-VECO exchange ratio appears reasonable and whether the combined company appears attractive under the stated operating-proxy assumptions.

The project’s strongest evidence is:

- Registered primary filing and XBRL sourcing in the frozen package.
- Immutable raw-data handling.
- Explicit source-of-truth hierarchy.
- Historical tie-outs.
- Six-peer EV-based comps.
- Contribution analysis across revenue, operating income, mid-cycle operating income, and market-cap contribution.
- A ten-tab workbook whose **2026-08-06 validator run reported 1,005 formulas and 105/105 semantic invariants**.
- Transparent no/base/full synergy cases.
- Explicit separation between automated QA and human gates.

The central economic conclusion is conditional. The base operating-proxy case is accretive, but the no-synergy case is dilutive. Management’s $35 million annual run-rate guide, targeted within 24 months with the majority expected in the first 12 months, is approximately 1.7 times annualized Q1 2026 combined operating income. This is a calculation from operating-income inputs, not a valuation conclusion. Accordingly, the transaction depends materially on recovery and synergy realization.

The project does not support a precise SAMR approval probability, a formal spread regression, a bottoms-up synergy build, final purchase accounting, complete diluted shares, current market claims beyond the applicable freeze, or authentic speaking mastery based on synthetic audio.

---

# Standalone Glossary Pointer

Use **Appendix A** for concise definitions of transaction, accounting, semiconductor, provenance, and modeling terms. For exact project meaning, consult the cited workbook tab, source path, and as-of date rather than relying on a generic definition.

---

# Unresolved Evidence Gaps

1. Excel-engine full recalculation and circular-reference review.
2. Physical grayscale and arm’s-length print inspection.
3. Live GitHub Pages verification.
4. Authentic user recordings and oral pitch mastery.
5. Final purchase-price allocation.
6. Final diluted-share treatment.
7. Bottoms-up synergy schedule.
8. Costs-to-achieve and integration timing.
9. Complete balance-sheet and cash-flow model.
10. Multi-cycle normalized operating history.
11. Formal beta/event-study analysis.
12. Defensible SAMR approval probability.
13. Fresh SEC, market, and regulatory review beyond the registered freezes.
14. Customer qualification, channel, and order-book evidence.
15. Quantified cross-selling or portfolio synergies.

---

# Study Plans

## One day

