import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching all content items to check capitalization typos...");
  const contents = await prisma.content.findMany();
  console.log(`Found ${contents.length} content items.`);

  let updatedCount = 0;

  for (const item of contents) {
    let updated = false;
    const updateData: any = {};

    let cleanTitle = item.title;

    // Fix lowercase 'authentic' in title
    if (cleanTitle && cleanTitle.includes("authentic")) {
      cleanTitle = cleanTitle.replace(/\bauthentic\b/g, "Authentic");
      updated = true;
    }

    // Fix lowercase 'kitchen' in title
    if (cleanTitle && cleanTitle.includes("kitchen")) {
      cleanTitle = cleanTitle.replace(/\bkitchen\b/g, "Kitchen");
      updated = true;
    }

    // Standardize title-casing check
    // e.g. "authentic Herb-Crusted White Fish" -> "Authentic Herb-Crusted White Fish"
    if (cleanTitle && cleanTitle !== item.title) {
      updateData.title = cleanTitle;
      updated = true;
    }

    if (updated) {
      console.log(`Updating item ID ${item.id}: "${item.title}" -> "${cleanTitle}"`);
      await prisma.content.update({
        where: { id: item.id },
        data: {
          title: cleanTitle,
          ...updateData
        }
      });
      updatedCount++;
    }
  }

  console.log(`Successfully fixed capitalization typos in ${updatedCount} content items.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
