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
import { AdBanner } from "@/components/ui/AdBanner";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";

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

  // Parse FAQs dynamically from content body
  const faqs: { question: string; answer: string }[] = [];
  const htmlStr = content.body || "";
  const detailsRegex = /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*([\s\S]*?)<\/details>/gi;
  let match;
  while ((match = detailsRegex.exec(htmlStr)) !== null) {
    const question = match[1].replace(/<[^>]*>?/gm, '').trim();
    const answer = match[2].replace(/<[^>]*>?/gm, '').trim();
    if (question && answer) {
      faqs.push({ question, answer });
    }
  }
  if (faqs.length === 0) {
    const qRegex = /<(h3|h4)[^>]*>([^<]*?\?[^<]*?)<\/\1>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
    let qMatch;
    while ((qMatch = qRegex.exec(htmlStr)) !== null) {
      const question = qMatch[2].replace(/<[^>]*>?/gm, '').trim();
      const answer = qMatch[3].replace(/<[^>]*>?/gm, '').trim();
      if (question && answer) {
        faqs.push({ question, answer });
      }
    }
  }

  const cleanCover = content.coverImage
    ? (content.coverImage.startsWith('http') ? content.coverImage : `https://stewartlucas.com${content.coverImage.startsWith('/') ? '' : '/'}${content.coverImage}`)
    : 'https://stewartlucas.com/assets/og-image.jpg';

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": content.title,
    "description": content.excerpt || 'A free science-backed diet plan from NutriGuide.',
    "image": [cleanCover],
    "datePublished": content.createdAt?.toISOString(),
    "dateModified": content.updatedAt?.toISOString(),
    "author": {
      "@type": "Person",
      "name": "Stewart Lucas",
      "url": "https://stewartlucas.com/about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "NutriGuide by Stewart Lucas",
      "logo": {
        "@type": "ImageObject",
        "url": "https://stewartlucas.com/assets/og-image.jpg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://stewartlucas.com/diet-plan/${params.slug}`
    }
  };

  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  const schemas: any[] = [
    articleSchema,
    ...(faqSchema ? [faqSchema] : [])
  ];

  if (content.schema) {
    try {
      const dbSchema = JSON.parse(content.schema);
      if (dbSchema) {
        if (Array.isArray(dbSchema)) {
          schemas.push(...dbSchema);
        } else {
          schemas.push(dbSchema);
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <ContentDetailView 
        content={content} 
        relatedItems={relatedItems} 
        isFavorited={isFavorited} 
        adComponent={<AdBanner placement="BLOG_SIDEBAR" />}
      />
    </>
  );
}
