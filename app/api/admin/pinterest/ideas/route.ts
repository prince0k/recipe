import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: Fetch pending Pinterest ideas
export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ideas = await prisma.pinterestIdea.findMany({
      where: {
        status: "PENDING"
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(ideas);
  } catch (error: any) {
    console.error("Fetch pending ideas error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Approve or Reject a Pinterest idea
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ideaId, action } = await req.json();

    if (!ideaId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const idea = await prisma.pinterestIdea.findUnique({
      where: { id: ideaId }
    });

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    const status = action === "approve" ? "APPROVED" : "REJECTED";
    
    await prisma.pinterestIdea.update({
      where: { id: ideaId },
      data: { status }
    });

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    console.error("Approve/Reject idea error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
