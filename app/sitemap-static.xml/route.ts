import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = 'https://stewartlucas.com';
  const staticUrls = [
    '',
    '/recipes',
    '/diet-plan',
    '/cheat-sheets',
    '/blog',
    '/about',
    '/contact',
    '/privacy-policy'
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticUrls
    .map(
      (route) => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${route === '' ? '1.0' : '0.9'}</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return new NextResponse(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
