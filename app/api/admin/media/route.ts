import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uploadDir = `${process.cwd()}/public/uploads/images`;
    
    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(uploadDir);
    
    // Sort by creation time (newest first)
    const media = files
      .filter(file => !file.includes("-tablet") && !file.includes("-mobile") && !file.includes("-thumb")) // Hide variants
      .filter(file => /\.(webp|jpg|jpeg|png|gif)$/i.test(file))
      .map(file => {
        const stats = fs.statSync(`${uploadDir}/${file}`);
        return {
          url: `/uploads/images/${file}`,
          name: file,
          createdAt: stats.mtime,
          type: "image" as const
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json(media);
  } catch (error) {
    console.error("Media list error:", error);
    return NextResponse.json({ error: "Failed to list media" }, { status: 500 });
  }
}
