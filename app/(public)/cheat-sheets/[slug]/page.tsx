import { ContentDetailView } from "@/components/content/ContentDetailView";
import { AdBanner } from "@/components/ui/AdBanner";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { AUTHOR_BLOCK, PUBLISHER_BLOCK } from "@/lib/schema/authorBlock";
import { buildImageObject } from "@/lib/schema/buildImageObject";
import { parseFaqs } from "@/lib/schema/parseFaqs";
import { formatPageTitle } from "@/lib/seo";

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

  const titleText = formatPageTitle(content.seoTitle, content.title);

  const description = content.seoDesc || content.excerpt?.slice(0, 155) || 'Free downloadable cheat sheet from NutriGuide.';

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
    keywords: parsedTags,
    alternates: {
      canonical: `https://stewartlucas.com/cheat-sheets/${slug}`,
    },
    openGraph: {
      title: titleText,
      description,
      images: [{ url: cleanCover }],
      type: 'article',
      url: `https://stewartlucas.com/cheat-sheets/${slug}`,
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
  const articleSection = tagsList[0] || "Cooking";

  const builtSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `https://stewartlucas.com/cheat-sheets/${content.slug}#article`,
        "headline": content.title,
        "description": content.excerpt || 'A free science-backed cheat sheet from NutriGuide.',
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
          "@id": `https://stewartlucas.com/cheat-sheets/${content.slug}`
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://stewartlucas.com" },
          { "@type": "ListItem", "position": 2, "name": "Cheat Sheets", "item": "https://stewartlucas.com/cheat-sheets" },
          { "@type": "ListItem", "position": 3, "name": content.title, "item": `https://stewartlucas.com/cheat-sheets/${content.slug}` }
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
      console.warn("Failed to parse cheat sheet schema override:", e);
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
        breadcrumbs={[{ label: "Cheat Sheets", href: "/cheat-sheets" }, { label: content.title }]}
      />
    </>
  );
}
