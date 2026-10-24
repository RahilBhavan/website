import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { slug } from '../lib/content';

export const prerender = true;

// Organizations a contact's company might match. A project "mentions" one when its public text names it.
const ORGS = [
  'Coinbase', 'Base', 'Morpho', 'Aave', 'Strategy', 'MicroStrategy', 'BitMine', 'SharpLink', 'MARA', 'OpenEden',
  'Beefy', 'Summer.fi', 'Euler', 'Chainlink', 'Circle', 'USDC', 'x402', 'General Motors', 'GM', 'MLC',
  'SoundExchange', 'DDEX', 'Ondo', 'Centrifuge', 'Flashbots', 'Uniswap', 'Nvidia', 'Michigan', 'MECG', 'Econet',
];

// "Strategy" is also an ordinary word, so it counts only as the company: possessive or next to its tickers.
const PATTERNS: Record<string, RegExp> = { Strategy: /Strategy('s| \(MSTR\)| Inc)|\bMSTR\b|\bSTR[CFKD]\b/ };

const mentions = (text: string) =>
  ORGS.filter((org) =>
    (PATTERNS[org] ?? new RegExp(`(^|[^A-Za-z0-9])${org.replace('.', '\\.')}([^A-Za-z0-9]|$)`)).test(text)
  );

export const GET: APIRoute = async ({ site }) => {
  const base = site!.toString().replace(/\/$/, '');
  const projects = (await getCollection('projects')).sort(
    (a, b) => b.data.completedDate.valueOf() - a.data.completedDate.valueOf() || a.id.localeCompare(b.id)
  );
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf() || a.id.localeCompare(b.id)
  );

  const body = {
    generated: new Date().toISOString(),
    projects: projects.map((p) => ({
      slug: slug(p.id),
      title: p.data.title,
      url: `${base}/projects/${slug(p.id)}`,
      result: p.data.result,
      status: p.data.status,
      kind: p.data.kind ?? null,
      date: p.data.completedDate.toISOString().slice(0, 10),
      demo: p.data.demoUrl ?? null,
      code: p.data.githubUrl ?? null,
      mentions: mentions([p.data.title, p.data.description, p.data.problem, p.data.solution, p.data.result, p.body].join(' ')),
    })),
    writing: posts.map((p) => ({
      title: p.data.title,
      url: `${base}/writing/${slug(p.id)}`,
      description: p.data.description,
      date: p.data.publishDate.toISOString().slice(0, 10),
      project: p.data.project?.id ? slug(p.data.project.id) : null,
    })),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
