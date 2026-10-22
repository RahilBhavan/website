---
title: "RV32I DOT4: A Five-Stage Core Checked Against Spike"
tagline: "A pipelined RISC-V core with a custom int8 dot-product instruction, simulated"
description: "A five-stage RV32I SystemVerilog core with a custom int8 DOT4 instruction, checked in two simulators against a Python model and Spike, with iCE40 post-route estimates. No board has run it."
problem: "A pipelined CPU can pass a few hand-written programs and still corrupt state when a load feeds the next instruction or a branch squashes the wrong stage. A custom instruction adds its own risk, and its speedup only counts after the extra logic's cost to the clock is paid."
solution: "A five-stage RV32I core in SystemVerilog with forwarding, a load-use stall, EX-stage branch flushing and DOT4, a signed int8 four-lane dot product. Generated programs, Spike, an exhaustive lane sweep and deliberate RTL mutants check it in Icarus and Verilator, and Yosys and nextpnr map it to an iCE40 HX8K."
result: "In simulation 252 programs pass and 39/39 arch tests match Spike. DOT4 is 5.3x faster on one 256-element kernel, using post-route clock estimates."
status: "prototype"
verification: "252 programs pass in Icarus and Verilator against a Python model, 39/39 riscv-arch-test 3.10.0 tests match Spike, and the checkers catch 23/23 RTL mutants. Simulation only, no board run."
next: "No board has run the core, so every clock figure is a post-route estimate. There is no formal verification, and the DOT4 speedup covers one kernel."
figure:
  src: "/images/projects/rv32i-dot4-a-five-stage-core-checked-against-spike/pipeline-cycle-4.webp"
  alt: "Isometric drawing of the five pipeline stages at cycle 4 of a recorded RTL trace: four stage carriers are lit yellow and the fifth is still empty."
  caption: "The visual lab's pipeline view at cycle 4 of a recorded RTL simulation trace. Four stages hold valid instructions and writeback is still empty."
kind: "hardware"
track: "hardware"
featured: false
demoUrl: "https://rahilbhavan.github.io/riscv/"
githubUrl: "https://github.com/RahilBhavan/riscv"
completedDate: 2026-10-21
---

## Overview

**The question:** Does a small five-stage RV32I core stay correct through every pipeline hazard, and does a custom int8 dot-product instruction still win once its cost to the clock is counted?

**The result:** In Icarus and Verilator simulation, 252 directed, random and generated hazard programs pass, and 39/39 RV32I tests from riscv-arch-test 3.10.0 match Spike. On a 256-element int8 dot product, DOT4 is 5.3x faster than the strongest pure-RV32I kernel after dividing by each core's median post-route clock estimate.

**Scope:** Simulation and place-and-route only. No board has run the core (`board_tested: false` in `reports/board.json`).

## How it works

The core has the classic IF, ID, EX, MEM and WB stages. EX takes operands from EX/MEM, then MEM/WB, then ID/EX. A load followed directly by a consumer stalls one cycle. Taken branches and jumps resolve in EX and squash the two younger stages. ECALL, EBREAK, illegal encodings and misaligned accesses halt through a local trap record.

DOT4 sits in the custom-0 opcode space. It treats each 32-bit register as four signed bytes, multiplies the lanes pairwise and writes the sum to `rd`, with no accumulation or saturation.

A Python generator writes the test programs and a sequential reference model predicts every retired instruction and byte write. Separate scripts add the Spike comparison, the DOT4 lane sweep and the mutants. Everything runs in a Docker image that pins the tool versions, and each report records the SHA-256 of the sources it measured.

## Results

| Measure | Value | Kind |
|---|---|---|
| DOT4, 256-element int8 dot product | 585 cycles | RTL simulation |
| Quarter-square table kernel (best pure RV32I) | 3,403 cycles | RTL simulation |
| Shift-and-add kernel | 14,589 cycles | RTL simulation |
| Speedup over quarter-square after clock cost | 5.3x (4.7 to 5.7x at extreme seeds) | post-route estimate |
| Speedup over shift-and-add after clock cost | 22.6x | post-route estimate |
| DOT4 cost vs a DOT4=0 build | +18% logic cells, -9% median Fmax | post-route estimate |
| Mapped area | 5,497 of 7,680 iCE40 logic cells (71.6%) | place and route |
| Fmax, median of seeds 1 to 5 | 35.76 MHz (33.85 to 37.08) | post-route estimate, not board timing |

The board image, with block-RAM memories and a self-test, routes at 36.92 MHz post-route against the board's 12 MHz oscillator. That is also an estimate. It has not run on a board.

## How it was checked

- **Reference model.** 11,924 retired instruction records and all byte writes match the Python model over 20 random seeds. Invariants check x0, register writes, memory strobes, stall and flush on all 14,906 cycles.
- **External reference.** 39/39 riscv-arch-test 3.10.0 signatures and 50 random programs match Spike. This is not ACT4 and not certification.
- **Hazard cross.** 108 generated programs hit 327/327 producer, consumer and distance bins.
- **DOT4 sweep.** All 262,144 isolated signed lane pairs match a scalar oracle in both simulators, and the 1,023 unsupported custom-0 encodings trap with no side effect. Multi-lane sums are not swept exhaustively.
- **Mutants.** The targeted checkers catch 23/23 single-bug edits to the RTL.
- A build script stops if the README quotes a number that differs from `reports/`.

## Limits and next steps

- No board has run the core. All FPGA timing figures are post-route estimates, and the timing shell excludes the memories, peripherals and external I/O.
- The repository's README states that the implementation was generated with assistant support, starting from a placeholder README with no earlier core draft.
- No formal verification (riscv-formal with RVFI), no ACT4 integration and no certification.
- The core has no CSRs, interrupts, privileged traps or memory wait states.
- The DOT4 speedup covers one kernel, and the table baseline uses 2 KiB of data memory that DOT4 does not.
- Line coverage is 37/38 points, but with only 38 instrumented points the README calls it weak evidence on its own.
- The next step the repo names is a first hardware run: the board guide covers building, flashing and recording one.

## Links

1. [Project page with interactive figures](https://rahilbhavan.github.io/riscv/)
2. [Repository](https://github.com/RahilBhavan/riscv)
3. [Checked-in reports](https://github.com/RahilBhavan/riscv/tree/main/reports)

---

**Completed:** October 21, 2026
