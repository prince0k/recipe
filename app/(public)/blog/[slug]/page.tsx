import { ContentDetailView } from "@/components/content/ContentDetailView";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const content = await prisma.content.findUnique({
    where: { slug: params.slug, type: "BLOG" }
  });

  if (!content || !content.published) notFound();

  return <ContentDetailView content={content} />;
}
