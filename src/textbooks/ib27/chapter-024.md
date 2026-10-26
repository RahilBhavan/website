## Chapter 20 — Spreadsheet Integrity

### Learning objectives

- Understand formula audits and semantic invariants.
- Explain cached-value risks.
- Distinguish automated and human checks.

### Why it matters

A workbook can be numerically consistent yet economically or evidentially weak.

### Explanation

`research/03_scripts/validate_workbook.py` checks:

- XLSX validity.
- Sheet names and order.
- Formula syntax.
- Cached values.
- Provenance metadata.
- Source IDs.
- Relationships and comments.
- Semantic invariants.
- Formula digest and canonical outputs.

The **QA run stamped 2026-08-06** reported 1,005 formulas, 1,005 audit rows, zero formula mismatches, and 105/105 invariants.

### Project connection

Human review remains necessary for Excel-engine recalculation, circular references, and print inspection.

### Worked example — Illustration

If a formula says `=B5-B6` but the cached value reflects an earlier formula, independent evaluation can catch the discrepancy.

### Common mistakes

- Treating a green validator as complete approval.
- Updating regression baselines automatically.
- Ignoring unsupported formulas.
- Presenting dated QA counts as timeless workbook properties.

### Checklist

- [ ] Run validator.
- [ ] Review first failure.
- [ ] Open in Excel.
- [ ] Force recalculation.
- [ ] Inspect print output.
- [ ] Attach QA run date to reported counts.

### Takeaways

Automation proves bounded properties; human gates prove real-world behavior.

### Exercises and solution references

Design an invariant for `Comps`: EV must equal equity value plus debt minus cash. See `research/03_scripts/validate_workbook.py`.

### Sources/as-of

`research/03_scripts/validate_workbook.py`; `docs/05-testing-qa.md`; QA run 2026-08-06.

---

