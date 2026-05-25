import { ContentDetailView } from "@/components/content/ContentDetailView";
import type { Metadata } from "next";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const content = await prisma.content.findUnique({
    where: { slug, type: 'DIET_PLAN' },
    select: { title: true, excerpt: true, coverImage: true, seoTitle: true, seoDesc: true }
  });

  if (!content) return { title: 'Diet Plan Not Found' };

  const title = content.seoTitle || `${content.title} | Free Diet Plans by Stewart Lucas`;
  const description = content.seoDesc || content.excerpt?.slice(0, 155) || 'Free science-backed diet plan from NutriGuide.';

  return {
    title,
    description,
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
import { AdBanner } from "@/components/ui/AdBanner";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DietPlanPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session || !session.user) {
    redirect(`/login?callbackUrl=/diet-plan/${params.slug}`);
  }

  const content = await prisma.content.findUnique({
    where: { slug: params.slug, type: "DIET_PLAN" }
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
