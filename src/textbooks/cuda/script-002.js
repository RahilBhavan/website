
function renderNcuMock(which) {
    const m = NCU_MOCK[which];
    const target = document.getElementById('ncu-mock');
    const bar = (label, val, color, max = 100) => `
        <div style="margin-bottom: 8px">
            <div style="display:flex; justify-content:space-between; font-size: 11px; margin-bottom: 2px">
                <span style="color: var(--text-secondary)">${label}</span>
                <span style="color: ${color}; font-weight: 600">${val.toFixed(1)}%</span>
            </div>
            <div style="height: 6px; background: rgba(12, 10, 9, 0.05); border-radius: 3px; overflow: hidden">
                <div style="height: 100%; width: ${Math.min(100, val/max*100)}%; background: ${color}; transition: width 0.3s ease"></div>
            </div>
        </div>
    `;

    const sol = `
        <div style="padding: 16px 18px; background: var(--bg-elev-2); border: 1px solid var(--border-subtle); border-radius: 6px;">
            <div style="font-family: var(--font-mono); font-size: 10px; color: var(--accent-cyan);
                text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 4px">SPEED OF LIGHT</div>
            <div style="font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); margin-bottom: 14px">${m.title}</div>
            ${bar('SM (Compute)',  m.sol_sm,  '#52545a')}
            ${bar('Memory',        m.sol_mem, '#111214')}
            ${bar('L1 / SMEM',     m.sol_l1,  '#52545a')}
            ${bar('L2',            m.sol_l2,  '#111214')}
            <div style="margin-top: 14px; font-family: var(--font-mono); font-size: 13px;
                color: var(--accent-amber); font-weight: 600">
                ${m.achieved_gflops.toLocaleString()} GFLOPS achieved
            </div>
        </div>
    `;

    const stalls = `
        <div style="padding: 16px 18px; background: var(--bg-elev-2); border: 1px solid var(--border-subtle); border-radius: 6px;">
            <div style="font-family: var(--font-mono); font-size: 10px; color: var(--accent-cyan);
                text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 4px">WARP STATE</div>
            <div style="font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); margin-bottom: 14px">% of warps stalled by reason</div>
            ${bar('long_scoreboard (global)',  m.stalls.long_scoreboard, '#111214')}
            ${bar('short_scoreboard (SMEM)',  m.stalls.short_scoreboard, '#111214')}
            ${bar('mio_throttle',             m.stalls.mio_throttle, '#111214')}
            ${bar('barrier (__syncthreads)',  m.stalls.barrier, '#52545a')}
            ${bar('not_selected (HEALTHY)',   m.stalls.not_selected, '#111214')}
            ${bar('other',                    m.stalls.other, '#52545a')}
            <div style="margin-top: 14px; padding: 8px 10px; background: rgba(232, 184, 196, 0.4);
                border-left: 2px solid var(--accent-red); font-family: var(--font-serif);
                font-size: 12px; color: var(--text-primary); line-height: 1.45">
                <strong style="color: var(--accent-red)">Bottleneck:</strong> ${m.bottleneck}
            </div>
        </div>
    `;
    target.innerHTML = sol + stalls;
}

function initNcuMock() {
    if (!document.getElementById('ncu-mock')) return;
    const map = { naive: 'ncu-mock-naive', tiled: 'ncu-mock-tiled', tc: 'ncu-mock-tc' };
    Object.entries(map).forEach(([key, id]) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', () => {
            Object.values(map).forEach(x => {
                const e = document.getElementById(x);
                if (e) e.classList.remove('active');
            });
            btn.classList.add('active');
            renderNcuMock(key);
        });
    });
    renderNcuMock('naive');
}

/* ============================================================
   CHAPTER 5.3 — OPTIMIZATION PROGRESS BAR CHART
   ============================================================ */


/* ============================================================
   ON DOM READY — RUN THE NON-LAZY INITIALIZERS
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
    initThreadHierarchy();
    initOccupancy();
    initNcuMock();
});
