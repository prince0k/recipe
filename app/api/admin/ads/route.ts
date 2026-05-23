import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ads = await prisma.ad.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(ads);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, imageUrl, targetUrl, adCode, placement, active } = await request.json();

    if (!title || !placement) {
      return NextResponse.json({ error: "Title and Placement are required" }, { status: 400 });
    }

    const ad = await prisma.ad.create({
      data: {
        title,
        imageUrl: imageUrl || null,
        targetUrl: targetUrl || null,
        adCode: adCode || null,
        placement,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json(ad);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, title, imageUrl, targetUrl, adCode, placement, active } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Build update payload dynamically
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
    if (targetUrl !== undefined) updateData.targetUrl = targetUrl || null;
    if (adCode !== undefined) updateData.adCode = adCode || null;
    if (placement !== undefined) updateData.placement = placement;
    if (active !== undefined) updateData.active = active;

    const ad = await prisma.ad.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(ad);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.ad.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
