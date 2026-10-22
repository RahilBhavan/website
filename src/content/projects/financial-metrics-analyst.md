---
title: "Financial Metrics Analyst: Traced SEC Numbers Over MCP"
tagline: "An MCP server for SEC facts and exact ratios, with a gate on every agent number"
description: "A standard-library MCP server that returns SEC XBRL facts and exact ratios with filing accessions, plus an optional Claude agent whose answers are withheld if they contain a number no tool returned."
problem: "An LLM asked for a company's operating margin can return a plausible number with no filing behind it. Even SEC companyfacts data needs rules for which fact counts, because one period can carry several candidate values, a restated figure or a missing tag."
solution: "Built a hand-written MCP stdio server on the Python standard library with 7 tools: 4 for SEC facts and ratios over reviewed Apple, Microsoft and NVIDIA periods, and 3 read-only treasury tools over a frozen dat-accretion export. Every number carries its filing accession. An optional Claude agent answers through the server, and a tracer withholds any answer with a number no tool returned."
result: "In one run of 50 frozen tasks, all 368 numbers in the agent's delivered answers traced to a tool result, and the gate withheld 1 answer."
status: "prototype"
verification: "114 unit tests (113 pass, 1 skipped), a 161-case eval against filing values transcribed by hand and not reviewed by others, and 28 of 28 checks with the official MCP SDK."
next: "The agent eval is one run of templated tasks, with no variance or prompt-injection test. The Messages API backend has not been run live."
figure:
  src: "/images/projects/financial-metrics-analyst/apple-report.webp"
  alt: "Apple FY2023 to FY2025 report table in USD millions: revenue 383,285, 391,035 and 416,161, with gross profit, operating income, net income, margins and revenue growth."
  caption: "The demo report from the bundled SEC snapshot of September 21, 2026. Footnotes on two growth figures warn that they compare years of unequal length."
kind: "ai tool"
track: "ai"
featured: false
githubUrl: "https://github.com/RahilBhavan/financial-metrics-analyst"
completedDate: 2026-10-21
---

## Overview

**The question:** Can an LLM answer questions about company financials without ever stating a number that didn't come from a filing?

**The answer:** In one run of a frozen 50-task set, yes for what it delivered. All 368 numbers in delivered answers traced to a tool result, and the gate withheld 1 answer instead of serving an untraced number. That is one run of templated tasks, not a measure of open-ended questions.

**How it differs from its siblings:** Unlike the [Filing Change Tracker](/projects/filing-change-tracker), which compares the text of two 10-Ks, and the [Filing Research Assistant](/projects/filing-research-assistant), which answers from quoted narrative passages, this project serves structured XBRL numbers and computes ratios, and the server itself calls no model.

## How it works

The project has two parts.

The first is an MCP (Model Context Protocol) server over stdio, written without the MCP SDK. It exposes 7 tools with closed input schemas and full nested output schemas. Four SEC tools resolve a company, return annual or quarterly facts and calculate metrics: revenue, gross profit, operating income, net income attributable to the issuer, gross and operating margin, and revenue growth. Three read-only treasury tools serve per-share figures for Strategy, BitMine and SharpLink from a frozen export of [dat-accretion](https://github.com/RahilBhavan/dat-accretion).

The selector picks one fact per period by exact dates, approved US-GAAP tag, form and filing cutoff, records rejected candidates and revisions, and computes exact rational ratios. When it can't answer safely, it says so. "Microsoft profit 2025" returns `needs_clarification`, an unsupported metric returns `refused`, and a newer conflicting filing blocks a stale value. The Kraft Heinz reference case flags FY2017 operating income restated from $6,773M to $6,057M.

The second part is an optional Claude agent. The model proposes tool calls and writes prose, but it never computes numbers. Before an answer goes out, a tracer checks every number in it against that run's tool results. An answer with an untraced number gets one rewrite. If the rewrite fails too, the answer is withheld.

## Results

These come from one run on 2026-10-21 with `claude-haiku-5-5` through the Claude Code CLI. The 50 tasks were committed before any agent run.

| Check | Result |
| --- | ---: |
| Correct tool and arguments, 42 in-scope tasks | 42 / 42 |
| Expected numbers quoted in the delivered answer | 41 / 42 |
| Numbers in delivered answers traced to a tool result | 368 / 368 |
| Numbers in first drafts traced, before the gate | 379 / 383 |
| Out-of-scope refusals | 8 / 8 |
| False refusals on in-scope tasks | 0 |
| Mean cost per task (CLI-reported, list price) | $0.0013 |

The withheld answer (Microsoft FY2026 gross margin) is worth reading. The first draft wrote a warning code as "older than 7 days", and the tracer, which doesn't read numbers inside identifiers, flagged the 7. That was a false positive. The rewrite then mistyped the period start date, and the gate caught a real error.

## How it was checked

- 114 unit tests: 113 pass and 1 is skipped unless a dat-accretion checkout is present. A rerun on October 21, 2026 gave the same result.
- A 161-case source and intent evaluation passes 161 of 161. Its expected values are hand transcriptions from 10-K, 10-Q and annual-report filings, written by the author or the building agent and not reviewed by anyone else.
- The official `mcp==1.30.0` Python SDK passes 28 of 28 interoperability checks against the server. That is evidence with one second client, not protocol certification.
- In the agent eval, expected numbers come from the same deterministic tools, so it measures tool use and quoting, not tool correctness.

## Limits and next steps

- Coverage is narrow: 3 issuers with reviewed annual periods and 1 reviewed NVIDIA quarter.
- The agent eval is a single run of templated tasks. It doesn't measure open-ended questions, run-to-run variance or prompt-injection resistance.
- Tracing proves a number came from a tool result. It doesn't prove the number is attached to the right label.
- The Messages API backend has not been run live, and no live SEC refresh with a user's contact information was run.
- Independent portfolio work, not affiliated with the SEC, Anthropic or any issuer named here.

## Links

1. [Repository](https://github.com/RahilBhavan/financial-metrics-analyst)
2. [Agent design and the 50-task evaluation](https://github.com/RahilBhavan/financial-metrics-analyst/blob/main/docs/treasury-agent.md)
3. [The 161-case evaluation record](https://github.com/RahilBhavan/financial-metrics-analyst/blob/main/EVALUATION.md)

---

**Completed:** October 21, 2026
