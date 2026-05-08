import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const contentId = searchParams.get("contentId");
  const approvedOnly = searchParams.get("approvedOnly") === "true";

  const reviews = await prisma.review.findMany({
    where: {
      ...(contentId ? { contentId } : {}),
      ...(approvedOnly ? { isApproved: true } : {}),
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contentId, rating, comment } = await request.json();

  if (!contentId || !rating || !comment) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      userId: session.user.id,
      contentId,
      rating: Number(rating),
      comment,
      isApproved: false, // Default to false, needs admin approval for testimonials
    },
  });

  return NextResponse.json(review);
}
