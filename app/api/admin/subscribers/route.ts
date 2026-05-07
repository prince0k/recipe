import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const country = searchParams.get("country") || "";
    const format = searchParams.get("format") || "json";

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    if (country) {
      where.country = { equals: country, mode: "insensitive" };
    }

    const subscribers = await prisma.subscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    // CSV export
    if (format === "csv") {
      const headers = [
        "Name", "Email", "Country", "City", "Region", "Timezone",
        "Browser", "Browser Version", "OS", "Device Type",
        "Screen Resolution", "Language", "IP Address",
        "Referrer", "Page URL", "Subscribed At"
      ];

      const rows = subscribers.map(s => [
        s.name || "",
        s.email,
        s.country || "",
        s.city || "",
        s.region || "",
        s.timezone || "",
        s.browser || "",
        s.browserVersion || "",
        s.os || "",
        s.deviceType || "",
        s.screenRes || "",
        s.language || "",
        s.ipAddress || "",
        s.referrer || "",
        s.pageUrl || "",
        new Date(s.createdAt).toISOString(),
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));

      const csv = [headers.join(","), ...rows].join("\n");

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="subscribers_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // Get aggregate stats
    const [total, todayCount, countryStats] = await Promise.all([
      prisma.subscriber.count(),
      prisma.subscriber.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.subscriber.groupBy({
        by: ["country"],
        _count: { country: true },
        orderBy: { _count: { country: "desc" } },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      subscribers,
      stats: {
        total,
        today: todayCount,
        topCountries: countryStats.map(c => ({
          country: c.country || "Unknown",
          count: c._count.country,
        })),
      },
    });
  } catch (error) {
    console.error("Subscribers API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
