import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const BUZZWORDS = [
  { term: /cinematic/gi, replace: "professional" },
  { term: /artisanal/gi, replace: "traditional" },
  { term: /moody/gi, replace: "warm" },
  { term: /masterclass/gi, replace: "guide" },
  { term: /alchemy/gi, replace: "magic" },
  { term: /canvas/gi, replace: "base" },
  { term: /ode/gi, replace: "tribute" },
  { term: /hearth/gi, replace: "kitchen" },
  { term: /resilience/gi, replace: "strength" },
  { term: /curated/gi, replace: "selected" }
];

// More contextual replacements to maintain good readability
function cleanText(text: string): string {
  if (!text) return text;
  let cleaned = text;

  // Cinematic contextual replacements
  cleaned = cleaned.replace(/cinematic lighting/gi, "natural lighting");
  cleaned = cleaned.replace(/cinematic photography/gi, "professional food photography");
  cleaned = cleaned.replace(/cinematic shot/gi, "professional shot");
  cleaned = cleaned.replace(/cinematic/gi, "stunning");

  // Artisanal contextual replacements
  cleaned = cleaned.replace(/artisanal sourdough/gi, "crusty sourdough");
  cleaned = cleaned.replace(/artisanal bread/gi, "rustic bread");
  cleaned = cleaned.replace(/artisanal cheese/gi, "specialty cheese");
  cleaned = cleaned.replace(/artisanal touch/gi, "crafted touch");
  cleaned = cleaned.replace(/artisanal/gi, "authentic");

  // Moody contextual replacements
  cleaned = cleaned.replace(/moody lighting/gi, "warm, soft lighting");
  cleaned = cleaned.replace(/moody atmosphere/gi, "cozy atmosphere");
  cleaned = cleaned.replace(/moody food/gi, "rustic food");
  cleaned = cleaned.replace(/moody/gi, "inviting");

  // Alchemy contextual replacements
  cleaned = cleaned.replace(/culinary alchemy/gi, "culinary magic");
  cleaned = cleaned.replace(/flavor alchemy/gi, "flavor combination");
  cleaned = cleaned.replace(/alchemy/gi, "science");

  // Canvas contextual replacements
  cleaned = cleaned.replace(/blank canvas/gi, "blank base");
  cleaned = cleaned.replace(/canvas/gi, "base");

  // Ode contextual replacements
  cleaned = cleaned.replace(/an ode to/gi, "a tribute to");
  cleaned = cleaned.replace(/ode/gi, "tribute");

  // Hearth contextual replacements
  cleaned = cleaned.replace(/hearth/gi, "kitchen");

  // Masterclass contextual replacements
  cleaned = cleaned.replace(/masterclass/gi, "comprehensive guide");

  // Resilience contextual replacements
  cleaned = cleaned.replace(/resilience/gi, "strength");

  // Curated contextual replacements
  cleaned = cleaned.replace(/curated list/gi, "selected list");
  cleaned = cleaned.replace(/curated collection/gi, "crafted collection");
  cleaned = cleaned.replace(/curated/gi, "selected");

  return cleaned;
}

async function main() {
  console.log("🧹 DB SANITIZATION: Scanning for repetitive and artificial marketing buzzwords...");

  const contentItems = await prisma.content.findMany({
    select: {
      id: true,
      title: true,
      excerpt: true,
      body: true,
      coverImagePrompt: true,
      seoTitle: true,
      seoDesc: true,
      tags: true
    }
  });

  console.log(`Found ${contentItems.length} content items to scan.`);
  let updatedCount = 0;

  for (const item of contentItems) {
    let needsUpdate = false;
    const updateData: any = {};

    // Scan columns
    const columnsToScan = ["title", "excerpt", "body", "coverImagePrompt", "seoTitle", "seoDesc"];
    
    for (const col of columnsToScan) {
      const originalValue = (item as any)[col];
      if (originalValue) {
        const cleanedValue = cleanText(originalValue);
        if (cleanedValue !== originalValue) {
          console.log(`- [${col}] Changing in "${item.title}":`);
          // Print match snippets
          for (const word of BUZZWORDS) {
            const matches = originalValue.match(word.term);
            if (matches) {
              console.log(`  * Found buzzword matching: ${word.term.source} (${matches.length} times)`);
            }
          }
          updateData[col] = cleanedValue;
          needsUpdate = true;
        }
      }
    }

    if (needsUpdate) {
      await prisma.content.update({
        where: { id: item.id },
        data: updateData
      });
      updatedCount++;
    }
  }

  console.log(`✅ Sanitization complete. Updated ${updatedCount} content items.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
