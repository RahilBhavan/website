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
const anton = fontData('Anton-Regular.woff2');
const plex = fontData('IBMPlexSans-Regular.woff2');
const plexSemiBold = fontData('IBMPlexSans-SemiBold.woff2');
const statusLabel = { proposal: 'Proposal', prototype: 'Prototype', shipped: 'Shipped' };

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const card = ({ kicker, title, body, footer, compact = false }) => `<!doctype html>
<html><head><meta charset="utf-8" /><style>
  @font-face { font-family: Anton; src: url('data:font/woff2;base64,${anton}'); }
  @font-face { font-family: 'IBM Plex Sans'; src: url('data:font/woff2;base64,${plex}'); font-weight: 400; }
  @font-face { font-family: 'IBM Plex Sans'; src: url('data:font/woff2;base64,${plexSemiBold}'); font-weight: 600; }
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1280px; height: 640px; overflow: hidden; }
  body { padding: 64px 72px; background: #111214; color: #f5f5ef; font-family: 'IBM Plex Sans', sans-serif;
         display: flex; flex-direction: column; gap: 28px; }
  .kicker { font-size: 26px; font-weight: 600; color: #b7b8b1; }
  .kicker b { color: #ffe500; font-weight: 600; }
  h1 { font-family: Anton, sans-serif; font-weight: 400; text-transform: uppercase; line-height: 1.02;
       font-size: ${title.length > 48 ? 70 : title.length > 30 ? 84 : 112}px; max-width: 22ch; }
  p { font-size: 30px; line-height: 1.4; max-width: 58ch; }
  footer { margin-top: auto; display: flex; justify-content: space-between; font-size: 24px; color: #b7b8b1; }
  footer span:first-child { border-left: 4px solid #ffe500; padding-left: 14px; }
${compact ? `
  body { padding: 32px; gap: 16px; }
  .kicker, footer span:first-child { display: none; }
  h1 { font-size: 160px; line-height: 1.06; max-width: none; }
  p { font-size: 72px; line-height: 1.2; max-width: none; }
  footer { font-size: 72px; line-height: 1.2; }
` : ''}
</style></head><body>
  <div class="kicker">${kicker}</div>
  <h1>${escape(title).replace(/\n/g, '<br />')}</h1>
  ${body ? `<p>${escape(body)}</p>` : ''}
  <footer><span>${escape(footer)}</span><span>rahilbhavan.com</span></footer>
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
    kicker: '<b>Rahil Bhavan</b>',
    title: 'A student trynna learn',
    body: 'Computer engineering and economics at Michigan. Crypto lending risk models, credit and payments cases, AI infrastructure math and hardware, each with how it was checked.',
    footer: 'Projects and writing',
  },
  {
    file: 'crypto-finance.png',
    kicker: '<b>Rahil Bhavan</b> · Case studies',
    title: 'Crypto finance case studies',
    body: 'Four independent projects on crypto lending, payments and revenue, built from public data and synthetic simulations.',
    footer: 'Not affiliated with Coinbase, MARA or Morpho',
  },
  ...projects
    .filter((p) => !p.data.ogImage)
    .map((p) => ({
      file: `${p.slug}.png`,
      kicker: `<b>Rahil Bhavan</b> · ${escape(p.data.kind ?? 'Project')}`,
      title: p.data.title,
      body: p.data.result,
      footer: `${statusLabel[p.data.status]} · ${new Date(p.data.completedDate).getFullYear()}`,
    })),
  ...posts.map((p) => ({
    file: `writing/${p.slug}.png`,
    kicker: '<b>Rahil Bhavan</b> · Writing',
    title: p.data.title,
    body: p.data.description,
    footer: longDate(p.data.publishDate),
  })),
];

const projectEvidence = JSON.parse(readFileSync('src/data/project-evidence.json', 'utf8'));
for (const entry of cards) {
  const summary = projectEvidence.find((item) => `${item.id}.png` === entry.file);
  if (summary) Object.assign(entry, { title: summary.shareTitle, body: summary.shareBody, compact: true });
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
      const body = document.querySelector('p');
      const footer = document.querySelector('footer');
      return (!body || body.getBoundingClientRect().bottom + 20 <= footer.getBoundingClientRect().top)
        && footer.getBoundingClientRect().bottom <= 640;
    });
    if (!fits) throw new Error(`Social card content overflows: ${c.file}`);
    await page.screenshot({ path: join(outDir, c.file) });
    console.log(`public/og/${c.file}`);
  }
} finally {
  await browser.close();
  rmSync(work, { recursive: true, force: true });
}
