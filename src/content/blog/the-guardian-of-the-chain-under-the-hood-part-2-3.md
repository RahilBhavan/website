---
title: "The Guardian of the Chain: Under the Hood (Part 2/3)"
description: "Part 2 of the Guardian series: Deep dive into Rust architecture, blockchain reorg handling, and the safety-first Guardian pipeline."
publishDate: 2026-01-27
tags: ["rust", "architecture", "blockchain", "defi", "systems-design"]
draft: false
---

# The Guardian of the Chain: Under the Hood (Part 2/3)

## Introduction

**Hook:** Building a system that can autonomously pause a billion-dollar protocol requires a level of engineering rigor beyond a typical "bot." Every design decision must prioritize safety, reliability, and correctness.

**Context:** In [Part 1](/blog/the-guardian-of-the-chain-sleep-soundly-part-1-3/), we introduced the Smart Contract Invariant Monitor & Guardian and explained why runtime verification matters. Today, we're popping the hood to see how it works—the Rust architecture, the chaos of blockchain state, and the safety-first pipeline that prevents false positives.

**Preview:** This post covers the technical architecture—from provider pooling and reorg handling to the Guardian's simulation-first execution pipeline. You'll learn how we built a system that's both fast enough to catch exploits in real-time and safe enough to trust with protocol control.

## Background

Building production-grade blockchain infrastructure requires handling unique challenges:

- **Non-linear blockchains**: Forks and reorgs mean blocks can disappear
- **Unreliable RPC providers**: Nodes go down, rate limits are hit, data can lag
- **MEV and front-running**: Rescue transactions must be protected
- **State complexity**: Protocols interact with unpredictable external state

We chose **Rust** for its type safety, memory safety, and concurrency features—essential for a system that must be both fast and reliable.

## The Architecture

The project is organized as a Rust workspace with clear separation of concerns. Here are the key crates:

### Core Components

**`eth-state`**: The eyes. Handles all RPC communication.
- Provider pooling and failover
- Request retry logic with exponential backoff
- Health monitoring and automatic provider rotation

**`invariant-eval`**: The brain. Logic for checking invariants.
- Invariant evaluation engine
- State fetching and caching
- Severity classification

**`simulation`**: The imagination. Forks the chain to test "what if?"
- Local Anvil fork management
- Transaction simulation
- State verification

**`guardian`**: The hand. Executes transactions.
- Transaction construction
- Flashbots integration
- Execution monitoring

## Reliability at Scale: Provider Pooling

One of the biggest pain points in blockchain indexing is RPC reliability. Nodes go down, rate limits are hit, and data can lag.

### The Problem

A single RPC provider is a single point of failure:
- Provider outage = monitor goes down
- Rate limiting = missed blocks
- Data lag = stale state

### The Solution: Provider Pool

Instead of relying on a single Infura or Alchemy URL, you provide a list. The system:

1. **Round-robins requests**: Distributes load across providers
2. **Automatically penalizes unhealthy providers**: Tracks success rates and response times
3. **Retries failed requests**: Exponential backoff with provider rotation
4. **Health monitoring**: Continuously evaluates provider performance

**Implementation:**
```rust
// Simplified example
struct ProviderPool {
    providers: Vec<Arc<Provider>>,
    health_scores: HashMap<ProviderId, HealthScore>,
}

impl ProviderPool {
    async fn get_state(&self, block: BlockNumber) -> Result<State> {
        // Try providers in order of health
        for provider in self.ranked_providers() {
            match provider.get_state(block).await {
                Ok(state) => {
                    self.record_success(provider.id);
                    return Ok(state);
                }
                Err(e) => {
                    self.record_failure(provider.id, e);
                    continue;
                }
            }
        }
        Err(AllProvidersFailed)
    }
}
```

This ensures that your monitor doesn't crash just because one node provider is having a bad day.

## Handling Chaos: Block Indexing & Reorgs

