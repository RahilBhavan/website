---
title: "Summer.fi Liquidation Risk Simulator"
description: "A reproducible stress-test case study that replays the August 5, 2024 ETH crash through a static stop-loss model for Aave V3 and Morpho positions, with a parameter sweep and an interactive Next.js simulator."
problem: "When ETH fell 27% intraday on August 5, 2024 and gas spiked to 681 Gwei, automated stop-loss controls had to fire in conditions where execution cost and slippage ate into whatever they saved. A risk team choosing a stop-loss buffer needs a way to compare buffer choices across protocols with explicit, reviewable assumptions rather than intuition."
solution: "Built a compact Python model that reads 24 hourly price and gas observations, evaluates liquidation and stop-loss triggers hour by hour for Aave V3 and Morpho parameters, estimates exit value net of modeled slippage and gas, and sweeps 5 initial LTVs by 5 buffers per protocol. A Next.js simulator runs the same model in TypeScript with a parity check against the Python fixtures."
demoUrl: "https://summer.rahilbhavan.com"
githubUrl: "https://github.com/RahilBhavan/summer-fi-risk-analysis"
completedDate: 2026-08-12
---

# Summer.fi Liquidation Risk Simulator

## Overview

**What it is:** An independent portfolio case study of how automated risk controls behave during a sharp Ethereum move. It takes the 24 hourly observations from August 5, 2024, applies explicit assumptions for collateral, debt, liquidation thresholds, buffers, execution cost, and slippage, and compares outcomes across Aave V3 and Morpho scenarios and stop-loss buffer choices. A web simulator lets a reader change the protocol, initial LTV, and buffer and see the result.

**Why it matters:** Stop-loss automation on a lending position is a decision under uncertainty: trigger too early and you pay gas and slippage on a move that reverses; trigger too late and the protocol liquidates you with a penalty. The model turns that into a documented decision process with recorded assumptions.

**Who it's for:** Risk and operations teams on DeFi lending products, and anyone evaluating how to set and escalate stop-loss buffers.

**Impact:** A reproducible sweep of 50 scenarios (5 LTVs x 5 buffers x 2 protocols), a written backtest report, 12 unit tests on the model logic, and a deployed simulator whose TypeScript model is parity-checked against the Python output. The scenarios are illustrative; they are not claims about live protocol use or organizational work.

## The Problem

### The Challenge

On August 5, 2024, ETH opened at $2,910, fell to a trough of $2,120 (about a 27.1% intraday decline), and closed at $2,450 (about 15.8% below the open). Recorded gas peaked at 681.4 Gwei. Any automation that tried to exit a leveraged position that day paid for it.

