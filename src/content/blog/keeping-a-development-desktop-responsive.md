---
title: "Keeping a development desktop responsive under load"
description: "The research behind my Linux memory controls: admission, job scopes, compressed swap, and what 602 compositor replies actually tell us."
publishDate: 2026-11-10
tags: ["linux", "systems", "memory", "measurement"]
readingTime: "35 min guide"
draft: false
---
My development machine runs builds, browser batches and agents alongside the desktop. The goal is to keep useful work moving without losing the controls needed to inspect and recover it.

[Read the illustrated RAM control guide →](/guides/box-ram)

The guide explains the research behind the controls, how the layers interact, and the limits of the evidence. It includes the complete research chapters, actual latency observations, a compressed-memory comparison and an implementation change log.

The narrow measured result: 602 display-off compositor requests succeeded across two one-minute windows, with no timeout and a maximum sampled reply of 4.063 ms. This does not establish frame smoothness or a build speed-up. The controlled build attempt timed out in admission before executing.

The next useful experiment is a matched observation around an admitted build. Until then, the architecture is well motivated, but its exact settings are provisional.
