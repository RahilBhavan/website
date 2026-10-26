## Chapter 23 — Automated QA

### Learning objectives

- Know what each canonical command tests.
- Interpret passing results correctly.
- Identify automation limits.

### Why it matters

Tests are evidence only when their scope is understood.

### Explanation

Canonical commands:

```sh
node test.mjs
node smoke.mjs
python3 research/03_scripts/tests/test_extract.py
python3 research/03_scripts/validate_workbook.py
```

They cover:

- app pure logic;
- app boot and storage;
- normalized XBRL extraction;
- workbook structure, formulas, metadata, and invariants.

The **QA run stamped 2026-08-06** reported:

- 31 app unit groups passed.
- 17 smoke groups passed.
- 11 extraction groups passed over 863 rows.
- 1,005 workbook formulas passed.
- 105/105 semantic invariants passed.
- Automated page-count checks reported memo 4 pages, tearsheet 1 page, limitations 1 page, and physics appendix 1 page (`research/09_qa/qa_checklist.md`).

Page-count checks are not physical print approval. Grayscale and print inspection remain separate open human gates.

### Project connection

A unit test can prove `mergerMath()` rejects invalid consideration splits. It cannot prove a user understands the merger.

### Common mistakes

- Calling tests “approval.”
- Assuming extraction tests cover future filings.
- Treating page-count checks as print inspection.
- Presenting the 2026-08-06 evidence as timeless.

### Checklist

- [ ] Run all five commands.
- [ ] Record date and output.
- [ ] State coverage limits.
- [ ] Separate human gates.
- [ ] Keep page-count and print evidence distinct.

### Takeaways

A green suite supports precise claims, not universal correctness.

### Exercises and solution references

List one property each command proves and one it cannot prove. See `docs/05-testing-qa.md`.

### Sources/as-of

`README.md`; `docs/05-testing-qa.md`; QA run 2026-08-06.

---

