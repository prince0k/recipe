import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      content: {
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          excerpt: true,
          coverImage: true,
          tags: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(favorites.map(f => f.content));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contentId } = await request.json();

  if (!contentId) {
    return NextResponse.json({ error: "Content ID is required" }, { status: 400 });
  }

  // Toggle favorite
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_contentId: {
        userId: session.user.id,
        contentId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { id: existing.id },
    });
    return NextResponse.json({ favorited: false });
  } else {
    await prisma.favorite.create({
      data: {
        userId: session.user.id,
        contentId,
      },
    });
    return NextResponse.json({ favorited: true });
  }
}
