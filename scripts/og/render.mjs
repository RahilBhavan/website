// Renders 1280x640 social cards into public/og/ for the home page, the crypto finance hub,
// every project without its own ogImage, and every published post. Run: node scripts/og/render.mjs
import { readFileSync, readdirSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { firefox } from 'playwright';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import yaml from 'js-yaml';

const fonts = resolve('public/fonts');
const outDir = resolve('public/og');
const fontData = (name) => readFileSync(join(fonts, name)).toString('base64');
const archivo = fontData('Archivo-VF.woff2');
const plexMono = fontData('IBMPlexMono-Regular.woff2');
const statusLabel = { proposal: 'Proposal', prototype: 'Prototype', shipped: 'Shipped' };

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// The highlighter goes only on words the frontmatter names as the finding; it is never guessed.
const marked = (title, highlight) => {
  const at = highlight ? title.indexOf(highlight) : -1;
  if (highlight && at < 0) throw new Error(`highlight "${highlight}" is not in the title "${title}"`);
  const html = (s) => escape(s).replace(/\n/g, '<br />');
  return at < 0 ? html(title) : html(title.slice(0, at)) + `<mark>${html(highlight)}</mark>` + html(title.slice(at + highlight.length));
};

// rahil-design 4.0 (Rahil Bhavan Research): charcoal, warm white, one yellow, Archivo for text and Plex Mono for figures.
// Compact cards are read at feed size (a 326px box, about a quarter of 1280px), so they drop the masthead and keep
// every line at 72px or more: the 18px label floor once displayed.
const card = ({ tag, title, highlight, body, footer, compact = false }) => `<!doctype html>
<html><head><meta charset="utf-8" /><style>
  @font-face { font-family: Archivo; src: url('data:font/woff2;base64,${archivo}'); font-weight: 400 900; }
  @font-face { font-family: Archivo; src: url('data:font/woff2;base64,${plexMono}'); unicode-range: U+2197, U+2713; }
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1280px; height: 640px; overflow: hidden; }
  body { position: relative; padding: 50px 72px 44px; background: #111214; color: #f5f5ef; font-family: Archivo, sans-serif;
         font-variant-numeric: tabular-nums lining-nums; display: flex; flex-direction: column; gap: 24px; }
  body::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 10px; background: #ffe500; }
  .mast { display: flex; justify-content: space-between; font-size: 22px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
  .mast i { display: inline-block; width: 16px; height: 16px; background: #ffe500; margin-right: 14px; vertical-align: -1px; }
  .mast .tag { color: #b7b8b1; font-weight: 600; letter-spacing: .1em; }
  .mast span:last-child { color: #b7b8b1; font-weight: 400; letter-spacing: .03em; text-transform: none; }
  h1 { font-weight: 750; line-height: 1.1; letter-spacing: -.012em; margin-top: 12px; text-wrap: balance;
       font-size: ${title.length > 60 ? 72 : title.length > 40 ? 84 : 104}px; max-width: 1136px; }
  mark { background: #ffe500; color: #111214; padding: 0 .12em; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
  p { font-size: 30px; line-height: 1.4; max-width: 58ch; color: #b7b8b1; }
  footer { margin-top: auto; border-top: 1px solid #424348; padding-top: 18px; font-size: 24px; color: #b7b8b1; }
${compact ? `
  body { padding: 50px 40px 32px; gap: 20px; }
  .mast { display: none; }
  h1 { font-size: 160px; font-weight: 850; line-height: 1.02; letter-spacing: -.03em; color: #ffe500; margin-top: 0; max-width: none; }
  p { font-size: 72px; line-height: 1.15; color: #f5f5ef; max-width: none; }
  footer { font-size: 72px; line-height: 1.1; padding-top: 12px; }
` : ''}
</style></head><body>
  <div class="mast"><span><i></i>Rahil Bhavan Research${tag ? `<span class="tag"> · ${escape(tag)}</span>` : ''}</span><span>rahilbhavan.com</span></div>
  <h1>${marked(title, highlight)}</h1>
  ${body ? `<p>${escape(body)}</p>` : ''}
  <footer>${escape(footer)}</footer>
</body></html>`;

const entries = (dir) =>
  readdirSync(dir)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => ({
      slug: f.replace(/\.mdx?$/, ''),
      data: yaml.load(readFileSync(join(dir, f), 'utf8').match(/^---\n([\s\S]*?)\n---/)[1]),
    }));

const projects = entries('src/content/projects');
const posts = entries('src/content/blog').filter((p) => !p.data.draft);
const longDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

const cards = [
  {
    file: 'home.png',
    title: 'A student trynna learn',
    highlight: 'A student trynna learn',
    body: 'Computer engineering and economics at Michigan. Crypto lending risk models, credit and payments cases, AI infrastructure math and hardware, each with how it was checked.',
    footer: 'Projects and writing',
  },
  {
    file: 'crypto-finance.png',
    tag: 'Case studies',
    title: 'Crypto finance case studies',
    body: 'Four independent projects on crypto lending, payments and revenue, built from public data and synthetic simulations.',
    footer: 'Not affiliated with Coinbase, MARA or Morpho',
  },
  ...projects
    .filter((p) => !p.data.ogImage)
    .map((p) => ({
      file: `${p.slug}.png`,
      tag: p.data.kind ?? 'Project',
      title: p.data.title,
      highlight: p.data.highlight,
      body: p.data.result,
      footer: `${statusLabel[p.data.status]} · ${new Date(p.data.completedDate).getFullYear()}`,
    })),
  ...posts.map((p) => ({
    file: `writing/${p.slug}.png`,
    tag: 'Writing',
    title: p.data.title,
    highlight: p.data.highlight,
    body: p.data.description,
    footer: longDate(p.data.publishDate),
  })),
];

const projectEvidence = JSON.parse(readFileSync('src/data/project-evidence.json', 'utf8'));
for (const entry of cards) {
  const summary = projectEvidence.find((item) => `${item.id}.png` === entry.file);
  if (summary) Object.assign(entry, { title: summary.shareTitle, highlight: undefined, body: summary.shareBody, footer: 'rahilbhavan.com', compact: true });
}

const requestedCards = new Set(process.argv.slice(2).map((slug) => `${slug}.png`));
const selectedCards = requestedCards.size ? cards.filter((entry) => requestedCards.has(entry.file)) : cards;
mkdirSync(join(outDir, 'writing'), { recursive: true });
const work = mkdtempSync(join(process.env.XDG_CACHE_HOME ?? join(process.env.HOME ?? tmpdir(), '.cache'), 'og-'));
const browser = await firefox.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 640 } });
try {
  for (const c of selectedCards) {
    const html = join(work, c.file.replace(/\//g, '-').replace(/\.png$/, '.html'));
    writeFileSync(html, card(c));
    mkdirSync('.generated/og-review', { recursive: true });
    writeFileSync(join('.generated/og-review', c.file.replaceAll('/', '-').replace(/\.png$/, '.html')), card(c));
    await page.goto(`file://${html}`);
    await page.evaluate(() => document.fonts.ready);
    const fits = await page.evaluate(() => {
      const last = document.querySelector('p') ?? document.querySelector('h1');
      const footer = document.querySelector('footer');
      const h1 = document.querySelector('h1');
      return last.getBoundingClientRect().bottom + 20 <= footer.getBoundingClientRect().top
        && footer.getBoundingClientRect().bottom <= 640 && h1.scrollWidth <= h1.clientWidth;
    });
    if (!fits) throw new Error(`Social card content overflows: ${c.file}`);
    await page.screenshot({ path: join(outDir, c.file) });
    console.log(`public/og/${c.file}`);
  }
} finally {
  await browser.close();
  rmSync(work, { recursive: true, force: true });
}
