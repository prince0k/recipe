import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking for off-topic content items...");
  const offTopicKeywords = ["Kings Island", "Greenland", "KFC", "Frost Bank Center"];
  
  let deletedCount = 0;
  
  for (const keyword of offTopicKeywords) {
    const items = await prisma.content.findMany({
      where: {
        OR: [
          { title: { contains: keyword } },
          { slug: { contains: keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-") } }
        ]
      }
    });
    
    for (const item of items) {
      console.log(`Deleting off-topic item: "${item.title}" (${item.type})`);
      await prisma.content.delete({
        where: { id: item.id }
      });
      deletedCount++;
    }
  }
  
  console.log(`Successfully deleted ${deletedCount} off-topic content items.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
