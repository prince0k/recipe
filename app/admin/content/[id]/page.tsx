import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ContentEditForm } from "./ContentEditForm";

export const dynamic = "force-dynamic";

export default async function EditContentPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  console.log("Loading EditContentPage for ID:", id);

  try {
    const content = await prisma.content.findUnique({
      where: { id }
    });

    if (!content) {
      console.log("Content not found for ID:", id);
      notFound();
    }

    return <ContentEditForm id={id} initialData={content} />;
  } catch (error) {
    console.error("Error loading content:", error);
    throw error;
  }
}
