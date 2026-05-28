import { ContentDetailView } from "@/components/content/ContentDetailView";
import { AdBanner } from "@/components/ui/AdBanner";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  const content = await prisma.content.findUnique({
    where: { slug: decodedSlug, type: 'CHEAT_SHEET' },
    select: { title: true, excerpt: true, coverImage: true, tags: true, seoTitle: true, seoDesc: true }
  });

  if (!content) return { title: 'Cheat Sheet Not Found' };

  const parsedTags = (() => {
    try {
      return JSON.parse(content.tags || "[]");
    } catch {
      return [];
    }
  })();

  const title = content.seoTitle || `${content.title} | Cheat Sheets by Stewart Lucas`;
  const description = content.seoDesc || content.excerpt?.slice(0, 155) || 'Free downloadable cheat sheet from NutriGuide.';

  const cleanCover = (() => {
    if (!content.coverImage) return 'https://stewartlucas.com/assets/og-image.jpg';
    const path = content.coverImage.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, '');
    if (path.startsWith('http')) return path;
    return `https://stewartlucas.com${path.startsWith('/') ? '' : '/'}${path}`;
  })();

  return {
    metadataBase: new URL('https://stewartlucas.com'),
    title,
    description,
    keywords: parsedTags,
    alternates: {
      canonical: `https://stewartlucas.com/cheat-sheets/${decodedSlug}`,
    },
    openGraph: {
      title: content.title,
      description,
      images: [{ url: cleanCover }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description,
      images: [cleanCover],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export default async function CheatSheetPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const decodedSlug = decodeURIComponent(params.slug).toLowerCase();
  const session = await auth();

  const content = await prisma.content.findUnique({
    where: { slug: decodedSlug, type: "CHEAT_SHEET" }
  });

  if (!content || !content.published) notFound();

  // Check if favorited
  let isFavorited = false;
  if (session?.user?.id) {
    const fav = await prisma.favorite.findUnique({
      where: {
        userId_contentId: {
          userId: session.user.id,
          contentId: content.id,
        }
      }
    });
    isFavorited = !!fav;
  }

  const relatedItems = await prisma.content.findMany({
    where: { 
      id: { not: content.id },
      published: true 
    },
    take: 4,
    orderBy: { createdAt: "desc" }
  });

  return (
    <ContentDetailView 
      content={content} 
      relatedItems={relatedItems} 
      isFavorited={isFavorited} 
      adComponent={<AdBanner placement="BLOG_SIDEBAR" />}
    />
  );
}
