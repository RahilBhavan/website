## Chapter 3 — The End-to-End Analytical Workflow

### Learning objectives

- Describe the research-to-deliverable workflow.
- Understand why each stage exists.
- Identify where human review enters.

### Why it matters

A good model is a chain, not a spreadsheet isolated from evidence.

### Explanation

The workflow is:

1. Freeze scope.
2. Register primary sources.
3. Preserve raw SEC and price files.
4. Normalize data.
5. Run extraction tests.
6. Build historical tabs.
7. Tie to filings.
8. Build standalone models.
9. Analyze contribution and peers.
10. Review S-4 mechanics.
11. Build merger and accretion schedules.
12. Stress synergies.
13. Track the spread as dated context.
14. Generate deliverables.
15. Run automated QA.
16. Complete human gates.

### Project connection

The project requires a source reference beside every material fact. Raw data is immutable. New retrievals receive new dated files. The 2026-08-03 scope freeze, 2026-08-05 model market-data freeze, 2026-08-06 QA stamp, and 2026-08-07 packaging refresh have distinct meanings.

### Worked example

A revenue number should travel:

```text
SEC filing
→ raw response
→ normalized fact
→ historical workbook cell
→ formula
→ memo sentence
→ claim ledger
```

### Common mistakes

- Starting with a chart before freezing the question.
- Treating XBRL extraction as infallible.
- Mixing announcement-date and frozen market prices.
- Calling automated tests approval.

### Checklist

- [ ] Scope is frozen.
- [ ] Raw files are hashed.
- [ ] Tie-outs are visible.
- [ ] Model assumptions are labeled.
- [ ] Human gates are tracked separately.

### Takeaways

The workflow turns public data into reviewable judgment.

### Exercises and solution references

Draw the evidence chain for the exchange ratio.  
**Solution:** agreement or S-4 → source register → workbook `Merger!B3` → claim ledger → deliverable source copy.

### Sources/as-of

`PROJECT.md`; `docs/03-deal-research.md`; `docs/05-testing-qa.md`.

---

