---
title: "RV32I DOT4: A Five-Stage Core Checked Against Spike"
tagline: "A pipelined RISC-V core with a custom int8 dot-product instruction, simulated"
description: "A five-stage RV32I SystemVerilog core with a custom int8 DOT4 instruction and optional M, Zicsr and wait-state support, checked against a Python model, Spike and riscv-formal, with iCE40 post-route estimates. No board has run it."
problem: "A pipelined CPU can pass a few hand-written programs and still corrupt state when a load feeds the next instruction or a branch squashes the wrong stage. A custom instruction adds its own risk, and its speedup only counts after the extra logic's cost to the clock is paid."
solution: "A five-stage RV32I core in SystemVerilog with forwarding, a load-use stall, EX-stage branch flushing and DOT4, a signed int8 four-lane dot product. Parameters add the M extension, machine-mode CSRs, traps and interrupts, and a ready handshake on both memory ports. Generated programs, Spike, riscv-formal, an exhaustive lane sweep and deliberate RTL mutants check it in Icarus and Verilator, and Yosys and nextpnr map it to an iCE40 HX8K."
result: "In simulation 253 programs pass, 39/39 arch tests match Spike and 45/45 riscv-formal checks pass. DOT4 is 5.2x faster on one 256-element kernel, using post-route clock estimates."
status: "prototype"
verification: "253 programs pass in Icarus and Verilator against a Python model, 39/39 riscv-arch-test 3.10.0 tests match Spike (62/62 on the extended core), 45/45 bounded riscv-formal checks pass (53/53 extended), and the checkers catch 38/38 RTL mutants. Simulation and model checking only, no board run."
next: "No board has run the core, so every clock figure is a post-route estimate. The formal checks are bounded to 20 cycles, and the DOT4 speedup covers one kernel."
figure:
  src: "/images/projects/rv32i-dot4-a-five-stage-core-checked-against-spike/pipeline-cycle-4.webp"
  alt: "Isometric drawing of the five pipeline stages at cycle 4 of a recorded RTL trace: four stage carriers are lit yellow and the fifth is still empty."
  caption: "The visual lab's pipeline view at cycle 4 of a recorded RTL simulation trace. Four stages hold valid instructions and writeback is still empty."
kind: "hardware"
track: "hardware"
featured: false
demoUrl: "https://rahilbhavan.com/riscv/post"
githubUrl: "https://github.com/RahilBhavan/riscv"
completedDate: 2026-10-21
---

## Overview

**The question:** Does a small five-stage RV32I core stay correct through every pipeline hazard, and does a custom int8 dot-product instruction still win once its cost to the clock is counted?

**The result:** In Icarus and Verilator simulation, 253 directed, random and generated hazard programs pass, and 39/39 RV32I tests from riscv-arch-test 3.10.0 match Spike. 45/45 riscv-formal bounded checks pass. On a 256-element int8 dot product, DOT4 is 5.2x faster than the strongest pure-RV32I kernel after dividing by each core's median post-route clock estimate.

**Scope:** Simulation and place-and-route only. No board has run the core (`board_tested: false` in `reports/board.json`).

## How it works

The core has the classic IF, ID, EX, MEM and WB stages. EX takes operands from EX/MEM, then MEM/WB, then ID/EX. A load followed directly by a consumer stalls one cycle. Taken branches and jumps resolve in EX and squash the two younger stages. In the default build, ECALL, EBREAK, illegal encodings and misaligned accesses halt through a local trap record.

Three parameters, all off by default, extend it. MEXT adds the M extension with an iterative multiplier and divider that holds EX for 34 cycles; the FPGA has no hardware multipliers and is already 72% full, so a one-cycle unit would not fit. ZICSR adds machine-mode CSRs, traps that jump to a handler, and software, timer and external interrupts. Both memory ports take a ready signal, so memory can insert wait states and the pipeline holds until data arrives.

DOT4 sits in the custom-0 opcode space. It treats each 32-bit register as four signed bytes, multiplies the lanes pairwise and writes the sum to `rd`, with no accumulation or saturation.

