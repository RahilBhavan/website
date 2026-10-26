// Exports the March 2020 cbBTC grid (liquidator capital x LLTV) from spine's backtest into src/data/spine-march-2020.json.
// Reads rows the backtest already ran; nothing is recomputed or interpolated.
// Usage: node scripts/export-spine-data.mjs <spine data/backtest.json> <spine commit that produced it>
import { readFileSync, writeFileSync } from 'node:fs';

const [, , source, commit] = process.argv;
if (!source || !commit) {
  console.error('usage: node scripts/export-spine-data.mjs <backtest.json> <spine commit>');
  process.exit(1);
}

// Python writes the unlimited cap as a bare Infinity, which JSON.parse rejects.
const text = readFileSync(source, 'utf8');
if (/\bNaN\b/.test(text)) throw new Error('backtest.json contains NaN');
const backtest = JSON.parse(text.replace(/:\s*Infinity\b/g, ': "Infinity"'));
const { defaults: D, calibrated: C, latest_book: book } = backtest;

const LLTVS = [0.77, 0.8, 0.86];
// Tier B rolling 24h cap, as a multiple of the most collateral ever seized in one day (D.cex_cap_usd).
const CAPITAL = [
  { id: 'x1', scenario: 'AB', multiple: 1, label: '1×' },
  { id: 'x3', scenario: 'AB', multiple: 3, label: '3×' },
  { id: 'x10', scenario: 'AB', multiple: 10, label: '10×' },
  { id: 'none', scenario: 'AB', multiple: Infinity, label: 'No limit' },
  { id: 'backstop', scenario: 'ABC', multiple: 1, label: 'Backstop' },
];

// The same filter spine/writeup_tables.py uses: calibrated behaviour, default depth, latest book.
const base = {
  market: 'cbBTC', window: 'Mar2020', book, cap: 0.75, k_dex: D.k_dex, k_cex: D.k_cex, r: D.r, lag_bars: D.lag_bars,
  margin: D.margin, beta: D.beta, seed: 0, hold_bars: D.hold_bars, book_multiple: D.book_multiple,
  resp_share: C.resp_share, react_min: C.react_min, close_target: C.close_target, full_below_usd: C.full_below_usd,
};

const find = (scenario, lltv, capUsd) => {
  const want = { ...base, scenario, lltv, cex_cap_usd: capUsd };
  const hits = backtest.runs.filter((r) => Object.entries(want).every(([k, v]) => r[k] === v));
  if (hits.length !== 1) throw new Error(`expected one run for ${JSON.stringify({ scenario, lltv, capUsd })}, found ${hits.length}`);
  return hits[0];
};

// The backtest stores loss as a percent of supply, so supply is implied by any row with a loss.
const impliedSupply = (r) => ((r.realized_bad_debt_usd + r.unrealized_bad_debt_usd) * 100) / r.bad_debt_pct_supply;

const cells = {};
const supplies = [];
for (const cap of CAPITAL) {
  cells[cap.id] = {};
  const capUsd = cap.multiple === Infinity ? Infinity : D.cex_cap_usd * cap.multiple;
  for (const lltv of LLTVS) {
    const r = find(cap.scenario, lltv, capUsd === Infinity ? 'Infinity' : capUsd);
    const loss = r.realized_bad_debt_usd + r.unrealized_bad_debt_usd;
    if (loss > 0) supplies.push(impliedSupply(r));
    cells[cap.id][lltv] = { lossUsd: loss, unservedUsd: r.trough_exposure_usd };
  }
}

const supplyUsd = supplies[0];
for (const s of supplies) {
  if (Math.abs(s / supplyUsd - 1) > 1e-4) throw new Error(`supply differs across the grid: ${s} vs ${supplyUsd}`);
}
for (const row of Object.values(cells)) {
  for (const c of Object.values(row)) {
    c.lossShare = c.lossUsd / supplyUsd;
    c.unservedShare = c.unservedUsd / supplyUsd;
  }
}

const out = {
  source: {
    repo: 'https://github.com/RahilBhavan/spine',
    commit,
    file: 'data/backtest.json',
    bookDate: book,
    backtestGeneratedAt: new Date(backtest.generated_at * 1000).toISOString(),
    market: 'cbBTC/USDC, Morpho on Base, 86% LLTV today',
    path: 'March 2020, replayed at 5-minute steps from the pre-crash peak',
  },
  behaviour: { respondingShare: C.resp_share, reactionMinutes: C.react_min, bonus: '4.38%' },
  supplyUsd,
  oneDayCapUsd: D.cex_cap_usd,
  lltv: LLTVS,
  capital: CAPITAL.map(({ id, scenario, label, multiple }) => ({ id, scenario, label, multiple: Number.isFinite(multiple) ? multiple : null })),
  cells,
};

writeFileSync(new URL('../src/data/spine-march-2020.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log(`wrote ${CAPITAL.length * LLTVS.length} cells for book ${book}, supply $${(supplyUsd / 1e6).toFixed(1)}M`);
