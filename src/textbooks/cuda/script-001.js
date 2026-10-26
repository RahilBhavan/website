
function initThreadHierarchy() {
    const gridG  = document.getElementById('grid-blocks');
    const blockG = document.getElementById('block-threads');
    const warpG  = document.getElementById('warp-lanes');
    if (!gridG) return;

    // 4x4 blocks
    let html = '';
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const sel = (r === 1 && c === 1);
            html += `<rect x="${c*42}" y="${r*42}" width="38" height="38" rx="2"
                fill="${sel ? '#111214' : '#c6c7bf'}"
                stroke="${sel ? '#111214' : '#52545a'}" stroke-width="${sel?2:1}"/>`;
            html += `<text x="${c*42+19}" y="${r*42+24}" font-family="JetBrains Mono"
                font-size="9" fill="${sel ? '#f5f5ef' : '#52545a'}" text-anchor="middle">${r*4+c}</text>`;
        }
    }
    gridG.innerHTML = html;

    function renderBlock() {
        // 8x8 thread grid, color warps 0 (top 4 rows) and 1 (bottom 4 rows)
        let h = '';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const warp = r < 4 ? 0 : 1;
                const fill = warp === 0 ? '#52545a' : '#52545a';
                h += `<rect x="${c*22}" y="${r*22}" width="20" height="20" rx="2"
                    fill="${fill}" opacity="0.75" stroke="#f5f5ef"/>`;
            }
        }
        // Warp label brackets
        h += `<text x="-6" y="50" font-family="JetBrains Mono" font-size="9"
            fill="#52545a" text-anchor="end">w0</text>`;
        h += `<text x="-6" y="138" font-family="JetBrains Mono" font-size="9"
            fill="#52545a" text-anchor="end">w1</text>`;
        blockG.innerHTML = h;
    }
    renderBlock();

    function renderWarp(div) {
        let h = '';
        // 32 lanes in 2 rows of 16
        for (let i = 0; i < 32; i++) {
            const r = Math.floor(i / 16);
            const c = i % 16;
            let fill = '#52545a';
            if (div) {
                // pseudo-random partition: even=if branch (active), odd=else (idle)
                fill = (i % 3 === 0) ? '#52545a' : '#52545a';
            }
            h += `<rect x="${c*14}" y="${r*22}" width="12" height="20" rx="1"
                fill="${fill}" stroke="#f5f5ef"/>`;
            h += `<text x="${c*14+6}" y="${r*22+13}" font-family="JetBrains Mono"
                font-size="7" fill="#f5f5ef" text-anchor="middle">${i}</text>`;
        }
        if (div) {
            h += `<text x="0" y="62" font-family="JetBrains Mono" font-size="9"
                fill="#111214">~ 1/3 lanes idle: branch serialized</text>`;
        } else {
            h += `<text x="0" y="62" font-family="JetBrains Mono" font-size="9"
                fill="#111214">all 32 lanes active: peak issue rate</text>`;
        }
        warpG.innerHTML = h;
    }
    renderWarp(true);

    const convBtn = document.getElementById('th-hier-conv');
    const divBtn  = document.getElementById('th-hier-div');
    if (convBtn) convBtn.addEventListener('click', () => {
        convBtn.classList.add('active'); divBtn.classList.remove('active');
        renderWarp(false);
    });
    if (divBtn) divBtn.addEventListener('click', () => {
        divBtn.classList.add('active'); convBtn.classList.remove('active');
        renderWarp(true);
    });
}

/* ============================================================
   CHAPTER 1.5 — OCCUPANCY CALCULATOR
   ============================================================ */
