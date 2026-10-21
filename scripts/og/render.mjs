// Renders 1280x640 social cards into public/og/ for the home page, the crypto finance hub,
// and every project without its own ogImage. Run: node scripts/og/render.mjs
import { readFileSync, readdirSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import yaml from 'js-yaml';

const chromium = process.env.CHROMIUM ?? 'chromium';
const fonts = resolve('public/fonts');
const outDir = resolve('public/og');
const statusLabel = { proposal: 'Proposal', prototype: 'Prototype', shipped: 'Shipped' };

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const card = ({ kicker, title, body, footer }) => `<!doctype html>
<html><head><meta charset="utf-8" /><style>
  @font-face { font-family: Anton; src: url('file://${fonts}/Anton-Regular.woff2'); }
  @font-face { font-family: Plex; src: url('file://${fonts}/IBMPlexSans-Regular.woff2'); font-weight: 400; }
  @font-face { font-family: Plex; src: url('file://${fonts}/IBMPlexSans-SemiBold.woff2'); font-weight: 600; }
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1280px; height: 640px; overflow: hidden; }
  body { padding: 64px 72px; background: #111214; color: #f5f5ef; font-family: Plex, sans-serif;
         display: flex; flex-direction: column; gap: 28px; }
  .kicker { font-size: 26px; font-weight: 600; color: #b7b8b1; }
  .kicker b { color: #ffe500; font-weight: 600; }
  h1 { font-family: Anton, sans-serif; font-weight: 400; text-transform: uppercase; line-height: 1.02;
       font-size: ${title.length > 48 ? 70 : title.length > 30 ? 84 : 112}px; max-width: 22ch; }
  p { font-size: 30px; line-height: 1.4; max-width: 58ch; }
  footer { margin-top: auto; display: flex; justify-content: space-between; font-size: 24px; color: #b7b8b1; }
  footer span:first-child { border-left: 4px solid #ffe500; padding-left: 14px; }
</style></head><body>
  <div class="kicker">${kicker}</div>
  <h1>${escape(title)}</h1>
  ${body ? `<p>${escape(body)}</p>` : ''}
  <footer><span>${escape(footer)}</span><span>rahilbhavan.com</span></footer>
</body></html>`;

const projects = readdirSync('src/content/projects')
  .filter((f) => f.endsWith('.md'))
  .map((f) => ({
    slug: f.replace(/\.md$/, ''),
    data: yaml.load(readFileSync(join('src/content/projects', f), 'utf8').match(/^---\n([\s\S]*?)\n---/)[1]),
  }));

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
];

mkdirSync(outDir, { recursive: true });
const work = mkdtempSync(join(process.env.XDG_CACHE_HOME ?? join(process.env.HOME ?? tmpdir(), '.cache'), 'og-'));
try {
  for (const c of cards) {
    const html = join(work, c.file.replace(/\.png$/, '.html'));
    writeFileSync(html, card(c));
    execFileSync(chromium, [
      '--headless', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
      '--window-size=1280,640', '--allow-file-access-from-files', '--virtual-time-budget=2000',
      `--screenshot=${join(outDir, c.file)}`, `file://${html}`,
    ], { stdio: 'pipe' });
    console.log(`public/og/${c.file}`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
