import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  pue, lineCurrentA, kvBytesPerToken, residentRequests, waterLitersPerDay,
  coolantTempRiseK, mwhPerDay, costPerMillionTokens,
} from '../public/tools/datacenter-math/calc.js';

const near = (a, b, tol) => assert.ok(Math.abs(a - b) < tol, `${a} not within ${tol} of ${b}`);

test('PUE: 1500 kWh IT + 300 kWh overhead = 1.20, 150 kWh = 1.10', () => {
  assert.equal(pue({ itKwh: 1500, facilityOverheadKwh: 300 }), 1.2);
  assert.equal(pue({ itKwh: 1500, facilityOverheadKwh: 150 }), 1.1);
});

test('100 kW at 480 V AC 3-phase is about 120 A; at 800 V DC exactly 125 A', () => {
  near(lineCurrentA({ powerKw: 100, voltage: 480, phases: 3 }), 120, 1);
  assert.equal(lineCurrentA({ powerKw: 100, voltage: 800, phases: 1 }), 125);
});

test('10 MW at 10 kV is about 577 A; at 20 kV about 289 A', () => {
  near(lineCurrentA({ powerKw: 10000, voltage: 10000, phases: 3 }), 577, 1);
  near(lineCurrentA({ powerKw: 10000, voltage: 20000, phases: 3 }), 289, 1);
});

test('Llama 3.1 70B BF16 KV cache is 327680 bytes (320 KiB) per token', () => {
  assert.equal(kvBytesPerToken({ layers: 80, kvHeads: 8, headDim: 128 }), 327680);
});

test('64 GiB pool holds 25 requests at 8K context, 6 at 32K', () => {
  const poolBytes = 64 * 2 ** 30;
  assert.equal(residentRequests({ poolBytes, ctxLen: 8192, kvBytesPerToken: 327680 }), 25);
  assert.equal(residentRequests({ poolBytes, ctxLen: 32768, kvBytesPerToken: 327680 }), 6);
});

test('100 MWh IT day at 1.25 L/kWh intake is 125000 L', () => {
  assert.equal(waterLitersPerDay({ itMwhPerDay: 100, litersPerKwh: 1.25 }), 125000);
});

test('84 kW into 2 kg/s water at cp 4.2 gives a 10 K rise', () => {
  near(coolantTempRiseK({ heatKw: 84, flowKgPerS: 2, specificHeatKjPerKgK: 4.2 }), 10, 0.05);
});

test('10 MW flat for a day is 240 MWh', () => {
  assert.equal(mwhPerDay({ facilityMw: 10 }), 240);
});

test('$/M tokens falls with throughput; $2.00/GPU-hr at 1000 tok/s is about $0.556', () => {
  const at = (t) => costPerMillionTokens({ gpuHourUsd: 2.0, tokensPerSecond: t });
  assert.ok(at(500) > at(1000) && at(1000) > at(2000));
  near(at(1000), 0.556, 0.001);
});
