import { ContentDetailView } from "@/components/content/ContentDetailView";
import { AdBanner } from "@/components/ui/AdBanner";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const content = await prisma.content.findUnique({
    where: { slug, type: 'CHEAT_SHEET' },
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

  return {
    title,
    description,
    keywords: parsedTags,
    openGraph: {
      title: content.title,
      description,
      images: content.coverImage ? [{ url: content.coverImage }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description,
      images: content.coverImage ? [content.coverImage] : [],
    },
  };
}

export default async function CheatSheetPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const session = await auth();

  const content = await prisma.content.findUnique({
    where: { slug: params.slug, type: "CHEAT_SHEET" }
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
