
/* SYNTAX HIGHLIGHTING */
const CUDA_KEYWORDS = new Set(['if','else','for','while','do','switch','case','break','continue','return','class','struct','public','private','protected','virtual','static','const','constexpr','using','namespace','template','typename','typedef','sizeof','new','delete','nullptr','true','false','this','auto','inline','extern','enum','union','volatile','goto','default','operator','friend','reinterpret_cast','static_cast']);
const CUDA_QUALIFIERS = new Set(['__global__','__device__','__host__','__shared__','__constant__','__restrict__','__syncthreads','__syncwarp','__threadfence','__ldg','__ldcs','__stcs','threadIdx','blockIdx','blockDim','gridDim','warpSize','cudaMalloc','cudaFree','cudaMemcpy','cudaMemcpyAsync','cudaDeviceSynchronize','cudaEventCreate','cudaEventRecord','cudaEventSynchronize','cudaEventElapsedTime','cudaEventDestroy','cudaStreamCreate','cudaStreamDestroy','cudaError_t','cudaSuccess','cudaGetLastError','cudaGetErrorString','dim3','cudaMemcpyHostToDevice','cudaMemcpyDeviceToHost','cudaMemcpyDeviceToDevice','asm','volatile','cublasCreate','cublasDestroy','cublasGemmEx','cublasHandle_t','wmma','load_matrix_sync','mma_sync','store_matrix_sync','fill_fragment','printf']);
const CUDA_TYPES = new Set(['int','float','double','char','short','long','void','bool','unsigned','signed','size_t','int32_t','int64_t','uint32_t','uint64_t','int8_t','uint8_t','int16_t','uint16_t','half','half2','__half','__half2','nv_bfloat16','__nv_bfloat16','float2','float3','float4','int2','int3','int4','uchar4','fragment','matrix_a','matrix_b','accumulator','row_major','col_major']);
const PTX_MNEMONICS = new Set(['mma','sync','aligned','ldmatrix','stmatrix','cp','commit_group','wait_group','wait_all','ld','st','add','sub','mul','mad','fma','mov','cvt','setp','bra','shl','shr','and','or','xor','not','min','max','rcp','rsqrt','log','exp','global','shared','const','local','param','reg']);

function escapeHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function highlightCpp(code) {
    let out = ''; let i = 0; const n = code.length;
    while (i < n) {
        const c = code[i];
        if (c === '/' && code[i+1] === '/') {
            let j = i; while (j < n && code[j] !== '\n') j++;
            out += '<span class="tok-com">' + escapeHtml(code.slice(i, j)) + '</span>'; i = j; continue;
        }
        if (c === '/' && code[i+1] === '*') {
            let j = i + 2; while (j < n - 1 && !(code[j] === '*' && code[j+1] === '/')) j++;
            j = Math.min(j + 2, n);
            out += '<span class="tok-com">' + escapeHtml(code.slice(i, j)) + '</span>'; i = j; continue;
        }
        if (c === '#' && (i === 0 || code[i-1] === '\n')) {
            let j = i; while (j < n && code[j] !== '\n') j++;
            out += '<span class="tok-preproc">' + escapeHtml(code.slice(i, j)) + '</span>'; i = j; continue;
        }
        if (c === '"') {
            let j = i + 1; while (j < n && code[j] !== '"') { if (code[j] === '\\') j++; j++; }
            j = Math.min(j + 1, n);
            out += '<span class="tok-str">' + escapeHtml(code.slice(i, j)) + '</span>'; i = j; continue;
        }
        if (c === "'") {
            let j = i + 1; while (j < n && code[j] !== "'") { if (code[j] === '\\') j++; j++; }
            j = Math.min(j + 1, n);
            out += '<span class="tok-str">' + escapeHtml(code.slice(i, j)) + '</span>'; i = j; continue;
        }
        if (/[0-9]/.test(c) && (i === 0 || !/[a-zA-Z_]/.test(code[i-1]))) {
            let j = i; while (j < n && /[0-9a-fA-FxXulULfFpP.]/.test(code[j])) j++;
            out += '<span class="tok-num">' + escapeHtml(code.slice(i, j)) + '</span>'; i = j; continue;
        }
        if (/[a-zA-Z_]/.test(c)) {
            let j = i; while (j < n && /[a-zA-Z0-9_]/.test(code[j])) j++;
            const word = code.slice(i, j);
            let cls = null;
            if (CUDA_QUALIFIERS.has(word)) cls = 'tok-cuda';
            else if (CUDA_TYPES.has(word)) cls = 'tok-type';
            else if (CUDA_KEYWORDS.has(word)) cls = 'tok-kw';
            else if (j < n && code[j] === '(') cls = 'tok-fn';
            if (cls) out += '<span class="' + cls + '">' + escapeHtml(word) + '</span>';
            else out += escapeHtml(word);
            i = j; continue;
        }
        out += escapeHtml(c); i++;
    }
    return out;
}

