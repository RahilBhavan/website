import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { parse, parseFragment, serialize } from 'parse5';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';

const sourceRoot = 'src/textbooks';
const outRoot = 'public/textbooks';
const metadata = JSON.parse(readFileSync('src/data/textbooks.json', 'utf8'));
const markdown = await createMarkdownProcessor({ syntaxHighlight: 'shiki' });
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const textOf = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(textOf).join('');
const walk = (node, visit) => { visit(node); for (const child of node.childNodes || []) walk(child, visit); };
const attr = (node, name) => node.attrs?.find(a => a.name === name)?.value;
const setAttr = (node, name, value) => {
  const existing = node.attrs.find(a => a.name === name);
  if (existing) existing.value = value; else node.attrs.push({ name, value });
};
const concat = (folder, prefix) => readdirSync(folder).filter(f => f.startsWith(prefix)).sort().map(f => readFileSync(join(folder, f), 'utf8')).join('');
mkdirSync(join(outRoot, 'vendor'), { recursive: true });
copyFileSync('node_modules/chart.js/dist/chart.umd.js', join(outRoot, 'vendor/chart.umd.js'));
copyFileSync('node_modules/chart.js/LICENSE.md', join(outRoot, 'vendor/chart-LICENSE.md'));
copyFileSync('node_modules/d3/dist/d3.min.js', join(outRoot, 'vendor/d3.min.js'));
copyFileSync('node_modules/d3/LICENSE', join(outRoot, 'vendor/d3-LICENSE'));
cpSync('node_modules/katex/dist', join(outRoot, 'vendor/katex'), { recursive: true });
copyFileSync('node_modules/katex/LICENSE', join(outRoot, 'vendor/katex/LICENSE'));
const receipts = [];
for (const slug of readdirSync(sourceRoot).sort()) {
  const folder = join(sourceRoot, slug);
  const meta = JSON.parse(readFileSync(join(folder, 'meta.json'), 'utf8'));
  const output = join(outRoot, slug);
  mkdirSync(output, { recursive: true });
  let body = concat(folder, 'content-');
  if (slug === 'ib27') {
    const source = concat(folder, 'chapter-').replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => `<div class="math-source">$$${escape(math)}$$</div>`);
    const { code } = await markdown.render(source);
    body = `<main id="main" class="book-prose">${code.replace(/<h1[^>]*>.*?<\/h1>/, '<h1>Evidence to investment judgment</h1><p>The IB27 Axcelis–Veeco project</p>')}</main>`;
  }
  body = body.replaceAll('src="minhash.html"', `src="/textbooks/${slug}/minhash.html"`);
  if (slug === 'cuda') {
    const peak = `<table class="library-data-table"><caption>Hardware modes use different operation counts<small>Archived textbook specifications for RTX 3090, dense modes. Integer TOPS and floating-point TFLOPS have different units; these are separate rows, not a single common-scale ranking.</small></caption><thead><tr><th>Mode</th><th>Reported peak</th><th>Unit</th></tr></thead><tbody>${[['FP32 CUDA core',35.6,'TFLOPS'],['FP16 CUDA core',71,'TFLOPS'],['TF32 Tensor Core',71,'TFLOPS'],['FP16 Tensor Core',142,'TFLOPS'],['BF16 Tensor Core',142,'TFLOPS'],['INT8 Tensor Core',284,'TOPS']].map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    const kernels = [['K1 Naive',0.5],['K2 Coalesced',3],['K3 SMEM tile 32×32',15],['K4 2D register tile',45],['K5 float4 vectorized',65],['K6 WMMA Tensor Core',100],['K7 mma.sync + ldmatrix',118],['K8 + cp.async pipeline',130]];
    const progress = `<table class="library-data-table"><caption>Archived example: K8 is 104% of the stated cuBLAS reference<small>Values retained from the textbook; not re-run for this reading edition. RTX 3090 · M=N=K=4096 · FP16 with FP32 accumulation. The stated cuBLAS reference is 125 TFLOPS.</small></caption><thead><tr><th>Kernel</th><th>TFLOPS</th><th>Reference</th></tr></thead><tbody>${kernels.map(([name,t])=>`<tr${name.startsWith('K8')?' class="compared"':''}><td>${name}</td><td>${t}</td><td>${(t/125*100).toFixed(1)}%</td></tr>`).join('')}</tbody></table>`;
    body = body.replace(/<canvas[^>]*id="tc-canvas"[^>]*><\/canvas>/, peak).replace(/<canvas[^>]*id="opt-progress-canvas"[^>]*><\/canvas>/, progress);
  }
  const document = parseFragment(body);
  const ids = new Set();
  walk(document, node => { const id = attr(node, 'id'); if (id) ids.add(id); });
  const headings = [];
  walk(document, node => {
    if (!['h1', 'h2'].includes(node.tagName) || node.parentNode?.tagName === 'nav') return;
    const title = textOf(node).trim().replace(/\s+/g, ' ');
    if (!title) return;
    let id = attr(node, 'id');
    if (!id) {
      id = attr(node.parentNode, 'id');
      if (!id) {
        let i = headings.length;
        do { id = `reading-section-${i++}`; } while (ids.has(id));
        setAttr(node, 'id', id); ids.add(id);
      }
    }
    headings.push({ title, id });
  });
  const contents = headings.map(h => `<li><a href="#${escape(h.id)}">${escape(h.title)}</a></li>`).join('');
  const bar = `<header class="library-bar"><a href="/textbooks">← Textbooks</a><strong>${escape(meta.title)}</strong><details class="library-contents"><summary>Contents</summary><nav class="library-menu" aria-label="Textbook sections"><label for="library-chapter-search">Find a section</label><input id="library-chapter-search" type="search" placeholder="Search section titles"><p id="library-chapter-count" role="status">${headings.length} sections</p><ol>${contents}</ol></nav></details><button id="library-print" type="button">Print / PDF</button></header>`;
  const basis = metadata.find(b => b.slug === slug)?.basis || 'A companion study guide with dated sources and illustrative models.';
  const html = `<!doctype html><html lang="en" data-library="${slug}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#111214"><title>${escape(meta.title)} · Rahil Bhavan</title><meta name="description" content="${escape(basis)}"><link rel="canonical" href="https://rahilbhavan.com/textbooks/${slug}"><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/textbooks/${slug}/book.css"><link rel="stylesheet" href="/textbooks/reader.css"><link rel="stylesheet" href="/textbooks/book-compat.css">${meta.extra_head || ''}</head><body>${bar}${serialize(document)}<footer class="library-footnote"><p>${escape(basis)}</p><p>Website reading edition. Educational material; dated project evidence and hypothetical examples keep their original scope.</p><a href="/textbooks">Back to all textbooks</a></footer><script src="/textbooks/${slug}/book.js"></script><script type="module" src="/textbooks/reader.js"></script></body></html>`;
  mkdirSync('.generated/textbooks', { recursive: true });
  writeFileSync(`.generated/textbooks/${slug}.html`, html);
  writeFileSync(join(output, 'book.css'), concat(folder, 'style-'));
  writeFileSync(join(output, 'book.js'), concat(folder, 'script-'));
  if (readdirSync(folder).includes('minhash')) writeFileSync(join(output, 'minhash.html'), concat(join(folder, 'minhash'), 'part-'));
  receipts.push({ slug, sections: headings.length, source_sha256: meta.source_sha256, output_sha256: createHash('sha256').update(html).digest('hex') });
}
writeFileSync('docs/textbook-build.json', JSON.stringify({ design: 'rahil-design@3.3.1', books: receipts }, null, 2) + '\n');
console.log(`Built ${receipts.length} reading editions from preserved source fragments.`);
