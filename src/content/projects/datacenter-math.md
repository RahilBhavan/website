---
title: "Datacenter Math"
tagline: "Rack-to-grid, KV cache, and $/token calculator with the course's numbers as tests"
description: "A single-page calculator that follows a GPU rack from grid current to the price of a token: rack kW, line current at 480 V AC and 800 V DC, facility MWh and water per day, KV cache concurrency, and dollars per million tokens. Every formula is checked against the worked examples in the From Watts to Tokens course."
problem: "GPU performance work stops at the rack boundary. The power, cooling, and cost numbers that decide whether a cluster is late, water-limited, or too expensive per token live in a different vocabulary, and the worked examples that teach them are spread across a sixteen-chapter course."
solution: "Wrote the course's formulas as pure functions with the course's worked numbers as unit tests, then wired them to three small forms on one static page: rack to grid, KV cache and concurrency, and dollars per token. No frameworks, no build step, and every output names its denominator."
kind: "tool"
featured: true
demoUrl: "https://rahilbhavan.com/tools/datacenter-math/"
githubUrl: "https://github.com/RahilBhavan/website"
completedDate: 2026-09-21
---
## Overview

**What it is:** One static page with three calculators. The first takes a rack description and returns line current at 480 V AC three-phase and 800 V DC, facility MW, MWh per day, and water intake per day. The second takes a model preset, KV dtype, and HBM pool and returns KiB per token and how many full-context requests fit. The third turns a GPU-hour price and a throughput into dollars per million tokens.

**Why it matters:** The same rack looks different to a facility engineer, an inference engineer, and a finance lead. Feeding all three views from the same inputs makes the tradeoffs visible: halve context length and concurrency roughly doubles; halve throughput and the token price doubles.

## What it computes

- Rack IT power from GPU count, watts per GPU, and an overhead fraction for CPU, NIC, and fans
- Line current: I = P / (sqrt(3) x V x PF) for three-phase AC, I = P / (V x PF) for DC
- Facility MW from IT kW and PUE, then MWh per day and litres of water per day at a stated L per IT kWh
- KV cache bytes per token: 2 x layers x KV heads x head dim x bytes per element
- Resident requests: floor(pool / (context x bytes per token))
- Dollars per million tokens: GPU-hour price / (tokens per second x 3600) x 10^6

The functions live in a dependency-free ES module. A Node test file checks them against the course's worked numbers: 100 kW at 480 V is about 120 A, Llama 3.1 70B in BF16 is 320 KiB per token, and a 64 GiB pool holds 25 requests at 8K context.

## Sources

- [From Watts to Tokens](https://kiankyars.github.io/gigawatt/), Kian Kyars, draft updated 2026-09-10. All formulas and worked examples.
- H100 one-year rental ranges on the page are the course's dated 25th to 75th percentile observations: $1.45 to 1.95 per GPU-hour in October 2025 and $2.10 to 2.70 in April 2026.

---

**Completed:** September 21, 2026
