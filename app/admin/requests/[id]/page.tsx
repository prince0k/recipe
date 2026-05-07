import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { RequestDetail } from "./RequestDetail";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RequestDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  console.log("Loading RequestDetailPage for ID:", id);

  try {
    const request = await prisma.personalizedRequest.findUnique({
      where: { id },
      include: {
        user: true,
        content: true,
      }
    });

    if (!request) {
      console.log("Request not found for ID:", id);
      notFound();
    }

    return <RequestDetail id={id} request={request} />;
  } catch (error) {
    console.error("Error loading request:", error);
    throw error;
  }
}