function initOccupancy() {
    const tpbEl  = document.getElementById('occ-tpb');
    if (!tpbEl) return;
    const regEl  = document.getElementById('occ-reg');
    const smemEl = document.getElementById('occ-smem');

    // sm_86 (RTX 3090) hardware limits
    const SM_REGS       = 65536;     // 32-bit registers per SM
    const SM_MAX_WARPS  = 48;        // active warps per SM
    const SM_MAX_BLOCKS = 16;        // resident blocks per SM
    const SM_SMEM_KB    = 100;       // ~100 KB SMEM partition (out of 128 KB L1+SMEM)
    const WARP_SIZE     = 32;
    const BLOCK_REG_GRANULARITY = 256;  // regs allocated per warp, rounded up

    function compute() {
        const tpb  = +tpbEl.value;       // threads/block
        const reg  = +regEl.value;       // registers/thread
        const smem = +smemEl.value;      // KB per block

        document.getElementById('occ-tpb-v').textContent  = tpb;
        document.getElementById('occ-reg-v').textContent  = reg;
        document.getElementById('occ-smem-v').textContent = smem + ' KB';

        const warpsPerBlock = Math.ceil(tpb / WARP_SIZE);

        // Per-warp regs are rounded up to BLOCK_REG_GRANULARITY.
        const regsPerWarp = Math.ceil(reg * WARP_SIZE / BLOCK_REG_GRANULARITY) * BLOCK_REG_GRANULARITY;
        const regsPerBlock = regsPerWarp * warpsPerBlock;

        // Block-count caps from each resource:
        const cap_block_hw  = SM_MAX_BLOCKS;
        const cap_warps     = Math.floor(SM_MAX_WARPS / warpsPerBlock);
        const cap_regs      = regsPerBlock > 0 ? Math.floor(SM_REGS / regsPerBlock) : SM_MAX_BLOCKS;
        const cap_smem      = smem > 0 ? Math.floor(SM_SMEM_KB / smem) : SM_MAX_BLOCKS;

        const activeBlocks = Math.min(cap_block_hw, cap_warps, cap_regs, cap_smem);
        const activeWarps  = activeBlocks * warpsPerBlock;
        const occPct       = (activeWarps / SM_MAX_WARPS) * 100;

        // Limiting factor — pick the smallest non-trivial cap.
        let limit = 'Block hardware limit';
        const caps = [
            {name: 'Block HW limit (16)',    v: cap_block_hw},
            {name: 'Warps (48/SM)',          v: cap_warps},
            {name: 'Registers (65,536/SM)',  v: cap_regs},
            {name: 'Shared memory (~100 KB/SM)', v: cap_smem}
        ];
        caps.sort((a, b) => a.v - b.v);
        limit = caps[0].name;

        document.getElementById('occ-warps').textContent     = activeWarps;
        document.getElementById('occ-warps-pct').textContent = occPct.toFixed(1) + '% of 48';
        document.getElementById('occ-blocks').textContent    = activeBlocks;
        document.getElementById('occ-blocks-pct').textContent= 'of 16 max';
        document.getElementById('occ-limit').textContent     = limit;

        const lines = [
            `Threads/block:           ${tpb}`,
            `Warps/block:             ceil(${tpb} / 32) = ${warpsPerBlock}`,
            `Regs/warp (granularity): ceil(${reg} × 32 / 256) × 256 = ${regsPerWarp}`,
            `Regs/block:              ${regsPerWarp} × ${warpsPerBlock} = ${regsPerBlock.toLocaleString()}`,
            `Block caps from:`,
            `  warps  : floor(48 / ${warpsPerBlock}) = ${cap_warps}`,
            `  regs   : floor(65536 / ${regsPerBlock || 1}) = ${cap_regs}`,
            `  smem   : ${smem > 0 ? `floor(100 / ${smem}) = ${cap_smem}` : '— (no SMEM use)'}`,
            `  hw     : ${cap_block_hw}`,
            `Active blocks/SM = min(${cap_block_hw}, ${cap_warps}, ${cap_regs}, ${smem>0?cap_smem:'—'}) = ${activeBlocks}`,
            `Active warps/SM  = ${activeBlocks} × ${warpsPerBlock} = ${activeWarps}`,
            `Occupancy        = ${activeWarps} / 48 = ${occPct.toFixed(1)}%`
        ];
        document.getElementById('occ-derivation').textContent = lines.join('\n');
    }

    [tpbEl, regEl, smemEl].forEach(el => el.addEventListener('input', compute));
    compute();
}

/* ============================================================
   CHAPTER 1.6 — ROOFLINE CHART
   ============================================================ */
const GPU_PEAKS = {
    '3090':       { compute: 142000, bw: 936,  label: 'RTX 3090 FP16-TC' },
    'a100':       { compute: 312000, bw: 2039, label: 'A100 80GB FP16-TC' },
    'h100':       { compute: 989000, bw: 3350, label: 'H100 SXM FP16-TC' },
    '3090-fp32':  { compute: 35600,  bw: 936,  label: 'RTX 3090 FP32 CUDA' }
};

function makeRooflineData(gpuKey, userI, userEffPct) {
    const peak = GPU_PEAKS[gpuKey];
    // x range in log space: 0.1 to 10000 FLOP/byte
    const xs = [];
    for (let lx = -1; lx <= 4; lx += 0.05) xs.push(Math.pow(10, lx));

    const memRoof = xs.map(I => Math.min(I * peak.bw, peak.compute));
    const compRoof = xs.map(_ => peak.compute);

    const ridge = peak.compute / peak.bw;

    // landmark points (rough)
    const landmarks = [
        { x: 1,    y: 1 * peak.bw * 0.45, label: 'Naive GEMM' },
        { x: 8,    y: 8 * peak.bw * 0.55, label: 'SMEM tiled' },
        { x: 200,  y: peak.compute * 0.55, label: 'WMMA TC' },
        { x: 500,  y: peak.compute * 0.88, label: 'cuBLAS' },
    ];

    const userPoint = { x: userI, y: Math.min(userI * peak.bw, peak.compute) * (userEffPct/100) };

    return { xs, memRoof, compRoof, ridge, landmarks, userPoint, peak };
}

