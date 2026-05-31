import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendDietPlanGuideEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { contentId, email } = await req.json();

    if (!contentId) {
      return NextResponse.json({ error: "Content ID is required" }, { status: 400 });
    }

    let targetEmail: string;
    let userName: string;
    let userId: string | null = null;

    if (session && session.user && session.user.email) {
      targetEmail = session.user.email;
      userName = session.user.name || targetEmail.split("@")[0];
      userId = session.user.id || null;
    } else {
      if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "A valid email address is required to receive the guide." }, { status: 400 });
      }
      targetEmail = email.trim().toLowerCase();
      
      // Look up user or create a guest/subscriber user
      let user = await prisma.user.findUnique({
        where: { email: targetEmail }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: targetEmail,
            name: targetEmail.split("@")[0],
            role: "USER"
          }
        });
      }

      userName = user.name || targetEmail.split("@")[0];
      userId = user.id;
    }

    // Fetch the diet plan content
    const content = await prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      return NextResponse.json({ error: "Diet plan guide not found" }, { status: 404 });
    }

    // Track the download in the db
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await prisma.download.create({
      data: {
        userId,
        contentId,
        ipAddress,
        userAgent,
        isAnon: !session?.user,
        source: "website_download_gate",
      }
    });

    // Build the download link (leads to printable view)
    const SITE_URL = process.env.SITE_URL || process.env.AUTH_URL || "http://localhost:3002";
    const downloadUrl = `${SITE_URL}/diet-plan/${content.slug}/download`;

    // Trigger the email
    const emailResult = await sendDietPlanGuideEmail({
      to: targetEmail,
      name: userName,
      guideTitle: content.title,
      downloadUrl,
    });

    if (!emailResult.success) {
      console.error(`[request-guide] Failed to send guide email to ${targetEmail}:`, emailResult.error);
      return NextResponse.json({ error: "Failed to send guide email. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true, email: targetEmail }, { status: 200 });

  } catch (error: any) {
    console.error("Guide request API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
