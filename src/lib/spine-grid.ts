// Formats the precomputed Spine grid for the page. No result is computed here: every figure is looked up in
// src/data/spine-march-2020.json and only rounded for display.

export const usd = (x: number) => (x === 0 ? '$0' : x < 1e6 ? `$${(x / 1e6).toFixed(2)}M` : x < 1e9 ? `$${(x / 1e6).toFixed(1)}M` : `$${(x / 1e9).toFixed(2)}B`);

export const share = (x: number) => (x === 0 ? '0%' : x < 0.0005 ? '<0.1%' : `${(x * 100).toFixed(1)}%`);

const CAPITAL_TEXT: Record<string, string> = {
  x1: 'liquidators can sell $101M of collateral a day (1×)',
  x3: 'liquidators can sell $303M of collateral a day (3×)',
  x10: 'liquidators can sell $1.01B of collateral a day (10×)',
  none: 'no limit on liquidator capital, only market depth',
  backstop: 'Coinbase backstop, hypothetical (redeems cbBTC 1:1)',
};

interface RawCell { lossUsd: number; unservedUsd: number; lossShare: number; unservedShare: number }
export interface SpineData {
  capital: { id: string; scenario: string; label: string; multiple: number | null }[];
  lltv: number[];
  cells: Record<string, Record<string, RawCell>>;
}

/** Rows keyed by capital id and LLTV, with display strings ready for the page and the script. */
export function buildGrid(data: SpineData) {
  const scale = Math.ceil(Math.max(...Object.values(data.cells).flatMap((row) => Object.values(row).map((c) => c.unservedShare))) * 100) / 100;
  const cell = (c: RawCell) => ({
    unserved: { usd: usd(c.unservedUsd), share: share(c.unservedShare), width: (c.unservedShare / scale) * 100 },
    loss: { usd: usd(c.lossUsd), share: share(c.lossShare), width: (c.lossShare / scale) * 100 },
  });
  return {
    scale,
    capital: data.capital.map((c) => ({ ...c, text: CAPITAL_TEXT[c.id] })),
    lltv: data.lltv.map((l) => ({ value: l, label: `${Math.round(l * 100)}%` })),
    cells: Object.fromEntries(
      data.capital.map((c) => [c.id, Object.fromEntries(data.lltv.map((l) => [l, cell(data.cells[c.id][String(l)])]))])
    ),
  };
}
