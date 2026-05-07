import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseUserAgent, geolocateIP } from "@/lib/geo";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    // Ensure user is authenticated
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;

    // Check if subscriber record already exists for this email
    const existingSubscriber = await prisma.subscriber.findFirst({
      where: { email },
    });

    if (existingSubscriber) {
      // If it exists, they are already tracked. We can optionally update their latest IP/Geo, 
      // but for "new signups" capturing, we just return success without duplicating.
      return NextResponse.json({ success: true, message: "Already tracked" });
    }

    const body = await req.json();
    const { referrer, pageUrl, screenRes, timezone, language } = body;

    // ─── Server-side: Extract IP & User-Agent from headers ────────────
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const rawUserAgent = req.headers.get("user-agent") || "unknown";

    // ─── Parse User-Agent into structured data ────────────────────────
    const ua = parseUserAgent(rawUserAgent);

    // ─── Geolocate IP (async, with graceful fallback) ─────────────────
    const geo = await geolocateIP(ip);

    // ─── Create the Subscriber intelligence record ────────────────────
    await prisma.subscriber.create({
      data: {
        email,
        name: session.user.name || null,
        userId: session.user.id,

        // Network & Geo
        ipAddress: ip,
        country: geo.country,
        city: geo.city,
        region: geo.region,
        timezone: timezone || geo.timezone, 

        // Device & Browser
        browser: ua.browser,
        browserVersion: ua.browserVersion,
        os: ua.os,
        deviceType: ua.deviceType,
        userAgent: rawUserAgent,
        screenRes: screenRes || null,
        language: language || null,

        // Source / Attribution
        referrer: referrer || null,
        pageUrl: pageUrl || null,
      },
    });

    console.log(`[signup-track] Tracked new signup: ${email} | ${geo.country}/${geo.city} | IP: ${ip}`);

    return NextResponse.json({ success: true, message: "Signup tracked successfully" });
  } catch (error) {
    console.error("Signup tracking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
