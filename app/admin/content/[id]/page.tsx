import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ContentEditForm } from "./ContentEditForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditContentPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const { id } = await params;

  const content = await prisma.content.findUnique({
    where: { id }
  });

  if (!content) {
    notFound();
  }

  return <ContentEditForm id={id} initialData={content} />;
}
