import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

async function migrate() {
  console.log("🚀 Starting Image Migration: Base64 -> Files");

  const uploadDir = path.join(process.cwd(), "public", "uploads", "images");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const contents = await prisma.content.findMany({
    where: {
      OR: [
        { coverImage: { startsWith: "data:image" } },
        { body: { contains: "data:image" } }
      ]
    }
  });

  console.log(`Found ${contents.length} items to process.`);

  for (const item of contents) {
    console.log(`Processing: ${item.title}`);
    let updatedData = {};

    // 1. Process Cover Image
    if (item.coverImage && item.coverImage.startsWith("data:image")) {
      const url = await saveBase64(item.coverImage, item.title, "cover");
      if (url) {
        updatedData.coverImage = url;
        console.log(`  ✅ Fixed cover image -> ${url}`);
      }
    }

    // 2. Process Body Images (look for <img src="data:...">)
    if (item.body && item.body.includes("data:image")) {
      let newBody = item.body;
      const base64Regex = /src="(data:image\/[^;]+;base64,[^"]+)"/g;
      let match;
      let count = 0;

      while ((match = base64Regex.exec(item.body)) !== null) {
        count++;
        const fullMatch = match[0];
        const base64Str = match[1];
        const url = await saveBase64(base64Str, `${item.title}-body-${count}`, "body");
        
        if (url) {
          newBody = newBody.replace(base64Str, url);
        }
      }

      if (newBody !== item.body) {
        updatedData.body = newBody;
        console.log(`  ✅ Fixed ${count} body images.`);
      }
    }

    if (Object.keys(updatedData).length > 0) {
      await prisma.content.update({
        where: { id: item.id },
        data: updatedData
      });
    }
  }

  console.log("🏁 Migration Complete!");
  await prisma.$disconnect();
}

async function saveBase64(source, label, suffix) {
  try {
    const base64Data = source.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    
    const slug = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 50);
    
    const fileName = `${Date.now()}-${slug}-${suffix}.jpg`;
    const filePath = path.join(process.cwd(), "public", "uploads", "images", fileName);
    const publicUrl = `/uploads/images/${fileName}`;

    await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(filePath);

    return publicUrl;
  } catch (e) {
    console.error(`  ❌ Failed to save base64: ${e.message}`);
    return null;
  }
}

migrate();
