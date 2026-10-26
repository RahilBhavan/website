## Chapter 32 — Responsible Extensions

### Learning objectives

- Prioritize future improvements.
- Avoid inventing unavailable information.
- Preserve evidence across versions.

### Why it matters

The right next step is the one that improves decision usefulness without weakening provenance.

### Explanation

Priority extensions:

1. Complete PPA and financing.
2. Build fuller net income and diluted shares.
3. Develop bottoms-up synergies.
4. Add balance sheet and cash flow.
5. Test multiple cycles.
6. Formalize spread/event analysis.
7. Create dated live-data refreshes.
8. Complete human release gates.

Every extension should pass:

- Decision relevance.
- Sourceability.
- Checkability.
- Scope control.
- Honest language.

### Project connection

A future refresh must preserve the 2026-08-05 market-data freeze and the 2026-08-03 scope freeze, create new dated raw inputs, update the source register, regenerate outputs, and re-run QA.

### Worked example

A PPA extension should show:

```text
Original assumption
→ closing disclosure
→ incremental amortization
→ after-tax EPS impact
→ revised accretion
→ changed conclusion, if any
```

### Common mistakes

- Overwriting the original freeze.
- Adding detail without decision impact.
- Treating a new scenario as a discovered fact.
- Calling a future refresh current before source and QA review.

### Checklist

- [ ] Preserve prior evidence.
- [ ] Add only decision-relevant detail.
- [ ] Label new assumptions.
- [ ] Re-run human and automated checks.
- [ ] Record new source dates.

### Takeaways

Responsible extension means deeper evidence, not more decorative complexity.

### Exercises and solution references

Rank the eight extensions by impact and explain your order. See `docs/06-operations.md`.

