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
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const { id } = await params;

  const request = await prisma.personalizedRequest.findUnique({
    where: { id },
    include: {
      user: true,
      content: true,
    }
  });

  if (!request) {
    notFound();
  }

  return <RequestDetail id={id} request={request} />;
}
