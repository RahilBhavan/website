## Chapter 4 — Reading Filings as Model Inputs

### Learning objectives

- Extract period, unit, sign, and source correctly.
- Distinguish quarterly, annual, and point-in-time data.
- Understand tie-outs.

### Why it matters

A formula cannot repair a misread filing.

### Explanation

For each input record:

```text
Company | Filing | Period | Statement | Line item | Units | Sign | Source
```

The workbook’s `TIEOUT` tab uses:

\[
\text{Signed variance}
=
\text{Workbook amount}
-
\text{Source amount}
\]

The selected S-4 income-statement lines in `Merger!G73:G76` show **$0.000mm variance within float tolerance** in the QA evidence.

### Project connection

ACLS and VECO use different XBRL revenue concepts. The project therefore hand-checks machine-extracted figures against printed filings.

### Worked example

\[
0.3575\times\$97.64\approx\$34.91
\]

\[
\$34.91\times61.033485\text{mm}
\approx\$2.13\text{bn}
\]

The locked workbook value is approximately $2,130.45 million.

### Common mistakes

- Mixing annual and quarterly values.
- Confusing weighted-average and shares-outstanding counts.
- Treating a filing date as a period date.
- Rounding before the final calculation.
- Describing “effectively zero” without a cell range and tolerance.

### Checklist

- [ ] Source and date recorded.
- [ ] Period matched.
- [ ] Units matched.
- [ ] Sign convention documented.
- [ ] Variance explained.
- [ ] Selected tie-out cells identified.

### Takeaways

A filing input is not complete until its identity and period are known.

### Exercises and solution references

Classify the exchange ratio, growth rate, EPS accretion, and ratio judgment. See Chapter 1 and `research/09_qa/claim_ledger.md`.

### Sources/as-of

`docs/03-deal-research.md`; `docs/04-workbook.md`; `research/09_qa/claim_ledger.md`; QA evidence for `Merger!G73:G76`.

---

