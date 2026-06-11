import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function countWords(htmlString: string): number {
  if (!htmlString) return 0;
  const textOnly = htmlString.replace(/<[^>]*>?/gm, " ").trim();
  const words = textOnly.split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

async function main() {
  console.log("🔍 AUDITING PRODUCTION VPS DATABASE...");
  const contents = await prisma.content.findMany();
  console.log(`Total items in database: ${contents.length}`);
  
  const thinItems = contents.filter(item => countWords(item.body) < 800);
  console.log(`Thin items (< 800 words): ${thinItems.length}`);
  
  const byType: Record<string, number> = {};
  for (const item of thinItems) {
    byType[item.type] = (byType[item.type] || 0) + 1;
  }
  
  console.log("Thin items by type:");
  for (const [type, count] of Object.entries(byType)) {
    console.log(`- ${type}: ${count}`);
  }

  console.log("\nTop 20 published thin items:");
  const publishedThin = thinItems.filter(item => item.published);
  console.log(`Total published thin items: ${publishedThin.length}`);
  publishedThin.slice(0, 20).forEach((item, idx) => {
    console.log(`[${idx + 1}] [${item.type}] Slug: ${item.slug} (${countWords(item.body)} words) Title: "${item.title}"`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
