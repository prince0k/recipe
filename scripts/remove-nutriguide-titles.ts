import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database page title cleanup script...");

  // 1. Fetch all records where seoTitle contains NutriGuide (case-insensitive)
  const items = await prisma.content.findMany({
    where: {
      OR: [
        { seoTitle: { contains: "NutriGuide" } },
        { seoTitle: { contains: "nutriguide" } }
      ]
    },
    select: {
      id: true,
      title: true,
      seoTitle: true
    }
  });

  console.log(`Found ${items.length} records that contain 'NutriGuide' in their seoTitle.`);

  let updatedCount = 0;

  for (const item of items) {
    if (!item.seoTitle) continue;

    // Remove " | NutriGuide" or " | NutriGuide Recipe" case insensitively
    const cleanedTitle = item.seoTitle.replace(/\s*\|\s*NutriGuide(?:\s+Recipe)?/gi, "").trim();

    if (cleanedTitle !== item.seoTitle) {
      console.log(`Updating ID: ${item.id}`);
      console.log(`   Old: "${item.seoTitle}"`);
      console.log(`   New: "${cleanedTitle}"`);

      await prisma.content.update({
        where: { id: item.id },
        data: {
          seoTitle: cleanedTitle
        }
      });
      updatedCount++;
    }
  }

  console.log("\n=========================================");
  console.log(`🎉 Database update complete.`);
  console.log(`📦 Cleaned and updated ${updatedCount} records.`);
  console.log("=========================================\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
