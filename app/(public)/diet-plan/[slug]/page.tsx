import { ContentDetailView } from "@/components/content/ContentDetailView";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function DietPlanPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const content = await prisma.content.findUnique({
    where: { slug: params.slug, type: "DIET_PLAN" }
  });

  if (!content || !content.published) notFound();

  const relatedItems = await prisma.content.findMany({
    where: { 
      id: { not: content.id },
      published: true 
    },
    take: 4,
    orderBy: { createdAt: "desc" }
  });

  return <ContentDetailView content={content} relatedItems={relatedItems} />;
}
