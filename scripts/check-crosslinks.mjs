// Every post that names its project must be linked back from that project's case page. Run after `astro build`.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = 'dist/client';
const missing = [];
let pairs = 0;

for (const post of readdirSync(join(root, 'writing'), { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const html = readFileSync(join(root, 'writing', post.name, 'index.html'), 'utf8');
  const project = html.match(/Project: <a href="\/projects\/([^"]+)"/)?.[1];
  if (!project) continue;
  pairs++;
  const caseHtml = readFileSync(join(root, 'projects', project, 'index.html'), 'utf8');
  if (!caseHtml.includes(`href="/writing/${post.name}"`)) missing.push(`/projects/${project} does not link /writing/${post.name}`);
}

if (missing.length) {
  console.error(missing.join('\n'));
  process.exit(1);
}
console.log(`checked ${pairs} post-to-project pairs, every case page links back`);
