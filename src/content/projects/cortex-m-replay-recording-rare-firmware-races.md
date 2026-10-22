---
title: "Cortex-M Replay: Recording Rare Firmware Races"
tagline: "rr-style record and replay for Cortex-M firmware, run on a host emulator"
description: "A Phase-0 prototype that records every IRQ, MMIO read and DMA write of a Cortex-M3 firmware image at instruction-count precision and replays a rare race bit-identically on a host emulator."
problem: "An interrupt that lands between two related memory reads can corrupt firmware state in a few runs out of a thousand, and the failure does not come back on demand. Without a record of exactly when each outside event arrived, the failure cannot be reproduced on demand."
solution: "A Unicorn-based recorder runs a bare-metal Cortex-M3 race ELF and writes every IRQ, MMIO read and DMA write, indexed by retired instruction count, into DTRC v2, a CRC32-checked trace format. A replay engine re-runs the same ELF, applies the events and compares 17-field register snapshots. A SystemVerilog capture gateway carries the trace bytes in simulation."
result: "Seeds 0 to 3 gave 2, 1, 2 and 1 corruptions per 1,000 trials, and one corrupting schedule replayed bit-identically 20 of 20 times, on a host emulator."
status: "prototype"
verification: "CI run 31524893189 on 2026-08-11 passed all 39 unit tests, including 100,000 of 100,000 identical 17-field snapshots. Not reproduced on 2026-10-21, as that host lacked the Arm toolchain."
next: "Phase-0 prototype: no physical-board capture and no ETM trace ingress yet, and the 211.42 MHz ECP5 figure is a provisional tool estimate, not board timing."
figure:
  src: "/images/projects/cortex-m-replay-recording-rare-firmware-races/make-demo.webp"
  alt: "Terminal output of make demo: 1,000 trials at seed 0 give 2 corruptions, then a corrupting schedule passes the Unicorn record and replay identity check."
  caption: "Last frame of the repo's make demo recording. Seed 0 finds 2 corruptions in 1,000 trials, and one corrupting schedule replays bit-identically on the host."
kind: "hardware"
track: "hardware"
featured: false
githubUrl: "https://github.com/RahilBhavan/cortex-m-deterministic-replay"
completedDate: 2026-10-21
---

## Overview

**The question:** Can a rare interrupt race in Cortex-M firmware be recorded once and then replayed exactly, register for register, as many times as needed?

**The result:** On a host instruction emulator, yes for the modeled race. A seeded campaign found 2, 1, 2 and 1 corruptions per 1,000 trials for seeds 0 to 3. One corrupting schedule (IRQ at instruction 4, seed 0) was recorded and replayed 20 times, and all 20 matched.

**Scope:** Phase-0 prototype. Everything runs on the host. There is no physical-board capture and no Embedded Trace Macrocell (ETM) ingress.

## How it works

The firmware is a purpose-built race, not a third-party bug. It keeps a two-word invariant: a timer interrupt updates the words in two stores, and the main loop reads them in two loads. An interrupt injected at the wrong instruction leaves the pair the main loop sees inconsistent.

- **Emulator.** Unicorn 2.1.4 runs the bare-metal Cortex-M3 ELF one instruction at a time, counts retired instructions and injects an IRQ at an exact count through a narrow exception shim. The shim is not an NVIC model.
- **Recorder.** Every IRQ, MMIO read and DMA write is written to DTRC v2, a varint trace format with a build ID and a CRC32.
- **Replay.** The engine re-runs the same ELF, applies each event at its recorded instruction count and compares 17-field snapshots: R0 to R12, SP, LR, PC and xPSR. A differ reports the first mismatched snapshot with disassembly.
- **Gateway.** SystemVerilog RTL (FIFOs, DDR capture, a clock-domain crossing and reset synchronizers) carries the trace bytes in Icarus and Verilator simulation. It moves bytes and does not parse DTRC.

QEMU 11.0.3 boots the same image, but its interfaces do not expose exact instruction retirement, MMIO read override or count-indexed IRQ injection. The repo records that dead end, which is why the recorder uses Unicorn.

## Results

| Measure | Value | Source of the number |
|---|---|---|
| Race corruptions, seeds 0 to 3 | 2, 1, 2, 1 per 1,000 trials | seeded campaign on the emulator |
| Real-ELF replay | 100,000 of 100,000 snapshots identical | unit test, CI |
| Race replay | 20 of 20 identical | unit test, CI |
| Golden trace stream | 66 bytes, 7 events (9.43 bytes per event) | carried byte for byte through RTL in simulation |
| ECP5 synthesis | 41 LUT4, 93 FF, 2 EBR, 22 CCU2C | Yosys |
| Place and route | 211.42 MHz | provisional tool estimate, not board timing |

The place-and-route figure comes from a constraints file that sets only a 100 MHz clock and assigns no pins, and the run reports 54 warnings for unassigned I/O. The project reports no bytes-per-second figure, because an instruction count is not an emulated clock.

## How it was checked

- The suite has 39 tests. CI run 31524893189 on 2026-08-11 passed all 39 against the built ELF.
- The trace codec passes 10,000 seeded random encode and decode round trips and rejects malformed input.
- A test changes one MMIO read and checks that the differ reports the first mismatch.
- On 2026-10-21, on a host without the Arm toolchain or Icarus, 23 tests passed, 14 errored on the missing ELF and 2 skipped. The 100,000-snapshot, race and RTL numbers were not reproduced that day. They come from CI and the checked-in docs.

## Limits and next steps

- The race is reproduced on an emulator, so it shows the modeled schedule, not silicon interrupt latency or cache effects.
- Unicorn has no hardware stacking, priorities, masking, nested IRQs or general NVIC model.
- The emulator decodes the 16-bit Thumb branches the race ELF needs. Full Thumb-32 control flow is not covered.
- Real replay supports IRQ, MMIO read and DMA events only.
- Planned next: board and pin selection, physical trace ingress, CDC and reset checks on silicon, an on-device golden stream and physical replay acceptance.

## Links

1. [Repository](https://github.com/RahilBhavan/cortex-m-deterministic-replay)
2. [Verification and every measured number](https://github.com/RahilBhavan/cortex-m-deterministic-replay/blob/main/docs/verification.md)
3. [Ceilings: what the evidence does not show](https://github.com/RahilBhavan/cortex-m-deterministic-replay/blob/main/docs/ceilings.md)

---

**Completed:** October 21, 2026
