(()=>{

const ISSUER_WALLETS = new Set([
  "0xsecuritize_xfer_agt",
  "0xbnymellon_custody",
  "0xondo_treasury",
  "0xondo_rebalancer",
]);
const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

const SAMPLE = [
  { id: 1,  token: "USDY",  from: "0x0000000000000000000000000000000000000000", to: "0xondo_treasury",       value: 50000, note: "mint to treasury" },
  { id: 2,  token: "USDY",  from: "0xondo_treasury",       to: "0xa0b8c4ad19fec_retail_1", value: 12000, note: "primary issuance to retail wallet" },
  { id: 3,  token: "USDY",  from: "0xa0b8c4ad19fec_retail_1", to: "0xd8da6bf26964af9d_retail_2", value: 8000, note: "p2p secondary trade ✓" },
  { id: 4,  token: "USDY",  from: "0xa0b8c4ad19fec_retail_1", to: "0xa0b8c4ad19fec_retail_1", value: 100, note: "self-transfer (rare; accounting)" },
  { id: 5,  token: "BUIDL", from: "0xsecuritize_xfer_agt", to: "0xbnymellon_custody",         value: 1000000, note: "issuer-to-issuer custody op" },
  { id: 6,  token: "BUIDL", from: "0xinstitution_a",       to: "0xinstitution_b",             value: 500000, note: "institutional secondary trade ✓" },
  { id: 7,  token: "OUSG",  from: "0xinstitution_c",       to: "0x0000000000000000000000000000000000000000", value: 75000, note: "burn (redemption)" },
  { id: 8,  token: "OUSG",  from: "0xondo_rebalancer",     to: "0xuniswap_v3_ousg_usdc_pool", value: 250000, note: "issuer seeding AMM (excluded — issuer side)" },
  { id: 9,  token: "OUSG",  from: "0xtrader_x",            to: "0xuniswap_v3_ousg_usdc_pool", value: 5000, note: "trader swaps INTO pool ✓ (counted)" },
  { id: 10, token: "OUSG",  from: "0xuniswap_v3_ousg_usdc_pool", to: "0xtrader_y",            value: 5000, note: "trader swaps OUT of pool ✓ (counted)" },
  { id: 11, token: "USDY",  from: "0xa0b8c4ad19fec_retail_1", to: "0xd8da6bf26964af9d_retail_2", value: 0, note: "zero-value bookkeeping" },
];

function renderTransfers() {
  const f_mint = document.getElementById("f_mint").checked;
  const f_burn = document.getElementById("f_burn").checked;
  const f_issuer = document.getElementById("f_issuer").checked;
  const f_self = document.getElementById("f_self").checked;
  const f_zero = document.getElementById("f_zero").checked;

  const rows = SAMPLE.map(t => {
    let kept = true; let reason = "secondary ✓";
    if (f_mint && t.from === ZERO_ADDR) { kept = false; reason = "mint (from = 0x000)"; }
    else if (f_burn && t.to === ZERO_ADDR) { kept = false; reason = "burn (to = 0x000)"; }
    else if (f_issuer && (ISSUER_WALLETS.has(t.from) || ISSUER_WALLETS.has(t.to))) { kept = false; reason = "issuer wallet"; }
    else if (f_self && t.from === t.to) { kept = false; reason = "self-transfer"; }
    else if (f_zero && t.value === 0) { kept = false; reason = "zero-value"; }
    return { ...t, kept, reason };
  });

  const html = rows.map(r => `
    <div style="display:grid;grid-template-columns:24px 60px 1fr 100px;gap:8px;
                padding:6px 10px;border-bottom:1px solid var(--rule-soft);
                font-family:var(--font-mono);font-size:12.5px;
                background:${r.kept ? 'rgba(58,124,71,0.06)' : 'rgba(226,75,74,0.05)'}">
      <span style="font-family:var(--font-sans);font-weight:700;color:${r.kept ? 'var(--good)' : 'var(--highlight)'}">${r.kept ? '✓' : '✗'}</span>
      <span><strong>${r.token}</strong></span>
      <span style="color:var(--ink-soft)">${r.note}</span>
      <span style="font-size:11px;color:var(--ink-muted);text-align:right">${r.reason}</span>
    </div>
  `).join("");
  document.getElementById("transferList").innerHTML = html;

  const kept = rows.filter(r => r.kept).length;
  document.getElementById("filterStats").innerHTML = `
    <strong>${kept} / ${rows.length}</strong> transfers classified as secondary.
    With <em>all</em> filters off, every row is "secondary" — but mints, burns, and issuer
    movements would all be counted as trades, inflating velocity by ${Math.round((rows.length / Math.max(kept,1) - 1) * 100)}% in this synthetic batch.
  `;
}
document.getElementById("applyFilters").addEventListener("click", renderTransfers);
document.querySelectorAll(".interactive input[type=checkbox]").forEach(el =>
  el.addEventListener("change", renderTransfers));
renderTransfers();

})();