import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const execute = args.includes("--execute");

// Only replace the actual 4 AI buzzwords flagged by the GSC verification script
const BUZZWORD_REPLACEMENTS: Record<string, string> = {
  "honest": "simple",
  "stunning": "beautiful",
  "artisanal": "traditional",
  "cinematic": "beautiful"
};

function cleanText(text: string | null): string | null {
  if (!text) return null;
  let cleaned = text;
  for (const [word, replacement] of Object.entries(BUZZWORD_REPLACEMENTS)) {
    // Case-insensitive replacement matching word boundaries
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    cleaned = cleaned.replace(regex, (match) => {
      // Preserve capitalization
      if (match.charAt(0) === match.charAt(0).toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }
  // Strip Stwart typo just in case
  cleaned = cleaned.replace(/Stwart/g, "Stewart");
  return cleaned;
}

// Generate high quality fallback SEO Title under 60 chars
function generateSeoTitle(title: string, type: string): string {
  let clean = title.replace(/\s*[|–-]\s*(Stewart Lucas|Lucas Stewart|Expert Nutrition Guide|Stewart Lucas Method|Culinary Coaching|Culinary Nutrition|Culinary comprehensive guide).*/gi, '').trim();
  clean = cleanText(clean) || clean;
  const suffix = " | NutriGuide";
  
  if (clean.length + suffix.length <= 60) {
    return clean + suffix;
  }
  if (clean.length <= 60) {
    return clean;
  }
  return clean.slice(0, 56) + "...";
}

// Generate high quality fallback SEO Description under 155 chars
function generateSeoDesc(title: string, excerpt: string | null, type: string): string {
  const cleanTitle = cleanText(title) || title;
  const cleanExcerpt = cleanText(excerpt) || "";
  
  let desc = "";
  if (type === "RECIPE") {
    desc = `Discover our recipe for ${cleanTitle}. ${cleanExcerpt ? cleanExcerpt.slice(0, 80) : "A simple, healthy, and delicious meal prepared with fresh ingredients."}`;
  } else if (type === "DIET_PLAN") {
    desc = `Start your health journey with our ${cleanTitle}. ${cleanExcerpt ? cleanExcerpt.slice(0, 80) : "A comprehensive, science-backed nutritional guide from NutriGuide."}`;
  } else {
    desc = `${cleanExcerpt ? cleanExcerpt.slice(0, 110) : `Learn more about ${cleanTitle} from the health experts at NutriGuide.`}`;
  }
  
  desc = cleanText(desc) || desc;
  if (desc.length > 155) {
    return desc.slice(0, 152) + "...";
  }
  return desc;
}

async function main() {
  console.log("🔍 PRODUCTION DATABASE METADATA OPTIMIZATION TOOL 🔍");
  console.log("==================================================");
  console.log(`Mode: ${execute ? "🔥 EXECUTE (Database will be updated)" : "⚠️ DRY RUN (Simulated check)"}`);
  if (!execute) {
    console.log("Tip: Run with '--execute' to save the optimized metadata to the database.");
  }
  console.log("==================================================\n");

  const contents = await prisma.content.findMany({
    where: { published: true }
  });

  console.log(`Analyzing ${contents.length} published content items...\n`);
  
  let totalUpdated = 0;

  for (const item of contents) {
    let changed = false;
    const updateData: any = {};

    // 1. Sanitize existing body & excerpt from AI buzzwords
    const cleanedBody = cleanText(item.body);
    if (cleanedBody && cleanedBody !== item.body) {
      updateData.body = cleanedBody;
      changed = true;
      console.log(`   [BUZZWORD] Sanitized body for [${item.type}] "${item.title}"`);
    }

    const cleanedExcerpt = cleanText(item.excerpt);
    if (cleanedExcerpt && cleanedExcerpt !== item.excerpt) {
      updateData.excerpt = cleanedExcerpt;
      changed = true;
      console.log(`   [BUZZWORD] Sanitized excerpt for [${item.type}] "${item.title}"`);
    }

    // 2. SEO Title Optimization
    let targetSeoTitle = item.seoTitle;
    if (!targetSeoTitle || targetSeoTitle.trim() === "" || targetSeoTitle.toLowerCase().includes("stewart")) {
      targetSeoTitle = generateSeoTitle(item.title, item.type);
    } else {
      targetSeoTitle = cleanText(targetSeoTitle);
    }

    if (targetSeoTitle && targetSeoTitle !== item.seoTitle) {
      updateData.seoTitle = targetSeoTitle;
      changed = true;
      console.log(`   [TITLE] "${item.seoTitle || 'NULL'}" -> "${targetSeoTitle}"`);
    }

    // 3. SEO Description Optimization
    let targetSeoDesc = item.seoDesc;
    if (!targetSeoDesc || targetSeoDesc.trim() === "" || targetSeoDesc.length < 30) {
      targetSeoDesc = generateSeoDesc(item.title, item.excerpt, item.type);
    } else {
      targetSeoDesc = cleanText(targetSeoDesc);
    }

    if (targetSeoDesc && targetSeoDesc !== item.seoDesc) {
      updateData.seoDesc = targetSeoDesc;
      changed = true;
      console.log(`   [DESC] "${item.seoDesc || 'NULL'}" -> "${targetSeoDesc}"`);
    }

    if (changed) {
      totalUpdated++;
      if (execute) {
        await prisma.content.update({
          where: { id: item.id },
          data: updateData
        });
        console.log(`✅ [${item.type}] Updated: "${item.title}"\n`);
      } else {
        console.log(`⚠️ [DRY RUN] Would update: "${item.title}"\n`);
      }
    }
  }

  console.log("==================================================");
  console.log(`Optimization finished. Total items needing updates: ${totalUpdated}`);
  console.log("==================================================\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
