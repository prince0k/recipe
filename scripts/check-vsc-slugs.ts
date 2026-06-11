import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const slugsToCheck = [
  "7-day-soy-free-meal-plan",
  "7-day-soy-free-vegan-reset-fueling-vitality-without-tofu-pptnr",
  "7-day-soy-free-vegan-reset-fueling-vitality-without-tofu",
  "perfectly-grilled-sirloin-steak",
  "perfectly-grilled-sirloin-steak-a-nutriguide-signature",
  "grilled-sirloin-steak-recipe",
  "creamy-greek-yogurt-flaxseed-power-bowl",
  "greek-yogurt-flaxseed-bowl",
  "creamy-greek-yogurt-with-golden-toasted-sunflower-seeds",
  "fresh-carrot-sticks-with-creamy-homemade-hummus",
  "carrot-sticks-and-hummus-recipe",
  "lemon-herb-baked-white-fish-a-simple-healthy-dinner",
  "healthy-white-fish-recipes",
];

async function main() {
  console.log("Checking VSC slugs in VPS database...");
  const contents = await prisma.content.findMany({
    where: {
      slug: { in: slugsToCheck }
    },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      published: true,
      seoTitle: true,
      seoDesc: true,
    }
  });

  console.log(`Found ${contents.length} matches:`);
  for (const c of contents) {
    console.log(`- [${c.type}] Slug: ${c.slug} | Title: "${c.title}" | Published: ${c.published}`);
    console.log(`  SEO Title: ${c.seoTitle}`);
    console.log(`  SEO Desc: ${c.seoDesc}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