Blockchains aren't linear. They fork and reorg. A naive monitor might alert on a violation in Block A, only for Block A to be "uncled" and replaced by Block B where everything is fine.

### The Reorg Problem

**Scenario:**
1. Monitor processes Block 100, detects violation
2. Sends alert: "CRITICAL: Solvency broken in Block 100"
3. Block 100 gets reorged, replaced by Block 100'
4. Block 100' shows protocol is healthy
5. **False alarm**

### The Solution: Canonical Chain Tracking

Our `BlockIndexer` maintains a **Canonical Chain**. It tracks the parent hashes of every block. If it detects a mismatch (a reorg), it:

1. **Pauses monitoring**: Stops processing new blocks
2. **Rolls back database**: Reverts to the common ancestor
3. **Re-processes the new valid chain**: Replays blocks from the fork point

**Implementation:**
```rust
struct BlockIndexer {
    canonical_chain: Vec<BlockHash>,
    processed_blocks: HashSet<BlockHash>,
}

impl BlockIndexer {
    fn process_block(&mut self, block: Block) -> Result<()> {
        // Check if parent matches expected
        if block.parent_hash != self.canonical_chain.last() {
            // Reorg detected!
            self.handle_reorg(block.parent_hash)?;
        }
        
        // Add to canonical chain
        self.canonical_chain.push(block.hash);
        Ok(())
    }
}
```

### Finality Depth

We also support a `finality_depth` configuration, ensuring we only alert on blocks that have a high probability of being final. This prevents false alarms from temporary forks.

**Configuration:**
```json
{
  "finality_depth": 12,
  "comment": "Only alert on blocks that are 12 blocks deep"
}
```

## The Guardian Pipeline: "Measure Twice, Cut Once"

The most critical part of the system is the **Guardian Pipeline**. We cannot afford to pause a protocol accidentally.

### The Pipeline Flow

When a violation is detected, the pipeline flows as follows:

