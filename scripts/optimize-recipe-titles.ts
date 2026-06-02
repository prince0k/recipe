import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const FORBIDDEN_WORDS = [
  "authentic", "sun-kissed", "sun-drenched", "golden hour", "velvet",
  "artisan", "symphony", "masterpiece", "morning ritual", "nourishing",
  "vibrant", "ultimate", "expert guide", "perfect", "golden"
];

// Helper to clean up titles based on the user's SEO frameworks
function suggestTitle(originalTitle: string): string {
  let title = originalTitle.trim();

  // 1. Remove colons and emotional subtitles
  if (title.includes(":")) {
    title = title.split(":")[0].trim();
  }

  // 2. Remove AI-sounding words
  FORBIDDEN_WORDS.forEach(word => {
    const regex = new RegExp(`\\b(the|a|an)?\\s*${word}\\b`, "gi");
    title = title.replace(regex, "");
  });

  // 3. Clean up spacing and hyphens/dashes left behind
  title = title.replace(/\s+/g, " ").trim();
  title = title.replace(/(^-|-$)+/g, "").trim();

  // 4. Fix basic grammar and capitalization
  title = title.replace(/\ba\s+(expert|omelet|apple|orange|egg|avocado|onion)\b/gi, "an $1");
  title = title.replace(/\ban\s+(banana|pear|peach|grape|strawberry|tomato|carrot)\b/gi, "a $1");

  // Title case formatting
  title = title.split(" ")
    .map((word, idx) => {
      if (word.length === 0) return "";
      const lower = word.toLowerCase();
      const lowercaseWords = ["with", "and", "for", "the", "a", "an", "in", "to", "of", "by", "at", "on", "but", "or"];
      
      // Keep lowercase unless it's the first word
      if (lowercaseWords.includes(lower) && idx !== 0) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

  // Guarantee first character is uppercase
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return title;
}

// Tokenizes title to check word-overlap (cannibalization check)
function getWords(title: string): string[] {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 3 && !["with", "and", "for", "your", "from"].includes(w));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes("--execute");

  console.log("🔍 NUTRIGUIDE RECIPE TITLE OPTIMIZATION TOOL 🔍");
  console.log("==================================================");
  console.log(`Mode: ${dryRun ? "⚠️ DRY RUN (Check-only)" : "🔥 EXECUTE (Database will be updated)"}`);
  if (dryRun) {
    console.log("Tip: Run with '--execute' to apply the optimized titles to the database.");
  }
  console.log("==================================================\n");

  const recipes = await prisma.content.findMany({
    where: { type: "RECIPE" }
  });

  console.log(`Analyzing ${recipes.length} recipes...\n`);
  
  let flaggedCount = 0;
  const updates: { id: string; originalTitle: string; newTitle: string; newSlug: string; flags: string[] }[] = [];

  for (const recipe of recipes) {
    const flags: string[] = [];
    const proposed = suggestTitle(recipe.title);

    // Flag check: Colons
    if (recipe.title.includes(":")) {
      flags.push("Contains Colon/Sub-branding");
    }

    // Flag check: AI Words
    const foundForbidden = FORBIDDEN_WORDS.filter(word => {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      return regex.test(recipe.title);
    });
    if (foundForbidden.length > 0) {
      flags.push(`AI Buzzwords: [${foundForbidden.join(", ")}]`);
    }

    // Flag check: Length
    if (recipe.title.length > 65) {
      flags.push(`Too Long (${recipe.title.length} chars, target: 45-65)`);
    }

    if (flags.length > 0 && proposed !== recipe.title) {
      flaggedCount++;
      
      // Generate clean SEO slug
      let cleanSlug = proposed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      
      updates.push({
        id: recipe.id,
        originalTitle: recipe.title,
        newTitle: proposed,
        newSlug: cleanSlug,
        flags
      });
    }
  }

  // Print title optimizations
  if (updates.length > 0) {
    console.log("📝 SUGGESTED RECIPE TITLE IMPROVEMENTS:");
    console.log("--------------------------------------------------");
    updates.forEach((up, idx) => {
      console.log(`\n${idx + 1}. Proposed Change for recipe ID: ${up.id}`);
      console.log(`   ❌ Current:  "${up.originalTitle}"`);
      console.log(`   ✅ Suggested: "${up.newTitle}" (${up.newTitle.length} chars)`);
      console.log(`   🚩 Flags:     ${up.flags.join(" | ")}`);
    });
  } else {
    console.log("✅ All recipes conform to your naming guidelines!");
  }

  // Duplicate cannibalization analysis
  console.log("\n--------------------------------------------------");
  console.log("⚠️ KEYWORD CANNIBALIZATION ANALYSIS (TITLE SIMILARITY):");
  console.log("--------------------------------------------------");
  let cannibalizedCount = 0;
  for (let i = 0; i < recipes.length; i++) {
    const wordsI = getWords(recipes[i].title);
    for (let j = i + 1; j < recipes.length; j++) {
      const wordsJ = getWords(recipes[j].title);
      const common = wordsI.filter(w => wordsJ.includes(w));
      
      // If titles share 3 or more significant words, flag it
      if (common.length >= 3) {
        cannibalizedCount++;
        console.log(`\nPotential cannibalization between:`);
        console.log(`   🔗 Recipe A: "${recipes[i].title}"`);
        console.log(`   🔗 Recipe B: "${recipes[j].title}"`);
        console.log(`   🔑 Shared keywords: [${common.join(", ")}]`);
      }
    }
  }
  if (cannibalizedCount === 0) {
    console.log("✅ No significant keyword cannibalization detected between recipes.");
  }

  // Execute database updates if requested
  if (!dryRun && updates.length > 0) {
    console.log("\n==================================================");
    console.log("Applying updates to database...");
    let successCount = 0;

    for (const up of updates) {
      try {
        // Ensure slug is unique
        let finalSlug = up.newSlug;
        const exists = await prisma.content.findFirst({
          where: { slug: finalSlug, id: { not: up.id } }
        });
        if (exists) {
          finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 6)}`;
        }

        await prisma.content.update({
          where: { id: up.id },
          data: {
            title: up.newTitle,
            slug: finalSlug
          }
        });
        console.log(`✅ Updated: "${up.originalTitle}" ➔ "${up.newTitle}" (slug: /recipes/${finalSlug})`);
        successCount++;
      } catch (err: any) {
        console.error(`❌ Failed to update "${up.originalTitle}":`, err.message);
      }
    }
    console.log(`\nUpdate run complete. Successfully updated ${successCount} recipe titles.`);
  }

  console.log("\n==================================================");
  console.log("Analysis Finished.");
  console.log("==================================================\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
