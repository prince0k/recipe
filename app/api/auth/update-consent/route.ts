import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { consent } = await req.json();

    await prisma.user.update({
      where: { id: session.user.id },
      data: { marketingConsent: !!consent },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update consent error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