function highlightPtx(code) {
    let out = ''; let i = 0; const n = code.length;
    while (i < n) {
        const c = code[i];
        if (c === '/' && code[i+1] === '/') {
            let j = i; while (j < n && code[j] !== '\n') j++;
            out += '<span class="tok-com">' + escapeHtml(code.slice(i, j)) + '</span>'; i = j; continue;
        }
        if (c === '.') {
            let j = i + 1; while (j < n && /[a-zA-Z0-9_]/.test(code[j])) j++;
            out += '<span class="tok-ptx">' + escapeHtml(code.slice(i, j)) + '</span>'; i = j; continue;
        }
        if (c === '%') {
            let j = i + 1; while (j < n && /[a-zA-Z0-9_]/.test(code[j])) j++;
            out += '<span class="tok-type">' + escapeHtml(code.slice(i, j)) + '</span>'; i = j; continue;
        }
        if (/[0-9]/.test(c) && (i === 0 || !/[a-zA-Z_]/.test(code[i-1]))) {
            let j = i; while (j < n && /[0-9a-fA-FxX.]/.test(code[j])) j++;
            out += '<span class="tok-num">' + escapeHtml(code.slice(i, j)) + '</span>'; i = j; continue;
        }
        if (c === '"') {
            let j = i + 1; while (j < n && code[j] !== '"') j++;
            j = Math.min(j + 1, n);
            out += '<span class="tok-str">' + escapeHtml(code.slice(i, j)) + '</span>'; i = j; continue;
        }
        if (/[a-zA-Z_]/.test(c)) {
            let j = i; while (j < n && /[a-zA-Z0-9_]/.test(code[j])) j++;
            const word = code.slice(i, j);
            if (PTX_MNEMONICS.has(word)) out += '<span class="tok-ptx">' + escapeHtml(word) + '</span>';
            else out += escapeHtml(word);
            i = j; continue;
        }
        out += escapeHtml(c); i++;
    }
    return out;
}

function highlightBash(code) {
    let out = ''; const lines = code.split('\n');
    for (let li = 0; li < lines.length; li++) {
        const line = lines[li];
        if (/^\s*#/.test(line)) {
            out += '<span class="tok-com">' + escapeHtml(line) + '</span>';
        } else {
            let p = escapeHtml(line);
            p = p.replace(/(\s)(--?[a-zA-Z][a-zA-Z0-9_-]*)/g, '$1<span class="tok-cuda">$2</span>');
            p = p.replace(/&quot;([^&]*)&quot;/g, '<span class="tok-str">"$1"</span>');
            p = p.replace(/\$\{?[A-Z_][A-Z0-9_]*\}?/g, m => '<span class="tok-type">' + m + '</span>');
            out += p;
        }
        if (li < lines.length - 1) out += '\n';
    }
    return out;
}

function renderCodeBlock(el) {
    const lang = (el.getAttribute('data-lang') || 'cpp').toLowerCase();
    const raw = el.textContent;
    let highlighted;
    if (lang === 'ptx') highlighted = highlightPtx(raw);
    else if (lang === 'bash' || lang === 'sh') highlighted = highlightBash(raw);
    else highlighted = highlightCpp(raw);
    const lines = raw.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();
    const lineNums = lines.map((_, i) => '<div>' + (i + 1) + '</div>').join('');
    const title = el.getAttribute('data-title') || '';
    const langLabel = lang === 'cpp' ? 'C++/CUDA' : lang.toUpperCase();
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    wrapper.innerHTML =
        '<div class="code-header"><div class="code-title">' + escapeHtml(title) + '</div>' +
        '<div class="code-actions"><span class="code-lang">' + langLabel + '</span>' +
        '<button class="code-copy" type="button">Copy</button></div></div>' +
        '<div class="code-body"><div class="code-linenums">' + lineNums + '</div>' +
        '<pre class="code-pre">' + highlighted + '</pre></div>';
    el.replaceWith(wrapper);
    const btn = wrapper.querySelector('.code-copy');
    btn.addEventListener('click', () => {
        navigator.clipboard.writeText(raw).then(() => {
            btn.textContent = 'Copied';
            btn.classList.add('copied');
            setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
        });
    });
}

function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    document.getElementById('progress-bar').style.width = pct + '%';
}

function updateActiveSidebar() {
    const chapters = document.querySelectorAll('.chapter, .cover');
    const sections = document.querySelectorAll('.section');
    let activeChapter = null, activeSection = null;
    const scrollY = window.scrollY + 120;
    chapters.forEach(ch => { if (ch.offsetTop <= scrollY) activeChapter = ch.id; });
    sections.forEach(s => { if (s.offsetTop <= scrollY) activeSection = s.id; });
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.sidebar-sublist a').forEach(a => a.classList.remove('active'));
    if (activeChapter) {
        const a = document.querySelector('.sidebar-nav a[href="#' + activeChapter + '"]');
        if (a) a.classList.add('active');
    }
    if (activeSection) {
        const a = document.querySelector('.sidebar-sublist a[href="#' + activeSection + '"]');
        if (a) a.classList.add('active');
    }
}

