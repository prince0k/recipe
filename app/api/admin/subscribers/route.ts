import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, getInsensitiveMode } from "@/lib/db";
import { getSubscriberStats } from "@/lib/queries";

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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { email: { contains: search, ...getInsensitiveMode() } },
        { name: { contains: search, ...getInsensitiveMode() } },
        { city: { contains: search, ...getInsensitiveMode() } },
      ];
    }

    if (country) {
      where.country = { equals: country, ...getInsensitiveMode() };
    }

    // For CSV export, we might still want a larger limit or all records
    const take = format === "csv" ? 5000 : limit;

    const [subscribers, totalCount] = await Promise.all([
      prisma.subscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
        skip: format === "csv" ? 0 : skip,
      }),
      prisma.subscriber.count({ where })
    ]);

    // CSV export
    if (format === "csv") {
      const headers = [
        "Name", "Email", "Country", "City", "Region", "Timezone",
        "Browser", "Browser Version", "OS", "Device Type",
        "Screen Resolution", "Language", "IP Address",
        "Referrer", "Page URL", "Subscribed At"
      ];

      const rows = subscribers.map((s: any) => [
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
    const stats = await getSubscriberStats();

    return NextResponse.json({
      subscribers,
      stats,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      }
    });

  } catch (error) {
    console.error("Subscribers API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