A Python generator writes the test programs and a sequential reference model predicts every retired instruction and byte write. Separate scripts add the Spike comparison, riscv-formal, the DOT4 lane sweep and the mutants. Everything runs in a Docker image that pins the tool versions, and each report records the SHA-256 of the sources it measured.

## Results

| Measure | Value | Kind |
|---|---|---|
| DOT4, 256-element int8 dot product | 585 cycles | RTL simulation |
| Quarter-square table kernel (best pure RV32I) | 3,403 cycles | RTL simulation |
| Shift-and-add kernel | 14,589 cycles | RTL simulation |
| Speedup over quarter-square after clock cost | 5.2x (4.6 to 5.7x at extreme seeds) | post-route estimate |
| Speedup over shift-and-add after clock cost | 22.2x | post-route estimate |
| DOT4 cost vs a DOT4=0 build | +19% logic cells, -11% median Fmax | post-route estimate |
| Mapped area | 5,539 of 7,680 iCE40 logic cells (72.1%) | place and route |
| Fmax, median of seeds 1 to 5 | 36.05 MHz (34.63 to 37.60) | post-route estimate, not board timing |
| Extended core (M, Zicsr) area and Fmax | 7,472 of 7,680 logic cells (97.3%), 34.35 MHz median | post-route estimate |

The board image, with block-RAM memories and a self-test, routes at 38.21 MHz post-route against the board's 12 MHz oscillator. That is also an estimate. It has not run on a board.

## How it was checked

- **Reference model.** 11,928 retired instruction records and all byte writes match the Python model over 20 random seeds. Every program runs again with memory ready withheld at random and must give the same retirements and writes. Invariants check x0, register writes, memory strobes, held data requests, stall and flush on all 38,603 cycles.
- **Extended core.** 309 programs pass on the core with M and Zicsr enabled, covering all eight M operations, the six CSR forms, MRET, WFI, six exception causes and three interrupt causes.
- **External reference.** 39/39 riscv-arch-test 3.10.0 signatures and 50 random programs match Spike. The extended core matches Spike on 62/62 tests from the RV32I, M and privilege suites; RISCOF would not select 13 of them for this core, so those are a direct Spike comparison. This is not ACT4 and not certification.
- **Formal.** 45/45 riscv-formal checks pass on the default core and 53/53 on the extended core, as bounded model checks to 20 cycles from reset (liveness to 30) with unconstrained inputs. They are not unbounded proofs. CSR instructions and the M arithmetic are not formally checked; Spike covers the arithmetic.
- **Hazard cross.** 108 generated programs hit 327/327 producer, consumer and distance bins.
- **DOT4 sweep.** All 262,144 isolated signed lane pairs match a scalar oracle in both simulators, and the 1,023 unsupported custom-0 encodings trap with no side effect. Multi-lane sums are not swept exhaustively.
- **Mutants.** The targeted checkers catch 38/38 single-bug edits to the RTL, including wait-state, M-extension, CSR and interrupt bugs.
- A build script stops if the README quotes a number that differs from `reports/`.

## Limits and next steps

- No board has run the core. All FPGA timing figures are post-route estimates, and the timing shell excludes the memories, peripherals and external I/O.
- The repository's README states that the implementation was generated with assistant support, starting from a placeholder README with no earlier core draft.
- The riscv-formal checks are bounded, not proofs, and do not cover CSR instructions. There is no ACT4 integration and no certification.
- The extended core has machine mode only, with no user mode, PMP or counters, and it fills 97.3% of the HX8K, leaving little room for memories or peripherals.
- The DOT4 speedup covers one kernel, and the table baseline uses 2 KiB of data memory that DOT4 does not.
- Line coverage is 73/73 points across both configurations, but with only 73 instrumented points the README calls it weak evidence on its own.
- The next step the repo names is a first hardware run: the board guide covers building, flashing and recording one.

## Links

1. [Project page with interactive figures](https://rahilbhavan.com/riscv/post)
2. [Repository](https://github.com/RahilBhavan/riscv)
3. [Checked-in reports](https://github.com/RahilBhavan/riscv/tree/main/reports)

---

**Completed:** October 21, 2026
