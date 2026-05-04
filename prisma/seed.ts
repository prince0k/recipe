import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const contentItems = [
    {
      title: "7-Day PCOS Friendly Diet Plan",
      slug: "7-day-pcos-diet-plan",
      type: "DIET_PLAN",
      excerpt: "A complete 7-day meal plan designed to balance hormones and manage insulin resistance.",
      body: "<p>This 7-day plan focuses on low glycemic index foods, lean proteins, and anti-inflammatory ingredients...</p>",
      coverImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=2070",
      tags: JSON.stringify(["PCOS", "hormone-balance", "low-gi"]),
      published: true,
    },
    {
      title: "Anti-Inflammatory Grocery Cheat Sheet",
      slug: "anti-inflammatory-grocery-list",
      type: "CHEAT_SHEET",
      excerpt: "Take this PDF to the grocery store to ensure you only buy foods that fight inflammation.",
      body: "<p>The core of anti-inflammatory eating is focusing on whole, unprocessed foods...</p>",
      coverImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000",
      tags: JSON.stringify(["shopping", "inflammation", "guide"]),
      published: true,
    },
    {
      title: "High-Protein Keto Breakfast Skillet",
      slug: "keto-breakfast-skillet",
      type: "RECIPE",
      excerpt: "A delicious, low-carb breakfast packed with protein to keep you full until lunch.",
      body: "<p>Ingredients: Eggs, spinach, avocado, turkey bacon...</p><p>Instructions: Cook bacon, add spinach, crack eggs...</p>",
      coverImage: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=1000",
      tags: JSON.stringify(["keto", "breakfast", "high-protein"]),
      published: true,
    }
  ];

  for (const item of contentItems) {
    await prisma.content.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
  }

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
