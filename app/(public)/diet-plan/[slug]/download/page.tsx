import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { DietPlanPrintClient } from "@/components/content/DietPlanPrintClient";
import type { Metadata } from "next";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const content = await prisma.content.findUnique({
    where: { slug, type: 'DIET_PLAN' },
    select: { title: true }
  });

  if (!content) return { title: 'Download Diet Plan Not Found' };

  return {
    title: `Download: ${content.title} | NutriGuide`,
    description: `Print or save the complete PDF version of ${content.title}.`,
    robots: {
      index: false,
      follow: false,
    }
  };
}

export default async function DietPlanDownloadPage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;

  const content = await prisma.content.findUnique({
    where: { slug, type: "DIET_PLAN" }
  });

  if (!content || !content.published) {
    notFound();
  }

  // Format data for the print client
  const serializedContent = {
    title: content.title,
    excerpt: content.excerpt,
    body: content.body || "",
    coverImage: content.coverImage,
  };

  const backUrl = `/diet-plan/${slug}`;

  return <DietPlanPrintClient content={serializedContent} backUrl={backUrl} />;
}
