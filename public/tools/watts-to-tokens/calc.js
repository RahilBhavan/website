// Pure functions behind the Watts to Tokens calculator.
// SI units in, explicit units in the names. Worked numbers come from
// "From Watts to Tokens", https://kiankyars.github.io/gigawatt/ (draft, 2026-09-10).

const SQRT3 = Math.sqrt(3);

export function rackPowerKw({ gpuCount, wattsPerGpu, overheadFraction = 0.3 }) {
  return (gpuCount * wattsPerGpu * (1 + overheadFraction)) / 1000;
}

export function lineCurrentA({ powerKw, voltage, powerFactor = 1, phases = 3 }) {
  const w = powerKw * 1000;
  return phases === 3 ? w / (SQRT3 * voltage * powerFactor) : w / (voltage * powerFactor);
}

export function pue({ itKwh, facilityOverheadKwh }) {
  return (itKwh + facilityOverheadKwh) / itKwh;
}

export function facilityMw({ itKw, pue }) {
  return (itKw * pue) / 1000;
}

export function mwhPerDay({ facilityMw }) {
  return facilityMw * 24;
}

export function waterLitersPerDay({ itMwhPerDay, litersPerKwh }) {
  return itMwhPerDay * 1000 * litersPerKwh;
}

export function coolantTempRiseK({ heatKw, flowKgPerS, specificHeatKjPerKgK = 4.186 }) {
  return heatKw / (flowKgPerS * specificHeatKjPerKgK);
}

export function kvBytesPerToken({ layers, kvHeads, headDim, dtypeBytes = 2 }) {
  return 2 * layers * kvHeads * headDim * dtypeBytes;
}

export function residentRequests({ poolBytes, ctxLen, kvBytesPerToken }) {
  return Math.floor(poolBytes / (ctxLen * kvBytesPerToken));
}

export function costPerMillionTokens({ gpuHourUsd, tokensPerSecond }) {
  return (gpuHourUsd / (tokensPerSecond * 3600)) * 1e6;
}
