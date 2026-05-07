import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    
    const content = await prisma.content.create({
      data: {
        title: data.title,
        slug: data.slug,
        type: data.type,
        excerpt: data.excerpt,
        body: data.body,
        tags: JSON.stringify(data.tags || []),
        painPointQuestions: JSON.stringify(data.painPointQuestions || []),
        coverImage: data.coverImage || null,
        coverVideo: data.coverVideo || null,
        coverImagePrompt: data.coverImagePrompt || null,
        seoTitle: data.seoTitle || null,
        seoDesc: data.seoDesc || null,
        published: data.published,
      }
    });

    return NextResponse.json({ success: true, id: content.id }, { status: 201 });
  } catch (error: any) {
    console.error("Create content error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
