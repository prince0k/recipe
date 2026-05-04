import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'image', 'video', or 'pdf'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const folder = type === "pdf" ? "pdfs" : (type === "video" ? "videos" : "images");
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    let fileUrl = `/uploads/${folder}/${fileName}`;

    if (type === "image") {
      // Optimize image with sharp to WebP
      const optimizedName = `${Date.now()}.webp`;
      const optimizedPath = path.join(uploadDir, optimizedName);
      
      await sharp(buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(optimizedPath);
        
      fileUrl = `/uploads/images/${optimizedName}`;
    } else {
      // Save PDF as is
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, buffer);
    }

    return NextResponse.json({ url: fileUrl }, { status: 200 });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
