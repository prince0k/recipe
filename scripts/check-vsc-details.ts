import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const slugsToCheck = [
  "7-day-soy-free-meal-plan",
  "grilled-sirloin-steak-recipe",
  "healthy-white-fish-recipes",
  "greek-yogurt-flaxseed-bowl",
  "carrot-sticks-and-hummus-recipe",
];

function countWords(htmlString: string): number {
  if (!htmlString) return 0;
  const textOnly = htmlString.replace(/<[^>]*>?/gm, " ").trim();
  const words = textOnly.split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

async function main() {
  console.log("Checking VSC slugs details in VPS database...");
  const contents = await prisma.content.findMany({
    where: {
      slug: { in: slugsToCheck }
    }
  });

  for (const c of contents) {
    const words = countWords(c.body);
    console.log(`- Slug: ${c.slug}`);
    console.log(`  Title: "${c.title}"`);
    console.log(`  Word count: ${words}`);
    console.log(`  Body snippet: ${c.body?.slice(0, 200)}...`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
