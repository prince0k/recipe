import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 DATABASE SANITIZATION: Stripping localhost:3000 and 127.0.0.1:3002 prefixes...");

  const contentItems = await prisma.content.findMany({
    select: {
      id: true,
      title: true,
      coverImage: true,
      coverVideo: true,
      body: true
    }
  });

  console.log(`Found ${contentItems.length} content items to scan.`);
  let updatedCount = 0;

  for (const item of contentItems) {
    let needsUpdate = false;
    const updateData: any = {};

    if (item.coverImage && (item.coverImage.includes("localhost:") || item.coverImage.includes("127.0.0.1:"))) {
      const cleaned = item.coverImage.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, '');
      console.log(`- [Image] Cleaning "${item.title}": "${item.coverImage}" -> "${cleaned}"`);
      updateData.coverImage = cleaned;
      needsUpdate = true;
    }

    if (item.coverVideo && (item.coverVideo.includes("localhost:") || item.coverVideo.includes("127.0.0.1:"))) {
      const cleaned = item.coverVideo.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, '');
      console.log(`- [Video] Cleaning "${item.title}": "${item.coverVideo}" -> "${cleaned}"`);
      updateData.coverVideo = cleaned;
      needsUpdate = true;
    }

    if (item.body && (item.body.includes("localhost:") || item.body.includes("127.0.0.1:"))) {
      const cleaned = item.body.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, '');
      console.log(`- [Body] Cleaning localhost URLs in body of "${item.title}"`);
      updateData.body = cleaned;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.content.update({
        where: { id: item.id },
        data: updateData
      });
      updatedCount++;
    }
  }

  console.log(`✅ Sanitization complete. Updated ${updatedCount} content items.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
