## Chapter 29 — Application Architecture and Persistence

### Learning objectives

- Explain application load order.
- Understand state validation and migration.
- Identify accessibility and security boundaries.

### Why it matters

The coach is a product with its own integrity requirements.

### Explanation

Load order:

```text
index.html
→ content.js
→ core.js
→ app.js
→ localStorage
```

Main storage key:

```text
ib27-roadmap-v2
```

Legacy `ib27-roadmap-v1` is migrated. Corrupt data is preserved under `ib27-roadmap-v2-corrupt` before empty-state startup. Restored JSON passes the same `validate()` function used at boot.

The app uses `textContent`, `replaceChildren`, and `setAttribute`, not unsafe `innerHTML`.

### Project connection

The **package inventory observed in the README/docs for the 2026-08-07 package** lists 57 lesson priorities, 219 flashcards, 124 quiz items, 26 mock prompts, and 53 recruiting deadlines. These counts should be re-verified after content changes; they are not enduring application facts.

### Worked example

A restored backup with an invalid quiz answer index should be rejected by `validate()` rather than silently loaded.

### Common mistakes

- Trusting restored JSON.
- Adding network calls to an offline SPA.
- Treating synthetic audio as proof of speaking ability.
- Ignoring keyboard and forced-colors support.
- Presenting package inventory counts without a version/date qualifier.

### Checklist

- [ ] Clean boot works.
- [ ] Corrupt storage is preserved.
- [ ] Restore validates.
- [ ] No network calls.
- [ ] Accessibility paths remain functional.
- [ ] Content counts are dated and source-cited.

### Takeaways

Application integrity and model integrity follow the same principle: validate inputs at the trust boundary.

### Exercises and solution references

Trace a corrupt-store path through `app.js`. See `docs/02-coach-application.md`.

### Sources/as-of

`index.html`; `content.js`; `core.js`; `app.js`; `README.md`; `docs/01-overview.md`; package inventory observed 2026-08-07.

---

