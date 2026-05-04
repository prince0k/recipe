import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });

  const header = "id,name,email,role,marketingConsent,createdAt\n";
  const rows = users.map(u => 
    `${u.id},"${u.name || ''}",${u.email},${u.role},${u.marketingConsent},${u.createdAt.toISOString()}`
  ).join("\n");

  return new NextResponse(header + rows, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="nutriguide_leads_${new Date().toISOString().split('T')[0]}.csv"`
    }
  });
}
