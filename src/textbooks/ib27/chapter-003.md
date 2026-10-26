## Chapter 2 — Repository and System Architecture

### Learning objectives

- Locate application, research, model, deliverable, and QA files.
- Explain the two-system architecture.
- Identify sources of truth.

### Why it matters

A repository with multiple outputs needs explicit authority rules. Otherwise, generated PDFs, copied prose, and stale workbooks can diverge.

### Explanation

The application layer consists of:

- `index.html`: structure and mounts.
- `content.js`: lessons, cards, quizzes, prompts, deadlines.
- `core.js`: pure validation, scheduling, mastery, merger math.
- `app.js`: DOM, events, persistence, exports.
- `styles.css`: themes, accessibility, print behavior.

The research layer consists of:

- `research/01_sources/`: source register and immutable raw files.
- `research/02_data/`: normalized facts.
- `research/03_scripts/`: extraction, build, and validation.
- `research/04_model/`: authoritative workbook.
- `research/05_analysis/`: factsheets, S-4 notes, drills.
- `research/06_deliverables/`: memo, tearsheet, limitations.
- `research/09_qa/`: claim ledger, formula audit, completion status.

The authority chain is:

1. Scope.
2. Registered and immutable raw sources.
3. Workbook/model.
4. Claim ledger and deliverable source copy.
5. Generated outputs.

QA records test results but does not override source evidence. `research/06_deliverables/deliverable_copy.py` is source copy for generated narrative outputs, not an independent authority for model economics.

### Project connection

The repository structure observed in the **2026-08-07 package** must be re-verified after any refresh.

### Worked example

A memo number that differs from the workbook should be reconciled to the workbook cell, source evidence, claim ledger, and applicable deliverable source copy. It should not be accepted merely because the PDF looks polished.

### Common mistakes

- Editing generated PDF text instead of authoritative source copy.
- Overwriting raw SEC files.
- Treating `README.md` as the model.
- Adding network calls to the offline coach.
- Treating QA records as superior to source evidence.

### Checklist

- [ ] Know the authority for each claim.
- [ ] Preserve raw files.
- [ ] Use relative repository paths in citations.
- [ ] Keep app and research runtime rules separate.
- [ ] Re-verify the package structure after a refresh.

### Takeaways

Repository architecture is part of analytical integrity.

### Exercises and solution references

List the ten workbook tabs and identify the authority for model economics.  
**Solution:** `docs/04-workbook.md`; the workbook is authoritative for model economics.

### Sources/as-of

`CLAUDE.md`; `docs/01-overview.md`; `docs/02-coach-application.md`; `docs/03-deal-research.md`; repository structure observed in the 2026-08-07 package.

---

