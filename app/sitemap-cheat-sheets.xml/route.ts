import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = 'https://stewartlucas.com';
  
  try {
    const publishedContent = await prisma.content.findMany({
      where: { published: true, type: 'CHEAT_SHEET' },
      select: { slug: true, updatedAt: true }
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${publishedContent
    .map(
      (c) => `
  <url>
    <loc>${baseUrl}/cheat-sheets/${c.slug}</loc>
    <lastmod>${c.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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
  } catch (error) {
    console.error('Error generating cheat sheets sitemap:', error);
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
