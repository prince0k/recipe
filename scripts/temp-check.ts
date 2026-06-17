import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("--- DB COUNTS ---");
  const total = await prisma.content.count();
  const drafts = await prisma.content.count({ where: { published: false } });
  const published = await prisma.content.count({ where: { published: true } });
  const pendingRecipes = await prisma.content.count({ where: { type: "PENDING_RECIPE" } });
  
  const pendingImages = await prisma.content.count({
    where: {
      type: { not: "PENDING_RECIPE" },
      OR: [
        { coverImage: null },
        { coverImage: "" },
        { coverImage: { contains: "unsplash.com" } },
        { coverImage: { contains: "hero.webp" } },
        { coverImage: { contains: "placeholder" } },
        { coverImage: { contains: "pollinations.ai" } },
        { coverImage: { contains: "prompt" } }
      ]
    }
  });

  const nullCoverImages = await prisma.content.count({
    where: { coverImage: null }
  });

  const emptyCoverImages = await prisma.content.count({
    where: { coverImage: "" }
  });

  console.log({
    total,
    drafts,
    published,
    pendingRecipes,
    pendingImages,
    nullCoverImages,
    emptyCoverImages
  });

  // Let's print the first 5 drafts with null cover images
  const sampleNulls = await prisma.content.findMany({
    where: { coverImage: null },
    take: 5,
    select: { id: true, title: true, type: true, published: true }
  });
  console.log("Sample null coverImage items:", sampleNulls);

  // Let's print the first 5 drafts overall
  const sampleDrafts = await prisma.content.findMany({
    where: { published: false },
    take: 5,
    select: { id: true, title: true, coverImage: true }
  });
  console.log("Sample draft items:", sampleDrafts);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
