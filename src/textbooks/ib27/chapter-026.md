## Chapter 21 — From Raw Filing to Model Input

### Learning objectives

- Explain immutable raw data.
- Understand normalization and exception handling.
- Preserve retrieval identity.

### Why it matters

Without provenance, a changed number cannot be explained.

### Explanation

The chain is:

```text
raw source → normalized data → workbook → deliverable → claim ledger
```

Raw SEC responses are hashed and not overwritten. Live pulls require `SEC_CONTACT_EMAIL`. `--reuse-raw` performs offline re-extraction and does not make information current.

### Project connection

Issuer-specific XBRL tags and fallback logic are recorded as extraction exceptions. Normalization improves usability but does not erase judgment.

### Worked example — Illustration

A VECO revenue concept differs from ACLS’s concept. The extractor can normalize both to `revenue`, but the source tag remains part of provenance.

### Common mistakes

- Overwriting raw data.
- Updating a date without refreshing inputs.
- Treating normalized labels as identical economics.
- Calling re-extraction a fresh-data refresh.

### Checklist

- [ ] Raw files immutable.
- [ ] Checksums preserved.
- [ ] Retrieval date recorded.
- [ ] Exceptions documented.
- [ ] Source IDs resolve.

### Takeaways

Normalization is a transformation, not a new primary source.

### Exercises and solution references

Trace a revenue value from raw SEC response to `ACLS Hist`. See `docs/03-deal-research.md`.

### Sources/as-of

`research/03_scripts/xbrl_pull.py`; `docs/06-operations.md`; registered source data through the dates recorded in `research/01_sources/source_register.csv`.

---

