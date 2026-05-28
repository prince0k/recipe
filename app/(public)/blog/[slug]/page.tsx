import { ContentDetailView } from "@/components/content/ContentDetailView";
import type { Metadata } from "next";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const content = await prisma.content.findUnique({
    where: { slug, type: 'BLOG' },
    select: { title: true, excerpt: true, coverImage: true, seoTitle: true, seoDesc: true }
  });

  if (!content) return { title: 'Article Not Found' };

  const title = content.seoTitle || `${content.title} | Kitchen Stories by Stewart Lucas`;
  const description = content.seoDesc || content.excerpt?.slice(0, 155) || 'Read this article from Stewart Lucas.';

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
    alternates: {
      canonical: `/blog/${slug}`,
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
  };
}
import { AdBanner } from "@/components/ui/AdBanner";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const session = await auth();

  const content = await prisma.content.findUnique({
    where: { slug: params.slug, type: "BLOG" }
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

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <ContentDetailView 
        content={content} 
        relatedItems={relatedItems} 
        isFavorited={isFavorited} 
        adComponent={<AdBanner placement="BLOG_SIDEBAR" />}
      />
    </>
  );
}
