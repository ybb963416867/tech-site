import type { APIContext } from 'astro';

export function GET(context: APIContext) {
  const site = context.site?.toString().replace(/\/$/, '') || 'https://example.com';

  return new Response(`User-agent: *
Allow: /

Sitemap: ${site}/sitemap-index.xml
`);
}