function initCheckpoints() {
    document.querySelectorAll('.checkpoint li').forEach(li => {
        li.addEventListener('click', () => li.classList.toggle('checked'));
    });
}

document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

const CHART_REGISTRY = {};
function registerChart(id, initFn) { CHART_REGISTRY[id] = initFn; }
function initLazyCharts() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                if (id && CHART_REGISTRY[id] && !entry.target.__initialized) {
                    entry.target.__initialized = true;
                    CHART_REGISTRY[id](entry.target);
                    observer.unobserve(entry.target);
                }
            }
        });
    }, { rootMargin: '100px' });
    Object.keys(CHART_REGISTRY).forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
    });
}

function applyChartDefaults() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.color = '#52545a';
    Chart.defaults.font.family = "'IBM Plex Sans', -apple-system, sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.borderColor = 'rgba(12, 10, 9, 0.08)';
    Chart.defaults.plugins.legend.labels.color = '#111214';
    Chart.defaults.plugins.legend.labels.boxWidth = 14;
    Chart.defaults.plugins.legend.labels.font = { family: "'IBM Plex Sans', sans-serif", size: 12, weight: '500' };
    Chart.defaults.plugins.tooltip.backgroundColor = '#111214';
    Chart.defaults.plugins.tooltip.borderColor = '#111214';
    Chart.defaults.plugins.tooltip.borderWidth = 0;
    Chart.defaults.plugins.tooltip.titleColor = '#f5f5ef';
    Chart.defaults.plugins.tooltip.bodyColor = '#f5f5ef';
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.titleFont = { family: "'IBM Plex Sans', sans-serif", size: 11, weight: '600' };
    Chart.defaults.plugins.tooltip.bodyFont = { family: "'JetBrains Mono', monospace", size: 12 };
    if (Chart.defaults.scale && Chart.defaults.scale.grid) {
        Chart.defaults.scale.grid.color = 'rgba(12, 10, 9, 0.06)';
    }
}

/* ============================================================
   GLOBAL SVG TOOLTIP — any element (or ancestor) inside .figure svg
   with [data-tip] surfaces its text on hover/focus. One tip node
   is reused across all figures; positioning is viewport-clamped so
   tips never spill off the right/bottom edge.
   ============================================================ */
function initSvgTooltips() {
    let tip = document.querySelector('.svg-tip');
    if (!tip) {
        tip = document.createElement('div');
        tip.className = 'svg-tip';
        tip.setAttribute('role', 'tooltip');
        document.body.appendChild(tip);
    }
    const PAD = 14;
    function move(e) {
        let x = e.clientX + PAD;
        let y = e.clientY + PAD;
        const r = tip.getBoundingClientRect();
        if (x + r.width  > window.innerWidth  - 8) x = e.clientX - r.width  - PAD;
        if (y + r.height > window.innerHeight - 8) y = e.clientY - r.height - PAD;
        if (x < 8) x = 8;
        if (y < 8) y = 8;
        tip.style.left = x + 'px';
        tip.style.top  = y + 'px';
    }
    function onOver(e) {
        const target = e.target.closest('[data-tip]');
        if (!target) return;
        const text = target.getAttribute('data-tip');
        if (!text) return;
        // simple markup: **bold** -> <b>bold</b>
        tip.innerHTML = text.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
        tip.classList.add('show');
        move(e);
    }
    function onMove(e) {
        if (!tip.classList.contains('show')) return;
        if (!e.target.closest('[data-tip]')) { tip.classList.remove('show'); return; }
        move(e);
    }
    function onLeave() { tip.classList.remove('show'); }

    document.querySelectorAll('.figure svg, .kg-wrap svg').forEach(svg => {
        svg.addEventListener('mouseover', onOver);
        svg.addEventListener('mousemove', onMove);
        svg.addEventListener('mouseleave', onLeave);
    });
    // Hide tooltip on scroll — avoids stuck tooltips when content moves under cursor
    window.addEventListener('scroll', onLeave, { passive: true });

    // Auto-annotate knowledge-graph nodes from their existing <text> labels
    // so the same tooltip system surfaces the note id + click hint.
    document.querySelectorAll('.kg-wrap svg .kg-node').forEach(node => {
        if (node.hasAttribute('data-tip')) return;
        const texts = node.querySelectorAll('text');
        if (texts.length < 2) return;
        const label = texts[0].textContent.trim();
        const id    = texts[1].textContent.trim();
        node.setAttribute('data-tip', `**${label}** — atomic note ${id}. Find it in the chapter index below.`);
    });
}

window.addEventListener('scroll', () => { updateProgress(); updateActiveSidebar(); }, { passive: true });
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('pre.cb').forEach(renderCodeBlock);
    initCheckpoints();
    applyChartDefaults();
    initLazyCharts();
    initSvgTooltips();
    updateProgress();
    updateActiveSidebar();
});

/* ============================================================
   CHAPTER 1.3 — THREAD HIERARCHY VISUALIZER
   ============================================================ */