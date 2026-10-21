// Checks every internal link and same-page anchor in the built site. Run after `astro build`.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = 'dist/client';
// Paths served by redirects in astro.config.mjs, vercel.json, or the /blog server route.
const redirected = [/^\/books$/, /^\/analytics$/, /^\/tools\/watts-to-tokens/, /^\/projects\/watts-to-tokens$/, /^\/mara-credit-case/, /^\/blog\//];

const htmlFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith('.html') ? [path] : [];
  });

const resolves = (path) =>
  [path, `${path}.html`, join(path, 'index.html')].some((p) => existsSync(join(root, p)) && statSync(join(root, p)).isFile());

const problems = [];
const files = htmlFiles(root);

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, attr, value] of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
    if (value.startsWith('#')) {
      if (value.length > 1 && !ids.has(decodeURIComponent(value.slice(1)))) problems.push(`${relative(root, file)}: missing anchor ${value}`);
      continue;
    }
    if (!value.startsWith('/') || value.startsWith('//')) continue;
    const path = decodeURIComponent(value.split(/[?#]/)[0]);
    if (resolves(path) || redirected.some((r) => r.test(path))) continue;
    problems.push(`${relative(root, file)}: broken ${attr} ${value}`);
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`\n${problems.length} broken internal link(s) across ${files.length} pages`);
  process.exit(1);
}
console.log(`checked ${files.length} pages, no broken internal links or anchors`);
