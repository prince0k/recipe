import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { path, referrer } = await req.json();

    if (!path) {
      return NextResponse.json({ message: "Path required" }, { status: 400 });
    }

    // Basic geolocation/country from standard headers (Vercel/Cloudflare/Nginx)
    const country = req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || "Unknown";

    await prisma.pageView.create({
      data: {
        userId: session?.user?.id || null,
        path,
        referrer: referrer || null,
        country,
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Tracking API error:", error);
    // Return 200 anyway so we don't block the client
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
