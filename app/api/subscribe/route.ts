import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseUserAgent, geolocateIP } from "@/lib/geo";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, referrer, pageUrl, screenRes, timezone, language } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // ─── Server-side: Extract IP & User-Agent from headers ────────────
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const rawUserAgent = req.headers.get("user-agent") || "unknown";

    // ─── Parse User-Agent into structured data ────────────────────────
    const ua = parseUserAgent(rawUserAgent);

    // ─── Geolocate IP (async, with graceful fallback) ─────────────────
    const geo = await geolocateIP(ip);

    // ─── Upsert the User record (existing behavior preserved) ─────────
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: name || undefined,
        marketingConsent: true,
      },
      create: {
        email,
        name,
        marketingConsent: true,
      },
    });

    // ─── Create the Subscriber intelligence record ────────────────────
    await prisma.subscriber.create({
      data: {
        email,
        name: name || null,
        userId: user.id,

        // Network & Geo
        ipAddress: ip,
        country: geo.country,
        city: geo.city,
        region: geo.region,
        timezone: timezone || geo.timezone, // prefer client-sent timezone

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

    console.log(`[subscribe] New subscriber: ${email} | ${geo.country}/${geo.city} | ${ua.browser} ${ua.browserVersion} | ${ua.deviceType} | IP: ${ip}`);

    // ─── Track Download if it's a cheatsheet ──────────────────────────
    if (referrer === 'cheatsheet' && pageUrl) {
      const content = await prisma.content.findUnique({
        where: { slug: pageUrl }
      });
      if (content) {
        await prisma.download.create({
          data: {
            userId: user.id,
            contentId: content.id,
            ipAddress: ip,
            userAgent: rawUserAgent,
            isAnon: false,
            source: 'cheatsheet',
          }
        });
        console.log(`[subscribe] Logged cheatsheet download for user ${user.id}, content ${content.id}`);
      } else {
        console.warn(`[subscribe] Content not found for slug: ${pageUrl}`);
      }
    }

    // ─── Fire welcome email (async, non-blocking) ─────────────────────
    sendWelcomeEmail(email, name || "").catch((err) =>
      console.error("[subscribe] Welcome email fire-and-forget error:", err)
    );

    return NextResponse.json({ success: true, message: "Subscribed successfully" });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
