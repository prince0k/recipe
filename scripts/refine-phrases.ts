import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const PHRASE_REPLACEMENTS = [
  // Fixes for titles
  { search: "The Art of Protein Cycling: A stunning Approach", replace: "The Art of Protein Cycling: A Practical Approach" },
  { search: "Protein-Cycling Protocols: The authentic Approach", replace: "Protein-Cycling Protocols: An Effective Approach" },
  { search: "The Art of Protein Cycling: A stunning Guide", replace: "The Art of Protein Cycling: A Complete Guide" },
  { search: "The Golden kitchen Lentil Roast: A comprehensive guide in Plant-Based Protein", replace: "The Golden Harvest Lentil Roast: An Expert Guide to Plant-Based Protein" },
  { search: "The Sunrise Zenith: An authentic Smoothie Bowl comprehensive guide", replace: "The Sunrise Zenith: A Guide to Healthy Smoothie Bowls" },
  { search: "The Architect’s Plate: stunning Meal Prep", replace: "The Architect’s Plate: Smart Meal Prep" },
  { search: "The science of the Gut: A stunning Approach", replace: "The Science of the Gut: A Practical Guide" },
  { search: "The Velvet Ganache Tart: A comprehensive guide in Sugar-Free Indulgence", replace: "The Velvet Ganache Tart: An Expert Guide to Sugar-Free Indulgence" },
  { search: "The Golden Harvest Bowl: A stunning tribute to Fiber", replace: "The Golden Harvest Bowl: A Delicious Celebration of Fiber" },
  { search: "The Art of the Plate: A stunning Guide to Mindful Eating", replace: "The Art of the Plate: A Practical Guide to Mindful Eating" },
  { search: "The Golden Almond Harvest Loaf: A comprehensive guide in Gluten-Free Baking", replace: "The Golden Almond Harvest Loaf: An Expert Guide to Gluten-Free Baking" },
  { search: "The Golden kitchen: A comprehensive guide in Budget-Friendly Vitality", replace: "The Budget-Friendly Kitchen: A Guide to Affordable Vitality" },
  { search: "Your stunning Keto Compass", replace: "Your Complete Keto Compass" },
  { search: "Your stunning Blueprint: Meal Prep", replace: "Your Ultimate Blueprint: Meal Prep" },
  { search: "Your stunning Guide: The Essential Gluten-Free Pantry", replace: "Your Complete Guide: The Essential Gluten-Free Pantry" },
  { search: "Your stunning Guide to Low-FODMAP Digestive Comfort", replace: "Your Complete Guide to Low-FODMAP Digestive Comfort" },
  { search: "Unlocking Rest: Your stunning Sleep", replace: "Unlocking Rest: Your Complete Sleep" },
  { search: "Your stunning Hydration Journey", replace: "Your Complete Hydration Journey" },
  { search: "Your stunning Keto Grocery List", replace: "Your Ultimate Keto Grocery List" },

  // General body/content fixes for awkward replacements
  { search: "stunning photography", replace: "professional photography" },
  { search: "stunning lighting", replace: "natural lighting" },
  { search: "stunning shot", replace: "professional shot" },
  { search: "stunning approach", replace: "practical approach" },
  { search: "stunning guide", replace: "practical guide" },
  { search: "stunning blueprint", replace: "complete blueprint" },
  { search: "stunning sleep", replace: "restful sleep" },
  { search: "stunning keto", replace: "complete keto" },
  { search: "authentic sourdough", replace: "crusty sourdough" },
  { search: "authentic bread", replace: "traditional bread" },
  { search: "authentic cheese", replace: "specialty cheese" },
  { search: "authentic touch", replace: "crafted touch" },
  { search: "authentic approach", replace: "practical approach" },
  { search: "authentic guide", replace: "master guide" },
  { search: "comprehensive guide in", replace: "expert guide to" },
  { search: "comprehensive guide of", replace: "expert guide to" },
  { search: "science of strength", replace: "power of strength" },
  { search: "blank base", replace: "simple base" },
  { search: "tribute to fiber", replace: "celebration of fiber" }
];

function refineText(text: string): string {
  if (!text) return text;
  let refined = text;

  for (const item of PHRASE_REPLACEMENTS) {
    // Case-sensitive exact matching first
    refined = refined.split(item.search).join(item.replace);
    
    // Case-insensitive regex matching for general lowercased words
    const regex = new RegExp(item.search, "gi");
    refined = refined.replace(regex, (match) => {
      // Preserve uppercase first letter if matching case-insensitively
      if (match[0] === match[0].toUpperCase()) {
        return item.replace[0].toUpperCase() + item.replace.slice(1);
      }
      return item.replace;
    });
  }

  return refined;
}

async function main() {
  console.log("🧹 DB REFINEMENT: Fixing awkward or robotic phrasing from initial sanitization...");

  const contentItems = await prisma.content.findMany({
    select: {
      id: true,
      title: true,
      excerpt: true,
      body: true,
      coverImagePrompt: true,
      seoTitle: true,
      seoDesc: true
    }
  });

  console.log(`Found ${contentItems.length} content items to scan and refine.`);
  let updatedCount = 0;

  for (const item of contentItems) {
    let needsUpdate = false;
    const updateData: any = {};

    const columnsToScan = ["title", "excerpt", "body", "coverImagePrompt", "seoTitle", "seoDesc"];
    
    for (const col of columnsToScan) {
      const originalValue = (item as any)[col];
      if (originalValue) {
        const refinedValue = refineText(originalValue);
        if (refinedValue !== originalValue) {
          updateData[col] = refinedValue;
          needsUpdate = true;
        }
      }
    }

    if (needsUpdate) {
      console.log(`- Updating: "${item.title}" -> "${updateData.title || item.title}"`);
      await prisma.content.update({
        where: { id: item.id },
        data: updateData
      });
      updatedCount++;
    }
  }

  console.log(`✅ Refinement complete. Updated ${updatedCount} content items with smoother, natural language.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
