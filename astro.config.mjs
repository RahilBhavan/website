import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://rahilbhavan.com',
  output: 'server',
  trailingSlash: 'never',
  adapter: vercel(),
  redirects: {
    '/books': '/',
    '/analytics': '/',
    '/tools/watts-to-tokens': '/tools/datacenter-math',
    '/projects/watts-to-tokens': '/projects/datacenter-math',
  },
  integrations: [mdx(), sitemap()],
});
