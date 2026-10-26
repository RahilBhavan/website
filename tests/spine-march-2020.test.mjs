import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildGrid, share, usd } from '../src/lib/spine-grid.ts';

const data = JSON.parse(readFileSync(new URL('../src/data/spine-march-2020.json', import.meta.url), 'utf8'));
const grid = buildGrid(data);
const at = (cap, lltv) => grid.cells[cap][lltv];

test('the file is a complete 5 x 3 grid for one dated book', () => {
  assert.match(data.source.bookDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(data.source.commit, /^[0-9a-f]{40}$/);
  assert.deepEqual(data.capital.map((c) => c.id), ['x1', 'x3', 'x10', 'none', 'backstop']);
  assert.deepEqual(data.lltv, [0.77, 0.8, 0.86]);
  for (const c of data.capital) for (const l of data.lltv) {
    const cell = data.cells[c.id][l];
    assert.ok(cell && cell.lossUsd >= 0 && cell.unservedUsd >= 0, `${c.id} ${l}`);
    assert.ok(Math.abs(cell.unservedShare - cell.unservedUsd / data.supplyUsd) < 1e-12);
    assert.ok(Math.abs(cell.lossShare - cell.lossUsd / data.supplyUsd) < 1e-12);
  }
});

// Figures printed by the Spine write-up (/writing/what-haircut-should-coinbase-take-on-btc-and-eth-collateral)
test('86% LLTV at 1x matches the write-up: $9.2M realized loss, $158.4M (10.0%) unserved', () => {
  assert.equal(at('x1', 0.86).loss.usd, '$9.2M');
  assert.equal(at('x1', 0.86).unserved.usd, '$158.4M');
  assert.equal(at('x1', 0.86).unserved.share, '10.0%');
  assert.equal(at('x1', 0.86).loss.share, '0.6%');
});

test('the other write-up figures hold: 77% 8.4%, 3x capital 6.2%, backstop 0.8% with nothing else unserved', () => {
  assert.equal(at('x1', 0.77).unserved.share, '8.4%');
  assert.equal(at('x3', 0.86).unserved.share, '6.2%');
  assert.equal(at('backstop', 0.86).unserved.share, '0.8%');
  assert.equal(at('backstop', 0.86).unserved.usd, at('backstop', 0.86).loss.usd);
});

test('bar widths share one scale and stay inside the track', () => {
  for (const row of Object.values(grid.cells)) for (const c of Object.values(row)) {
    for (const k of ['unserved', 'loss']) assert.ok(c[k].width >= 0 && c[k].width <= 100);
  }
  assert.equal(grid.scale, 0.1);
});

test('display formatting', () => {
  assert.equal(usd(0), '$0');
  assert.equal(usd(700000), '$0.70M');
  assert.equal(usd(1.011e9), '$1.01B');
  assert.equal(share(0), '0%');
  assert.equal(share(0.0004), '<0.1%');
  assert.equal(share(0.00097), '0.1%');
});