1. **Watcher**: Receives the block via a low-latency WebSocket connection
2. **Evaluation**: Confirms the invariant is violated (double-check)
3. **Severity Check**: Is this `CRITICAL`? (We don't pause for `LOW` severity warnings)
4. **Simulation (The Safety Net)**:
   - The system spins up an internal **Anvil** instance (Foundry)
   - It forks the mainnet state at the exact block of the violation
   - It *simulates* the pause transaction
   - **Crucially**: It verifies that the pause transaction *succeeds* and doesn't revert
5. **Execution**:
   - If the simulation passes, we construct a transaction
   - We send it via **Flashbots** to a private mempool
   - This prevents MEV bots from seeing our pause transaction and trying to front-run it

### Why Simulation Matters

**Without Simulation:**
- Guardian sees violation
- Guardian immediately sends `pause()` transaction
- Transaction reverts (maybe protocol is already paused?)
- **Wasted gas, no protection**

**With Simulation:**
- Guardian sees violation
- Guardian simulates `pause()` on local fork
- Simulation succeeds → Guardian executes
- Simulation fails → Guardian logs error, doesn't execute
- **No wasted gas, guaranteed execution**

### Flashbots Integration

We use **Flashbots** to send rescue transactions to a private mempool. This prevents:

- **Front-running**: MEV bots can't see our transaction and try to exploit before we pause
- **Sandwich attacks**: Attackers can't sandwich our pause transaction
- **Public visibility**: The transaction only becomes public when it's included in a block

## JSON over DSL

We made a conscious design decision to use **JSON** for configuration rather than a custom Domain Specific Language (DSL).

### Why JSON?

**Advantages:**
- **Universal**: Everyone understands JSON
- **Tooling**: Existing parsers, validators, editors
- **No learning curve**: No custom syntax to learn
- **Less bugs**: No parser bugs, no syntax errors

**Disadvantages:**
- Less expressive than a DSL
- Can be verbose for complex invariants

### Example Configuration

You can define a complex invariant like this:

```json
{
  "type": "reserve_ratio_min",
  "params": {
    "contract": "0xProtocol...",
    "min_ratio": 1.0,
    "reserves_method": "getReserves()",
    "liabilities_method": "getLiabilities()"
  },
  "severity": "CRITICAL",
  "alert_channels": ["slack", "pagerduty"]
}
```

This makes the system accessible to anyone who can read a contract ABI, not just Rust developers.

## Examples & Case Studies

### Example: Provider Failover in Action

**Scenario:** Primary RPC provider (Infura) goes down during high-traffic period.

**What happens:**
1. Monitor detects Infura is timing out
2. Automatically switches to Alchemy
3. Continues processing blocks without interruption
4. Logs provider health metrics
5. Retries Infura periodically, switches back when healthy

**Outcome:** Zero missed blocks, zero false alarms.

### Example: Reorg Handling

**Scenario:** Block 100 shows violation, but gets reorged.

**What happens:**
1. Monitor processes Block 100, detects violation
2. Before alerting, checks finality depth (12 blocks)
3. Block 100 is only 2 blocks deep → waits
4. Block 100 gets reorged at block 3
5. Monitor rolls back, re-processes new chain
6. New Block 100 shows no violation
7. **No false alarm sent**

**Outcome:** Only alerts on final blocks, preventing false alarms.

## Common Pitfalls to Avoid

### Pitfall 1: Ignoring Provider Health

**What goes wrong:** You use a single RPC provider, and when it goes down, your monitor stops working.

**Why it happens:** It's easier to configure one provider than multiple.

**How to avoid it:**
- Always use multiple RPC providers
- Monitor provider health metrics
- Implement automatic failover
- Set up alerts for provider issues

### Pitfall 2: Not Handling Reorgs

**What goes wrong:** Your monitor alerts on a violation, but the block gets reorged and the violation disappears.

**Why it happens:** Reorgs are rare, so it's easy to forget about them.

**How to avoid it:**
- Always track canonical chain
- Use finality depth configuration
- Test reorg handling in development
- Monitor reorg frequency

### Pitfall 3: Skipping Simulation

**What goes wrong:** Guardian executes a rescue transaction that reverts, wasting gas and failing to protect the protocol.

**Why it happens:** Simulation adds latency, and it's tempting to skip it for speed.

**How to avoid it:**
- Never skip simulation
- Verify simulation results before execution
- Log all simulation outcomes
- Test simulation with various scenarios

## Conclusion

**Summary:** Building a production-grade Guardian system requires handling the chaos of blockchain state—reorgs, RPC failures, and MEV attacks. By using Rust for safety and performance, implementing provider pooling and reorg handling, and following a simulation-first execution pipeline, we've built a system that's both fast and safe.

**Key Takeaways:**

- **Provider pooling** ensures reliability even when individual providers fail
- **Reorg handling** prevents false alarms from temporary blockchain forks
- **Simulation-first pipeline** guarantees rescue transactions will succeed
- **Flashbots integration** protects rescue transactions from front-running

**Call to Action:**

- Read [Part 1: Sleep Soundly](/blog/the-guardian-of-the-chain-sleep-soundly-part-1-3/) for the introduction
- Check out [Part 3: In Practice & Future](/blog/the-guardian-of-the-chain-in-practice-and-future-part-3-3/) for a real-world case study
- Start building your own monitoring system with these patterns

## Related Posts

- [The Guardian of the Chain: Sleep Soundly (Part 1)](/blog/the-guardian-of-the-chain-sleep-soundly-part-1-3/) - Introduction to invariant monitoring
- [The Guardian of the Chain: In Practice & Future (Part 3)](/blog/the-guardian-of-the-chain-in-practice-and-future-part-3-3/) - Euler Finance case study and roadmap

---

**Tags:** rust, architecture, blockchain, defi, systems-design
