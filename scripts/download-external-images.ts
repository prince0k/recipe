import { PrismaClient } from "@prisma/client";
import { saveAndCompressImage } from "../lib/image-utils";

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching all content items...");
  const contents = await prisma.content.findMany();
  console.log(`Found ${contents.length} total content items.`);

  let updatedCount = 0;

  for (const item of contents) {
    const img = item.coverImage;
    if (img && (img.startsWith("http://") || img.startsWith("https://") || img.includes("pollinations.ai") || img.includes("unsplash.com"))) {
      console.log(`Downloading and compressing image for: "${item.title}"`);
      console.log(`Source URL: ${img}`);
      try {
        const localUrl = await saveAndCompressImage(img, item.title);
        if (localUrl && localUrl !== img) {
          await prisma.content.update({
            where: { id: item.id },
            data: { coverImage: localUrl }
          });
          console.log(`✅ Updated coverImage to: ${localUrl}`);
          updatedCount++;
        } else {
          console.log(`⚠️ No change or failed to compress for: "${item.title}"`);
        }
      } catch (err: any) {
        console.error(`❌ Failed to process image for "${item.title}":`, err.message);
      }
    }
  }

  console.log(`Successfully updated ${updatedCount} content items with local compressed images.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
