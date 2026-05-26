import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 SCANNING FOR OFF-TOPIC BLOG POSTS...");

  const offTopicKeywords = [
    "Kings Island", 
    "Greenland", 
    "KFC", 
    "Frost Bank Center", 
    "Frost Bank", 
    "Cincinnati weather", 
    "Cincinnati", 
    "weather"
  ];
  
  let deletedCount = 0;
  const deletedSlugs: string[] = [];
  
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
      console.log(`❌ Found off-topic item: "${item.title}" (slug: "${item.slug}", type: ${item.type})`);
      
      // Delete personalized requests that link to this content first to avoid foreign key errors
      const reqs = await prisma.personalizedRequest.deleteMany({
        where: { contentId: item.id }
      });
      if (reqs.count > 0) {
        console.log(`   - Deleted ${reqs.count} associated personalized requests.`);
      }

      // Delete downloads referencing this content
      const downloads = await prisma.download.deleteMany({
        where: { contentId: item.id }
      });
      if (downloads.count > 0) {
        console.log(`   - Deleted ${downloads.count} associated download logs.`);
      }

      // Delete favorites referencing this content
      const favorites = await prisma.favorite.deleteMany({
        where: { contentId: item.id }
      });
      if (favorites.count > 0) {
        console.log(`   - Deleted ${favorites.count} associated favorites.`);
      }

      // Delete reviews referencing this content
      const reviews = await prisma.review.deleteMany({
        where: { contentId: item.id }
      });
      if (reviews.count > 0) {
        console.log(`   - Deleted ${reviews.count} associated reviews.`);
      }

      await prisma.content.delete({
        where: { id: item.id }
      });
      
      deletedSlugs.push(item.slug);
      deletedCount++;
    }
  }
  
  console.log(`\n🏁 Scan complete. Successfully deleted ${deletedCount} off-topic items.`);
  console.log("Deleted Slugs to redirect:", deletedSlugs);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
