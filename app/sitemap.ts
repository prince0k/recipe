import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://stewartlucas.com';

  const staticUrls = [
    '',
    '/recipes',
    '/diet-plan',
    '/cheat-sheets',
    '/blog',
    '/login',
    '/signup'
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.9,
  }));

  try {
    const publishedContent = await prisma.content.findMany({
      where: { published: true },
      select: { slug: true, type: true, updatedAt: true }
    });

    const contentUrls = publishedContent.map((c) => {
      let prefix = 'blog';
      if (c.type === 'RECIPE') prefix = 'recipes';
      if (c.type === 'DIET_PLAN') prefix = 'diet-plan';
      if (c.type === 'CHEAT_SHEET') prefix = 'cheat-sheets';

      return {
        url: `${baseUrl}/${prefix}/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      };
    });

    return [...staticUrls, ...contentUrls];
  } catch {
    // DB not reachable at build time — return static URLs only
    return staticUrls;
  }
}

