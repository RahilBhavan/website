# Project design review — October 26, 2026

## Final scope

Strategy coverage, DAT accretion, MARA, Spine, Presto and MEV. Three agents
reworked the six narratives; an independent review identified two repaired
navigation/mobile issues. Shared layout, evidence panels, source links, social
cards and same-domain aliases have now been updated together.

## Governing spec

Rahil Design 3.11.0. Charcoal/white/yellow; Anton display and IBM Plex Sans body.
Canonical display clamp, line height, tracking, body size, and radii. Native light
figure panels use only figure-role tokens. No entrance animation hides content.

All six pages now have readable evidence panels rather than thumbnail-sized
screenshots. The panels preserve historical dates, modeled/hypothetical labels,
pre-launch limits and calibration caveats. Original product screenshots remain
available as labeled source links; no screenshot was repainted or presented as
a newly implemented project interface.

The six link-preview cards are generated from the evidence data and use local
embedded fonts. MARA and Spine now use local cards rather than remote overrides.
The renderer uses one Firefox process and checks vertical fit. It accepts a list
of project slugs, so unrelated cards need not be regenerated.

## Exercised checks

- `bun run check`: Astro diagnostics/build, 81 internal pages, 28 crosslinks,
  and 14 tests passed. Existing unused-import hint and Node deployment-version
  notice remain unrelated to these changes.
- Firefox: six pages at 1280, 390 and 320px; zero horizontal overflow, broken
  images or page errors. Fonts, computed palette/body type, section anchors,
  native evidence text sizes, keyboard focus and source-artifact HTTP links pass.
- Social cards: all six fit 1280×640; actual fonts loaded; 160px headlines and
  72px labels exceed 40px/18px at a 326px display width.
- Rahil Design system: 19 contrast pairs, five pairs across three CVD simulations,
  zero errors. Native figure text pairs exceed 4.5:1.
- Design lint passes for the shared page, evidence component, social generator
  and all six generated card sources. The earlier anchor false positive is gone.
- Present Data figure briefs pass for all six native panels. Warnings record
  that an independent human comprehension test has not been performed.
- Desktop/mobile evidence panels and all six preview cards were inspected visually.
- `git diff --check` passed.

QA script: `scripts/project-design-review.mjs`; serve the built site on port 4337.
Review output, source/artifact hashes, briefs and pending media receipts:
`/home/rahil/.t3/projects/main/exports/project-design-20261026/`.

## Limits and delivery state

No Safari, Windows or physical-device checks. Redirect configuration was checked
for valid destinations but awaits deployment to exercise hosting behavior.
Original screenshot contents are preserved historical source artifacts, not
certified current app designs. Agent visual checks do not substitute for Rahil’s
approval: final media review records remain pending. No publication or deployment was performed. Commit and push are authorized separately by Rahil;
the Git history records the delivery state.
