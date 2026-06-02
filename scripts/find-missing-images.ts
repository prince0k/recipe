import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const prisma = new PrismaClient();

// The local public directory
const PUBLIC_DIR = path.join(process.cwd(), "public");

async function checkUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });
    
    clearTimeout(id);
    
    // If HEAD is not allowed, try GET
    if (response.status === 405) {
      const getController = new AbortController();
      const getId = setTimeout(() => getController.abort(), 4000);
      const getResponse = await fetch(url, {
        method: "GET",
        signal: getController.signal,
      });
      clearTimeout(getId);
      return getResponse.status !== 404;
    }

    return response.status !== 404;
  } catch (error) {
    // If the request fails or times out, treat it as broken
    return false;
  }
}

async function main() {
  console.log("🔍 Scanning content database for missing images...");

  const items = await prisma.content.findMany({
    where: {
      type: { not: "PENDING_RECIPE" },
    },
  });

  console.log(`Loaded ${items.length} content items to inspect.`);
  let missingCount = 0;

  for (const item of items) {
    const img = item.coverImage;

    // 1. If it's already matching the pending image filter, skip
    if (
      !img ||
      img === "" ||
      img.includes("unsplash.com") ||
      img.includes("hero.webp") ||
      img.includes("placeholder") ||
      img.includes("pollinations.ai") ||
      img.includes("prompt")
    ) {
      continue;
    }

    let isMissing = false;
    let reason = "";

    // 2. Check if local path
    if (img.startsWith("/")) {
      const fullPath = path.join(PUBLIC_DIR, img);
      if (!fs.existsSync(fullPath)) {
        isMissing = true;
        reason = `Local file does not exist on disk: ${fullPath}`;
      }
    } 
    // 3. Check if remote URL
    else if (img.startsWith("http://") || img.startsWith("https://")) {
      const isAvailable = await checkUrl(img);
      if (!isAvailable) {
        isMissing = true;
        reason = `Remote image URL is broken or unreachable: ${img}`;
      }
    } 
    // 4. Any other format
    else {
      isMissing = true;
      reason = `Invalid coverImage path format: ${img}`;
    }

    if (isMissing) {
      missingCount++;
      console.log(`\n⚠️ Missing image detected for [${item.type}] "${item.title}":`);
      console.log(`   Current Path: "${img}"`);
      console.log(`   Reason: ${reason}`);
      console.log(`   Moving to pending images...`);

      await prisma.content.update({
        where: { id: item.id },
        data: {
          coverImage: null, // Resetting to null moves it to pending images
        },
      });
      console.log(`   ✅ Successfully moved to Pending Images.`);
    }
  }

  console.log("\n=========================================");
  console.log(`🎉 Scan complete. Checked ${items.length} content items.`);
  console.log(`📦 Found and moved ${missingCount} items with missing/broken images to "Pending Images".`);
  console.log("=========================================\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
