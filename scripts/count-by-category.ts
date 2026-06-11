import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const recipes = await prisma.content.findMany({
    where: { type: "RECIPE" },
    select: {
      title: true,
      tags: true,
    }
  });

  const categoryTags = ["breakfast", "lunch", "dinner", "veg", "non-veg", "drinks", "snacks", "desserts"];
  const counts: Record<string, number> = {};
  categoryTags.forEach(t => counts[t] = 0);

  recipes.forEach(r => {
    let tagsList: string[] = [];
    try {
      if (r.tags) {
        tagsList = typeof r.tags === "string" ? JSON.parse(r.tags) : r.tags;
      }
    } catch(e) {}

    tagsList.forEach(tag => {
      const lowerTag = tag.trim().toLowerCase();
      if (categoryTags.includes(lowerTag)) {
        counts[lowerTag]++;
      }
    });
  });

  console.log("Recipe Counts by Category Tag in VPS Database:\n");
  Object.entries(counts).forEach(([tag, count]) => {
    console.log(`- ${tag.toUpperCase()}: ${count} recipes`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
