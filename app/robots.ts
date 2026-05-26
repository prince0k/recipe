import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/favorites'],
      },
    ],
    sitemap: 'https://stewartlucas.com/sitemap.xml',
  };
}
