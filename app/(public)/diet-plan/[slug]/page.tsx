import { ContentDetailView } from "@/components/content/ContentDetailView";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
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

  return <ContentDetailView content={content} relatedItems={relatedItems} isFavorited={isFavorited} />;
}
