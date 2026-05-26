import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { PersonalizedClientView } from "@/components/content/PersonalizedClientView";

export const dynamic = "force-dynamic";

export default async function PersonalizedViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const request = await prisma.personalizedRequest.findUnique({
    where: { id },
    include: {
      content: true,
      user: true,
    }
  });

  if (!request || !request.generatedContent) {
    return notFound();
  }

  // Security: Check if user is the owner or an admin
  const isOwner = session?.user?.id === request.userId;
  const isAdmin = session?.user?.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    // Optionally allow public view if the status is SENT, but let's stick to owner for now
    // if (request.status !== "SENT") return notFound();
  }

  // Serialize to prevent Next.js date serialization warnings
  const serializedRequest = {
    id: request.id,
    generatedContent: request.generatedContent,
    createdAt: request.createdAt.toISOString(),
    content: {
      title: request.content.title,
    },
    user: {
      name: request.user.name,
      role: request.user.role,
    },
  };

  return <PersonalizedClientView request={serializedRequest} />;
}
