import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function deleteAll() {
  console.log("⚠️ WARNING: Deleting all Content and Requests...");

  try {
    // 1. Delete all Personalized Requests (they link to content)
    const requestsCount = await prisma.personalizedRequest.deleteMany({});
    console.log(`✅ Deleted ${requestsCount.count} requests.`);

    // 2. Delete all Content
    const contentCount = await prisma.content.deleteMany({});
    console.log(`✅ Deleted ${contentCount.count} content items.`);

    // 3. Clear Uploads folder
    const uploadDir = path.join(process.cwd(), "public", "uploads", "images");
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      for (const file of files) {
        fs.unlinkSync(path.join(uploadDir, file));
      }
      console.log(`✅ Cleared ${files.length} images from public/uploads/images.`);
    }

    console.log("🏁 All content cleared!");
  } catch (e) {
    console.error("❌ Error deleting content:", e);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAll();
