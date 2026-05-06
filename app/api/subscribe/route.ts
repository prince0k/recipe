import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Capture basic tracking data (IP and User-Agent) from headers
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Create or update the user to mark them as a subscriber
    await prisma.user.upsert({
      where: { email },
      update: {
        name: name || undefined,
        marketingConsent: true,
      },
      create: {
        email,
        name,
        marketingConsent: true,
        // Since they are just subscribing via popup, they don't have a password yet
      },
    });

    // Optionally: log the subscription event with IP
    console.log(`New subscriber: ${email} | IP: ${ip} | Browser: ${userAgent}`);

    return NextResponse.json({ success: true, message: "Subscribed successfully" });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
