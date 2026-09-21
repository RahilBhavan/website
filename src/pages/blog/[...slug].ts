import type { APIRoute } from 'astro';

// Old post URLs (indexed with and without a trailing slash) moved to /writing.
export const GET: APIRoute = ({ params, redirect }) => {
  const slug = (params.slug ?? '').replace(/\/+$/, '');
  return redirect(slug ? `/writing/${slug}` : '/writing', 301);
};
