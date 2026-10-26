## Chapter 16 — Forecast Mechanics

### Learning objectives

- Build revenue, margin, expense, tax, and EPS forecasts.
- Understand incremental gross margin.
- Test sensitivity.

### Why it matters

Forecast mechanics are where analyst judgment enters most visibly.

### Explanation

Revenue:

\[
R_t=R_{t-1}(1+g_t)
\]

Gross profit:

\[
GP_t=GP_{t-1}+(R_t-R_{t-1})\times IGM
\]

Expenses may use FY2025A expense-to-revenue ratios. Taxes use explicit, clearly labeled assumptions or conventions.

### Project connection

The model uses base, downside, and upside cases. Growth and tax inputs are labeled analyst assumptions. The effective-tax ruling remains unresolved in scope.

### Worked example — Illustration

Revenue grows from $900 million by 12%:

\[
900(1.12)=1{,}008
\]

At 42% gross margin:

\[
1{,}008(42\%)=423.36
\]

### Common mistakes

- Applying incremental margin to total revenue.
- Hiding assumption cells.
- Calling flat revenue a forecast fact.
- Treating an illustrative 25% tax convention as a resolved effective tax rate.

### Checklist

- [ ] Historical anchor is sourced.
- [ ] Driver block is visible.
- [ ] Cases are explicit.
- [ ] Formula checks reconcile.

### Takeaways

The best forecast is not the most detailed; it is the most transparent and testable.

### Exercises and solution references

Rebuild one standalone forecast with 8%, 12%, and 20% growth. Compare EPS. See `ACLS Model` and `VECO Model`.

### Sources/as-of

`research/03_scripts/build_workbook.py`; `research/09_qa/formula_audit.csv`; workbook freeze 2026-08-05.

---

