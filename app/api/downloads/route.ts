import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { contentId } = await req.json();

    if (!contentId) {
      return NextResponse.json({ message: "Content ID required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const anonDownloadsCookie = cookieStore.get("anon_downloads");
    
    let downloadedItems: string[] = [];
    if (anonDownloadsCookie?.value) {
      try {
        downloadedItems = JSON.parse(anonDownloadsCookie.value);
      } catch (e) {
        downloadedItems = [];
      }
    }

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // If user is authenticated, always allow and track
    if (session?.user?.id) {
      await prisma.download.create({
        data: {
          userId: session.user.id,
          contentId,
          ipAddress,
          userAgent,
          isAnon: false,
        }
      });
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Anonymous User Flow
    // If they already downloaded this specific item, allow it again
    if (downloadedItems.includes(contentId)) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // If they have already downloaded 1 item total, block them
    if (downloadedItems.length >= 1) {
      return NextResponse.json(
        { requiresAuth: true, message: "Free limit reached. Please sign up." },
        { status: 401 }
      );
    }

    // Allow their first download and add to cookie
    downloadedItems.push(contentId);
    
    await prisma.download.create({
      data: {
        contentId,
        ipAddress,
        userAgent,
        isAnon: true,
      }
    });

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set("anon_downloads", JSON.stringify(downloadedItems), {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;

  } catch (error: any) {
    console.error("Download API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
