import type { CollectionEntry } from 'astro:content';

export const slug = (id: string) => id.replace(/\.(md|mdx)$/, '');

export const monthYear = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

export const statusLabel = {
  proposal: 'Proposal',
  prototype: 'Prototype',
  shipped: 'Shipped',
} as const;

export const trackLabel = {
  crypto: 'Crypto finance',
  ai: 'AI engineering',
  product: 'Product',
  hardware: 'Hardware',
} as const;

export type Track = keyof typeof trackLabel;

export const demoLabel = (url: string) => (/youtube\.com|youtu\.be/.test(url) ? 'Watch the video' : 'Open the live site');

type Post = CollectionEntry<'blog'>;

export type WritingEntry = {
  title: string;
  href: string;
  description: string;
  date: Date;
  parts: { title: string; href: string }[];
  track?: Track;
};

// A series shows once, at the date of its newest part, so a list never opens on "Part 3/3".
export function groupWriting(posts: Post[], trackOf: (post: Post) => Track | undefined = () => undefined): WritingEntry[] {
  const series = new Map<string, Post[]>();
  const entries: WritingEntry[] = [];

  for (const post of posts) {
    const name = post.data.series?.name;
    if (!name) {
      entries.push({
        title: post.data.title,
        href: `/writing/${slug(post.id)}`,
        description: post.data.description,
        date: post.data.publishDate,
        parts: [],
        track: trackOf(post),
      });
      continue;
    }
    series.set(name, [...(series.get(name) ?? []), post]);
  }

  for (const [name, members] of series) {
    const ordered = members.sort((a, b) => a.data.series!.part - b.data.series!.part);
    entries.push({
      title: name,
      href: `/writing/${slug(ordered[0].id)}`,
      description: `A ${ordered.length}-part series. ${ordered[0].data.description.replace(/^Part 1 of [^:]*:\s*/, '')}`,
      date: new Date(Math.max(...ordered.map((p) => p.data.publishDate.valueOf()))),
      parts: ordered.map((p) => ({ title: p.data.title, href: `/writing/${slug(p.id)}` })),
      track: trackOf(ordered[0]),
    });
  }

  return entries.sort((a, b) => b.date.valueOf() - a.date.valueOf() || a.href.localeCompare(b.href));
}

/** Split a title into [before, highlighted, after]. The highlighter goes on the first figure-like token
 * ($5.0M, 27%, 10-K, 2x) with its unit; otherwise on the last two words. The text itself is unchanged. */
export function splitTitle(title: string): [string, string, string] {
  const figure = title.match(/[$€]?\d[\d,.]*\s?(?:%|[a-zA-Z]{1,2}\b)?(?:\s(?:months?|years?|days?|minutes?|blocks?|tests?|ms|MWh))?/);
  if (figure && figure.index !== undefined) {
    const end = figure.index + figure[0].length;
    return [title.slice(0, figure.index), figure[0], title.slice(end)];
  }
  const words = title.split(' ');
  if (words.length < 4) return ['', title, ''];
  const cut = words.length - 2;
  return [words.slice(0, cut).join(' ') + ' ', words.slice(cut).join(' '), ''];
}
