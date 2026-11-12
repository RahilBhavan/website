# BOX RAM guide review

Design authority: Rahil Design QSL 5.0.0, Correspondence; November 10, 2026. The existing site's global design is not migrated by this page.

The proposed route is /guides/box-ram, with an entry in /writing. The first screen uses Gloock regular with Archivo body, Correspondence paper/ink, an asymmetric desktop grid and a composed one-column phone opening. Source reference: Q273's margins and separation of expression from record. No reference scan is reproduced.

## Figure inventory

1. Latency bars: measured first/repeat p95 and maximum, shared zero-based 0–5 ms scale. Bar length is milliseconds divided by five. First p95/max 0.170/2.037 ms; repeat 0.199/4.063 ms. Consecutive uncontrolled windows, not an optimization trial.
2. Sample traces: all 602 actual replies. Each panel uses 0–60 seconds and 0–5 ms. Numeric publication rows are rounded to six decimals; summaries retain original precision. Short unsampled stalls, frames and visible interaction remain outside the method.
3. zram bars: 5,264,244,736 original bytes versus 1,473,019,904 bytes total allocation, divided by 2^30. Shared zero-based 0–5 GiB scale. Difference approximately 3.53 GiB, not a measured whole-host net saving or speed-up.
4. Mechanism: a logical admission/attribution/record/decision sequence, with numbered stages and explicit boundaries. Spacing does not encode duration or capacity.

All figures have text explanations, units, source dates, qualifications and accessible labels; no meaning depends on hue. Source text records a build admission timeout rather than claiming a completed-build result. Only numeric samples are downloadable; no private queue, host environment or account history is copied into public assets.

## Checks before publication

The source-derived self-contained design preview was inspected at 1280px and 390px. Both desktop and phone compositions retain labels and evidence qualifications; initial preview console had no errors. The preview cannot resolve the root favicon outside the running site; that is not evidence of a missing site asset.

QSL Correspondence ink/paper contrast is 9.65:1 and accent/paper 7.75:1, using the owning token check. Main essential plot labels are 14px or larger. Licensed font bytes and licenses are included in the website assets. The full guide remains present as native details when scripting is unavailable. No animation is required.

Final Astro build/link checks and browser tests must be recorded against the delivered commit. Added focused browser cases cover 602 marks, chapter controls, 320px overflow and hash navigation, public-only data, and optional-plot failure. This record does not claim Safari, physical touch, an independent reader study or accessibility certification.

The source hashes and final behavior receipts live with the task evidence; an approved release must identify its actual commit. No kernel, RAM, concurrency or recurring-automation change belongs to this website edit.