**Specific issues:**
- Liquidation thresholds and penalties differ by protocol (Aave V3 at 0.825 with a 5% penalty, Morpho at 0.945 with a 1% penalty in the model's assumptions)
- Execution cost scales with gas, and slippage rises under stress
- Hourly data cannot prove that an automated exit landed before an observed threshold breach

**Who was affected:**
- Borrowers running leveraged ETH positions with automated stop-losses
- Risk teams who need to justify a buffer choice

**Consequences of not solving it:**
- Buffers chosen by intuition rather than scenario comparison
- No record of the assumptions behind an escalation decision

### Constraints & Requirements

**Technical constraints:**
- 24 hourly rows of price and gas; no minute-level data
- The model had to be deterministic and reproducible from the CSV
- The web simulator had to match the Python model exactly

**Scope constraints:**
- Illustrative and heuristic by design: not a forecast, a valuation, or a liquidation simulator for live markets

## The Solution

### Approach & Methodology

1. Validate the hourly price and gas observations
2. Apply explicit assumptions for collateral, debt, LTV thresholds, buffer levels, execution cost, and slippage
3. Walk the 24 hours: at each observation check liquidation first, then the stop-loss trigger
4. Estimate exit value net of penalty (liquidated) or slippage and gas (stop-loss triggered)
5. Sweep initial LTV and buffer for both protocols and write the matrix to `reports/sweep_results.csv`

### Technology Stack

**Model:**
- Python 3.10+, pandas, numpy, pytest
- `scripts/risk_model.py` with a CLI (`--protocol`, `--ltv`, `--buffer`, `--sweep`, `--combined-sweep`)
- Jupyter notebook for supplementary visual analysis

**Simulator:**
- Next.js 16, React 19, Recharts, Tailwind CSS 4, GSAP
- `riskModel.ts` ports the Python model; a parity check compiles and executes it against Python-generated fixtures before every build
- Shareable scenario URLs (`?protocol=AaveV3&ltv=0.70&buffer=0.05`)

**Why this stack:**
- pandas keeps the hourly walk short and readable
- A TypeScript port with a parity gate means the interactive simulator cannot drift from the published numbers

### Architecture & Design Decisions

**Liquidation before stop-loss.** At each hourly observation, liquidation eligibility is evaluated before the configured stop-loss. Hourly data cannot show that an automation exit preceded a breach inside the hour, so the conservative ordering keeps liquidation outcomes reachable.

**Static strategy only.** The model supports one validated strategy: a fixed stop-loss trigger at the liquidation threshold minus the buffer. No dynamic-strategy rows are generated.

**Trade-offs:**
- Slippage is a simple function of gas (base 0.1%, plus 0.5% per 100 Gwei, capped at 5%), not an order-book model
- Gas cost assumes a fixed 300,000 gas exit transaction

### Key Features

1. **Hour-by-hour backtest** with status `safe`, `sl_triggered`, or `liquidated` and the trigger hour
2. **Two protocol parameter sets** (Aave V3, Morpho) retained in every output row
3. **Parameter sweep** over 5 initial LTVs and 5 buffers per protocol
4. **Interactive simulator** with URL-shareable scenarios and a documentation hub
5. **Parity check** between the Python and TypeScript models

## Technical Highlights

### The model core

```python
class DeFiRiskModel:
    def __init__(self, initial_collateral: float, initial_debt: float,
                 protocol: Protocol = "AaveV3") -> None:
        if initial_collateral <= 0:
            raise ValueError("Collateral must be greater than zero")
        if initial_debt < 0:
            raise ValueError("Debt must be non-negative")
        self.collateral = initial_collateral
        self.debt = initial_debt
        self.protocol = protocol

        if protocol == "AaveV3":
            self.liquidation_threshold = 0.825
            self.liquidation_penalty = 0.05
        elif protocol == "Morpho":
            self.liquidation_threshold = 0.945
            self.liquidation_penalty = 0.01
        else:
            raise ValueError(f"Unsupported protocol: {protocol}")

    def calculate_ltv(self, price: float) -> float:
        if price <= 0:
            raise ValueError("Price must be greater than zero")
        return self.debt / (self.collateral * price)

    def simulate_step(self, price: float, gas_price: float, sl_trigger_ltv: float,
                      strategy: Literal["static"] = "static") -> Literal["safe", "sl_triggered", "liquidated"]:
        if strategy != "static":
            raise ValueError("Only the validated static strategy is supported")
        if not 0 < sl_trigger_ltv < self.liquidation_threshold:
            raise ValueError("Stop-loss LTV must be greater than zero and below liquidation threshold")
        if gas_price < 0:
            raise ValueError("Gas price must be non-negative")
        current_ltv = self.calculate_ltv(price)
        # Hourly observations cannot prove an automation exit preceded a breach.
        if current_ltv >= self.liquidation_threshold:
            return "liquidated"
        if current_ltv >= sl_trigger_ltv:
            return "sl_triggered"
        return "safe"
```

### The sweep

```python
def parameter_sweep(df: pd.DataFrame, protocol: Protocol = "AaveV3") -> pd.DataFrame:
    df = validate_data(df)
    ltvs = [0.60, 0.65, 0.70, 0.75, 0.80]
    buffers = [0.02, 0.05, 0.08, 0.10, 0.12]
    rows = []
    initial_price = df.iloc[0]["Price_USD"]

    for ltv in ltvs:
        for buffer in buffers:
            model = DeFiRiskModel(1.0, initial_price * ltv, protocol)
            result = run_backtest(df, 1.0, initial_price * ltv,
                                  model.liquidation_threshold - buffer, protocol=protocol)
            rows.append({"Protocol": protocol, "Initial_LTV": ltv, "Buffer": buffer,
                         "Strategy": "static", "Status": result["status"],
                         "Trigger_Hour": result["trigger_hour"], "Final_Value_USD": result["final_value"]})
    return pd.DataFrame(rows)
```

**Key Technical Decisions:**

1. **Input validation raises, never coerces.** Non-positive prices, negative gas, and stop-loss triggers at or above the liquidation threshold are errors.
2. **Protocol identity in every row.** The sweep output keeps the protocol column so the two matrices can be compared without re-running.
3. **Exit value floors at zero.** A liquidated or stop-loss exit never reports a negative remaining value.

## Process & Timeline

### Phase 1: Model and report (March 2026)

- Initial risk model, backtest, and unit tests for the Aug 5 crash
- Slippage model, protocol diversity, and parameter sweep
- Backtest report and sweep CSV

### Phase 2: Web simulator (March 2026)

- Interactive simulator and editorial layout with GSAP animations
- Technical documentation hub rendered from an allowlisted content directory
- Path-resolution fixes for dynamic documentation routes

### Phase 3: Portfolio polish (August 2026)

- Simulator interactions and accessibility
- Presentation tailored for a finance audience

## Challenges & Solutions

### Challenge 1: Hourly data and within-hour ordering

**The Problem:** With one observation per hour, the model cannot tell whether a stop-loss would have executed before the price crossed the liquidation threshold inside that hour.

**The Solution:** Evaluate liquidation first at every observation. This keeps liquidation outcomes reachable and states the limitation in the report rather than hiding it.

**What I learned:** A conservative ordering plus a written limitation is more useful than a finer-grained model built on data you do not have.

### Challenge 2: Keeping the simulator honest

**The Problem:** A TypeScript reimplementation of the model in the web app could silently diverge from the Python results in the report.

**The Solution:** `generate:data` regenerates the web app fixtures from the Python model, and a parity check compiles and executes the TypeScript model against them. The build runs validation first.

**What I learned:** When two implementations must agree, make agreement a build gate.

## Results & Metrics

- 24 hourly observations: open $2,910, trough $2,120, close $2,450; peak gas 681.4 Gwei
- 50 sweep rows: 25 per protocol (5 LTVs x 5 buffers x 1 static strategy)
- Aave V3: 21 `sl_triggered`, 4 `liquidated`
- Morpho: 7 `active`, 12 `sl_triggered`, 6 `liquidated`
- 12 unit tests on the model logic
- Model assumptions: Aave V3 threshold 0.825 and 5% penalty; Morpho threshold 0.945 and 1% penalty

The report's recommendation: use the sweep as a scenario-analysis input when selecting stop-loss buffers, and validate thresholds, execution, and controls against current protocol configuration and finer-grained data before operational use.

## Learnings

### What Worked Well

- A tiny, validated model with explicit assumptions is easier to defend than a large one
- Keeping protocol parameters in the model class made the combined sweep a two-line change
- The parity gate between Python and TypeScript

### What Didn't Work

- Hourly data limits what can be claimed about execution ordering, and the report says so

### What I'd Do Differently

- Source minute-level price and gas data for the crash window
- Replace the gas-driven slippage heuristic with measured order-book depth

## Links & Resources

- **Simulator**: [summer.rahilbhavan.com](https://summer.rahilbhavan.com)
- **Repository**: [github.com/RahilBhavan/summer-fi-risk-analysis](https://github.com/RahilBhavan/summer-fi-risk-analysis)

---

**Completed:** August 12, 2026
