import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("Checking DB content for NutriGuide in seoTitle...");
  const recordsWithNutriGuide = await prisma.content.findMany({
    where: {
      OR: [
        { seoTitle: { contains: "NutriGuide" } },
        { seoTitle: { contains: "nutriguide" } }
      ]
    },
    select: { id: true, title: true, seoTitle: true }
  });

  console.log(`Found ${recordsWithNutriGuide.length} records with NutriGuide/nutriguide in seoTitle.`);
  if (recordsWithNutriGuide.length > 0) {
    console.log("Samples:");
    console.log(recordsWithNutriGuide.slice(0, 10));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