registerChart('roofline-fig', (root) => {
    const ctx = root.querySelector('#roofline-canvas').getContext('2d');
    let chart;

    function build() {
        const gpu = document.getElementById('roof-gpu').value;
        const userI   = Math.pow(10, +document.getElementById('roof-i').value);
        const userEff = +document.getElementById('roof-eff').value;
        document.getElementById('roof-i-v').textContent   = userI < 1 ? userI.toFixed(2) : userI.toFixed(0);
        document.getElementById('roof-eff-v').textContent = userEff + '%';

        const d = makeRooflineData(gpu, userI, userEff);

        const ridgeMarker = [{x: d.ridge, y: 1}, {x: d.ridge, y: d.peak.compute}];
        const data = {
            datasets: [
                {
                    label: 'Memory roof (slope = BW)',
                    data: d.xs.map((x, i) => ({x, y: d.memRoof[i]})),
                    type: 'line',
                    borderColor: '#111214',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                },
                {
                    label: 'Compute roof',
                    data: d.xs.map((x, i) => ({x, y: d.compRoof[i]})),
                    type: 'line',
                    borderColor: '#52545a',
                    borderWidth: 2,
                    borderDash: [6,3],
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: `Ridge point I* ≈ ${d.ridge.toFixed(0)}`,
                    data: ridgeMarker,
                    type: 'line',
                    borderColor: 'rgba(12, 10, 9, 0.18)',
                    borderWidth: 1,
                    borderDash: [3,3],
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: 'Reference kernels',
                    data: d.landmarks.map(l => ({x: l.x, y: l.y, lab: l.label})),
                    type: 'scatter',
                    backgroundColor: '#52545a',
                    borderColor: '#52545a',
                    pointRadius: 5,
                    pointHoverRadius: 8
                },
                {
                    label: 'Your kernel',
                    data: [{x: d.userPoint.x, y: d.userPoint.y}],
                    type: 'scatter',
                    backgroundColor: '#111214',
                    borderColor: '#111214',
                    pointRadius: 9,
                    pointHoverRadius: 12,
                    pointStyle: 'rectRot'
                }
            ]
        };

        if (chart) chart.destroy();
        chart = new Chart(ctx, {
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'logarithmic',
                        min: 0.1, max: 10000,
                        title: { display: true, text: 'Arithmetic Intensity (FLOP/byte)' },
                        grid: { color: 'rgba(12, 10, 9, 0.06)' }
                    },
                    y: {
                        type: 'logarithmic',
                        min: 1, max: 2000000,
                        title: { display: true, text: 'Performance (GFLOPS)' },
                        grid: { color: 'rgba(12, 10, 9, 0.06)' }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: d.peak.label + ' — peak ' + d.peak.compute.toLocaleString() + ' GFLOPS, ' + d.peak.bw + ' GB/s',
                        color: '#111214',
                        font: { size: 12, family: 'JetBrains Mono' }
                    },
                    legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const d = ctx.raw;
                                let lab = ctx.dataset.label + ': ';
                                lab += `I=${d.x < 1 ? d.x.toFixed(2) : d.x.toFixed(0)} FLOP/B, P=${(d.y/1000).toFixed(1)} TFLOPS`;
                                if (d.lab) lab += ` (${d.lab})`;
                                return lab;
                            }
                        }
                    }
                }
            }
        });
    }

    document.getElementById('roof-gpu').addEventListener('change', build);
    document.getElementById('roof-i').addEventListener('input', build);
    document.getElementById('roof-eff').addEventListener('input', build);
    build();
});

/* ============================================================
   CHAPTER 3.1 — TENSOR CORE THROUGHPUT BAR CHART
   ============================================================ */


/* ============================================================
   CHAPTER 4.3 — NSIGHT COMPUTE MOCK UI
   ============================================================ */
const NCU_MOCK = {
    naive: {
        title: 'gemmNaive · M=N=K=4096 FP32',
        sol_sm: 4.2, sol_mem: 78.0,
        sol_l1: 12.0, sol_l2: 31.0,
        achieved_gflops: 510,
        stalls: {
            long_scoreboard: 71.2,
            short_scoreboard: 0.4,
            mio_throttle: 0.0,
            not_selected: 11.4,
            barrier: 0.0,
            other: 17.0
        },
        bottleneck: 'Memory bandwidth (DRAM 78% SOL, SM only 4%)'
    },
    tiled: {
        title: 'gemmTiled · M=N=K=4096 FP32',
        sol_sm: 31.5, sol_mem: 22.0,
        sol_l1: 64.0, sol_l2: 17.0,
        achieved_gflops: 15400,
        stalls: {
            long_scoreboard: 18.2,
            short_scoreboard: 24.8,
            mio_throttle: 9.1,
            not_selected: 26.5,
            barrier: 6.0,
            other: 15.4
        },
        bottleneck: 'SMEM throughput / short_scoreboard (move work to registers)'
    },
    tc: {
        title: 'gemmMma · M=N=K=4096 FP16',
        sol_sm: 88.0, sol_mem: 9.0,
        sol_l1: 41.0, sol_l2: 5.0,
        achieved_gflops: 130000,
        stalls: {
            long_scoreboard: 3.2,
            short_scoreboard: 4.1,
            mio_throttle: 0.6,
            not_selected: 78.0,
            barrier: 2.3,
            other: 11.8
        },
        bottleneck: 'None — compute-bound, 88% SM SOL. not_selected dominant = healthy.'
    }
};
