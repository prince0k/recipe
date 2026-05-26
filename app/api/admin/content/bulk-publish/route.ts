import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Missing or invalid content IDs" }, { status: 400 });
    }

    // Update all matching content items to published: true
    const updateResult = await prisma.content.updateMany({
      where: {
        id: { in: ids }
      },
      data: {
        published: true
      }
    });

    // Bulk revalidate key paths
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/content");
    revalidatePath("/");
    revalidatePath("/recipes");
    revalidatePath("/blog");
    revalidatePath("/cheat-sheets");
    revalidatePath("/diet-plan");

    return NextResponse.json({ 
      success: true, 
      count: updateResult.count 
    });
  } catch (error: any) {
    console.error("Bulk Publish Error:", error);
    return NextResponse.json({ error: "Failed to publish content items in bulk" }, { status: 500 });
  }
}
