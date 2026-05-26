import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching all content items...");
  const contents = await prisma.content.findMany();
  console.log(`Found ${contents.length} content items.`);

  let updatedCount = 0;

  for (const item of contents) {
    let updated = false;
    const updateData: any = {};

    if (item.title && item.title.includes("Stwart")) {
      updateData.title = item.title.replace(/Stwart/g, "Stewart");
      updated = true;
    }
    if (item.slug && item.slug.includes("stwart")) {
      updateData.slug = item.slug.replace(/stwart/g, "stewart");
      updated = true;
    }
    if (item.body && item.body.includes("Stwart")) {
      updateData.body = item.body.replace(/Stwart/g, "Stewart");
      updated = true;
    }
    if (item.excerpt && item.excerpt.includes("Stwart")) {
      updateData.excerpt = item.excerpt.replace(/Stwart/g, "Stewart");
      updated = true;
    }
    if (item.coverImagePrompt && item.coverImagePrompt.includes("Stwart")) {
      updateData.coverImagePrompt = item.coverImagePrompt.replace(/Stwart/g, "Stewart");
      updated = true;
    }
    if (item.schema && item.schema.includes("Stwart")) {
      updateData.schema = item.schema.replace(/Stwart/g, "Stewart");
      updated = true;
    }

    if (updated) {
      console.log(`Updating item: "${item.title}" -> "${updateData.title || item.title}"`);
      await prisma.content.update({
        where: { id: item.id },
        data: updateData
      });
      updatedCount++;
    }
  }

  console.log(`Successfully fixed Stwart typos in ${updatedCount} content items.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
