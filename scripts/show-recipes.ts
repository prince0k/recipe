import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

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
  
  const fileLines: string[] = [];
  recipes.forEach((recipe, index) => {
    const status = recipe.published ? "🟢 Published" : "⚪ Draft";
    const statusLabel = recipe.published ? "Published" : "Draft";
    console.log(`${String(index + 1).padStart(2, ' ')}. ${recipe.title} (${status})`);
    fileLines.push(`${recipe.title} (${statusLabel})`);
  });
  console.log("=========================================\n");

  // Output to file in /var/www/recipe
  const outputDir = "/var/www/recipe";
  const outputFilename = "recipes.txt";
  let outputPath = path.join(outputDir, outputFilename);
  let dirExists = false;

  try {
    if (fs.existsSync(outputDir)) {
      dirExists = true;
    }
  } catch (e) {
    // Ignored
  }

  if (!dirExists) {
    outputPath = path.join(process.cwd(), outputFilename);
    console.log(`⚠️ Directory ${outputDir} does not exist. Saving to local fallback path: ${outputPath}`);
  }

  try {
    fs.writeFileSync(outputPath, fileLines.join("\n"), "utf8");
    console.log(`💾 Successfully saved recipe list to: ${outputPath}\n`);
  } catch (error: any) {
    console.error(`❌ Failed to write recipe list file:`, error.message);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
