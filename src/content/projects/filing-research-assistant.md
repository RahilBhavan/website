---
title: "Filing Research Assistant: Quote the Filing or Abstain"
tagline: "Answers SEC filing questions with verbatim quotes, checked before display"
description: "A local app that answers questions about Strategy, BitMine and Coinbase filings. A writer (an LLM, a local model or a model-free fallback) drafts one sentence, then a deterministic checker turns any non-verbatim quote or unquoted number into an abstention."
problem: "An LLM answer about a filing can cite a passage that doesn't contain its quote or its number. Asking the model for citations doesn't check them, so the check has to run in code before anyone sees the answer."
solution: "Built a retrieval and answer pipeline over six SEC filings. It fuses bge-small embeddings with BM25 to pick five passages from one filing, asks a writer for one sentence with exact quotes, and accepts the answer only if every quote is a substring of a retrieved passage and every multi-digit number appears in a quote."
result: "On 40 held-out questions written by the building agent, Haiku answered 26 of 30 correctly with verbatim quotes and abstained on 10 of 10 unanswerable ones."
status: "prototype"
verification: "109 unit tests pass. A Claude Sonnet judge agreed with the building agent's labels on 57 of 58 items. No human has reviewed the questions or labels. One run per writer."
next: "Human review of the questions and citations has not been done, and the app is not deployed; the Azure steps have not been run."
figure:
  src: "/images/projects/filing-research-assistant/checked-answer.webp"
  alt: "Local app answering how many bitcoins Strategy held as of July 24, 2026, with a verbatim quote of 843,775 bitcoins from its 10-Q, accession 0001050446-26-000044."
  caption: "The local app with no API key, so the model-free extractive writer produced this answer. The quote was checked verbatim before display."
kind: "ai tool"
track: "ai"
featured: false
githubUrl: "https://github.com/RahilBhavan/filing-research-assistant"
completedDate: 2026-10-21
---

## Overview

**The question:** Can an LLM answer questions about SEC filings so that every served quote is verbatim and every number in the answer comes from a quote, and abstain otherwise?

**The answer:** On 40 held-out questions frozen before any writer ran, Claude Haiku 5.5 answered 26 of 30 answerable questions correctly and abstained on all 10 unanswerable ones. The agent that built the system wrote the questions and labels, no human has reviewed them, and each writer ran once.

**How it differs from its siblings:** Unlike the [Financial Metrics Analyst](/projects/financial-metrics-analyst), which serves structured XBRL numbers, and the [Filing Change Tracker](/projects/filing-change-tracker), which compares two years of the same filing, this app answers a free-text question from one filing's narrative text and checks the quotes before showing them.

## How it works

1. The question names one company ticker and one filing accession.
2. Retrieval ranks the narrative passages in that filing. It fuses bge-small-en-v1.5 embeddings with BM25 by reciprocal-rank fusion and keeps the top 5.
3. One writer sees only those 5 passages: Claude Haiku through the Anthropic API or the Claude Code CLI, a local model through Ollama, or a model-free extractive fallback. It must return one sentence of at most 40 words with exact quotes, or abstain.
4. A deterministic checker accepts the answer only if every cited passage was retrieved, every quote is a substring of its passage, and every multi-digit number in the sentence appears in a quote. Anything else becomes an abstention.

The v3 corpus holds the latest 10-K and following 10-Q for Strategy, BitMine and Coinbase as of 2026-10-21, pinned by SHA-256, with 2,534 narrative passages. An earlier v2 flow over Docusign and Albany International filings uses BM25 retrieval and hand-written evidence gates, and calls no LLM. Without an API key the v3 flow falls back to the model-free extractive writer, but its default retrieval still needs the bge-small embedding model.

## Results

| Writer | Correct (judge) | Unanswerable abstained | False abstentions | p50 latency |
| --- | ---: | ---: | ---: | ---: |
| Claude Haiku 5.5, via Claude Code CLI | 26/30 | 10/10 | 4/30 | 2.31 s |
| Extractive fallback, no model | 16/30 | 7/10 | 6/30 | under 0.1 s |
| qwen2.5:0.5b, local through Ollama | 7/30 | 10/10 | 22/30 | 1.15 s |

These rates are on 40 questions, so one question moves a rate by about 3 points. Haiku attempted 27 answers and 26 passed the checker. Its cost was about $0.0003 per question at API list price.

Retrieval drove most of the misses. Embeddings fused with BM25 put a gold passage first for 27 of 30 answerable questions (MRR@5 0.900), against 23 of 30 for BM25 alone (0.811). Three of Haiku's four misses were abstentions where the gold passage wasn't in the top 5.

## How it was checked

- 109 unit tests pass, as of a rerun on October 24, 2026.
- The 40 held-out questions were frozen before any writer ran, and the retrieval method was picked on a separate 6-question dev split.
- Claude Sonnet, a different model from the writer, judged the served answers. It agreed with the labels on 57 of 58 items across the three writers. The labels and gold passages were written by the agent that built the system and have not been reviewed by a human.
- The Haiku run went through the Claude Code CLI because no API key was available. The `anthropic` provider is covered by unit tests only.

## Limits and next steps

- The checker verifies quotes and digits. It doesn't check entities, counts written as words or relevance, so a verbatim quote can still give a wrong answer.
- Only Business, MD&A and Risk Factors are indexed. Facts that live only in tables or notes are out of scope.
- One run per writer, and Haiku output isn't deterministic, so a rerun can differ.
- Not deployed. The container builds and runs locally, and the Azure steps have not been run. The independent citation review is written up but not done.
- Independent portfolio work, not affiliated with Strategy, BitMine, Coinbase, Docusign, Albany International or Anthropic, and not investment advice.

## Links

1. [Repository](https://github.com/RahilBhavan/filing-research-assistant)
2. [v3 evaluation report, with every Haiku miss](https://github.com/RahilBhavan/filing-research-assistant/blob/main/evaluation/treasury/REPORT.md)

---

**Completed:** October 21, 2026
