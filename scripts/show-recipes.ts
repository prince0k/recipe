import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Fetching recipes from database...");
  
  const recipes = await prisma.content.findMany({
    where: {
      type: "RECIPE",
    },
    select: {
      title: true,
      published: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  if (recipes.length === 0) {
    console.log("⚠️ No recipes found in the database.");
    return;
  }

  console.log(`\n📚 Recipes List (${recipes.length} total):`);
  console.log("=========================================");
  recipes.forEach((recipe, index) => {
    const status = recipe.published ? "🟢 Published" : "⚪ Draft";
    console.log(`${String(index + 1).padStart(2, ' ')}. ${recipe.title} (${status})`);
  });
  console.log("=========================================\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
