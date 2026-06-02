import { ContentDetailView } from "@/components/content/ContentDetailView";
import type { Metadata } from "next";
import { AdBanner } from "@/components/ui/AdBanner";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AUTHOR_BLOCK, PUBLISHER_BLOCK } from "@/lib/schema/authorBlock";
import { buildImageObject } from "@/lib/schema/buildImageObject";
import { parseFaqs } from "@/lib/schema/parseFaqs";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const content = await prisma.content.findUnique({
    where: { slug, type: 'DIET_PLAN' },
    select: { title: true, excerpt: true, coverImage: true, seoTitle: true, seoDesc: true }
  });

  if (!content) return { title: 'Diet Plan Not Found' };

  const rawTitle = content.seoTitle || content.title;
  let titleText = rawTitle;
  if (!content.seoTitle && titleText.length + 13 <= 60) {
    titleText = `${titleText} | NutriGuide`;
  }
  if (titleText.length > 60) {
    titleText = titleText.slice(0, 57) + "...";
  }

  const description = content.seoDesc || content.excerpt?.slice(0, 155) || 'Free science-backed diet plan from NutriGuide.';

  const cleanCover = (() => {
    if (!content.coverImage) return 'https://stewartlucas.com/assets/og-image.jpg';
    const path = content.coverImage.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, '');
    if (path.startsWith('http')) return path;
    return `https://stewartlucas.com${path.startsWith('/') ? '' : '/'}${path}`;
  })();

  return {
    metadataBase: new URL('https://stewartlucas.com'),
    title: { absolute: titleText },
    description,
    alternates: {
      canonical: `https://stewartlucas.com/diet-plan/${slug}`,
    },
    openGraph: {
      title: titleText,
      description,
      images: [{ url: cleanCover }],
      type: 'article',
      url: `https://stewartlucas.com/diet-plan/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: titleText,
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

export default async function DietPlanPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const session = await auth();

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

  // Parse FAQs dynamically using shared utility
  const faqs = parseFaqs(content.body || "");
  const imageObject = buildImageObject(content.coverImage);

  const wordCount = content.body ? content.body.replace(/<[^>]*>?/gm, '').split(/\s+/).filter(Boolean).length : 0;
  const tagsList = (() => {
    try {
      return JSON.parse(content.tags || "[]");
    } catch {
      return [];
    }
  })();
  const articleSection = tagsList[0] || "Nutrition";

  const builtSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `https://stewartlucas.com/diet-plan/${content.slug}#article`,
        "headline": content.title,
        "description": content.excerpt || 'A free science-backed diet plan from NutriGuide.',
        "image": imageObject,
        "datePublished": content.createdAt?.toISOString(),
        "dateModified": content.updatedAt?.toISOString(),
        "author": AUTHOR_BLOCK,
        "publisher": PUBLISHER_BLOCK,
        "inLanguage": "en-GB",
        "wordCount": wordCount,
        "articleSection": articleSection,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://stewartlucas.com/diet-plan/${content.slug}`
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://stewartlucas.com" },
          { "@type": "ListItem", "position": 2, "name": "Diet Plans", "item": "https://stewartlucas.com/diet-plan" },
          { "@type": "ListItem", "position": 3, "name": content.title, "item": `https://stewartlucas.com/diet-plan/${content.slug}` }
        ]
      }
    ]
  };

  if (faqs.length > 0) {
    builtSchema["@graph"].push({
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    });
  }

  // Merge any DB-stored schema overrides
  let schemaJson = builtSchema;
  if (content.schema) {
    try {
      const dbSchema = JSON.parse(content.schema);
      if (dbSchema) {
        const postIndex = builtSchema["@graph"].findIndex((item: any) => item["@type"] === "BlogPosting");
        if (postIndex !== -1) {
          const dbPosting = dbSchema["@graph"]
            ? dbSchema["@graph"].find((item: any) => item["@type"] === "BlogPosting")
            : dbSchema;

          builtSchema["@graph"][postIndex] = {
            ...dbPosting,
            ...builtSchema["@graph"][postIndex]
          };
        }
      }
    } catch (e) {
      console.warn("Failed to parse diet plan schema override:", e);
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      <ContentDetailView 
        content={content} 
        relatedItems={relatedItems} 
        isFavorited={isFavorited} 
        adComponent={<AdBanner placement="BLOG_SIDEBAR" />}
        breadcrumbs={[{ label: "Diet Plans", href: "/diet-plan" }, { label: content.title }]}
      />
    </>
  );
}
