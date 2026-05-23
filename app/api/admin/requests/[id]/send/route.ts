import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { revalidatePath } from "next/cache";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // 1. Fetch the request with user info
    const personalisedRequest = await prisma.personalizedRequest.findUnique({
      where: { id },
      include: {
        user: true,
      }
    });

    if (!personalisedRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const SITE_URL = process.env.SITE_URL || process.env.AUTH_URL || "https://stewartlucas.com";
    const viewUrl = `${SITE_URL}/personalized/${id}`;

    // 2. Trigger the email
    const { sendPersonalisedPlanReadyEmail } = await import("@/lib/email");
    await sendPersonalisedPlanReadyEmail({
      to: personalisedRequest.user.email,
      name: personalisedRequest.user.name || "Friend",
      viewUrl,
    });

    // 3. Mark as SENT
    await prisma.personalizedRequest.update({
      where: { id },
      data: { status: "SENT" }
    });

    revalidatePath("/admin/requests");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

