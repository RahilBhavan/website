## Chapter 15 — Key Formulas

### Learning objectives

- Reproduce core model formulas.
- Understand formula provenance.
- Distinguish arithmetic from judgment.

### Why it matters

A formula tells you how an output is calculated, not whether its inputs are sensible.

### Explanation

Core formulas:

\[
GM=GP/Revenue
\]

\[
OI=GP-R\&D-SG\&A
\]

\[
Issued=VECO\ shares\times0.3575
\]

\[
PF\ shares=ACLS\ shares+Issued
\]

\[
PF\ EPS=PF\ NI/PF\ shares
\]

\[
Accretion=PF\ EPS/ACLS\ EPS-1
\]

### Project connection

The workbook validator independently evaluates supported formulas and compares results with cached values.

### Worked example — Illustration

If $35 million of synergy were hypothetically taxed at 25%:

\[
After-tax\ synergy=35(1-25\%)=26.25
\]

This is educational arithmetic only. It does not establish that the frozen $35 million management guide is pretax, after-tax, or treated this way in the workbook.

### Common mistakes

- Confusing after-tax and pre-tax synergy.
- Using rounded shares in exact formulas.
- Treating a sensitivity input as a sourced fact.
- Treating an illustrative tax example as the project’s tax conclusion.

### Checklist

- [ ] Formula is documented.
- [ ] Inputs have provenance.
- [ ] Units are consistent.
- [ ] Rounding occurs at presentation, not prematurely.
- [ ] Illustrations are labeled.

### Takeaways

Formula transparency does not eliminate assumption risk.

### Exercises and solution references

Derive breakeven synergy by setting pro forma EPS equal to standalone EPS. See `Merger!B88`.

### Sources/as-of

`research/03_scripts/validate_workbook.py`; `docs/04-workbook.md`; workbook freeze 2026-08-05.

---

