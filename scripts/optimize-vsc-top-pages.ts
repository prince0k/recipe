import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const execute = args.includes("--execute");

interface PageSEOUpdate {
  seoTitle: string;
  seoDesc: string;
  tags?: string[];
  keywords?: string[];
  h1ToRemoveRegex?: RegExp;
}

const updates: Record<string, PageSEOUpdate> = {
  "greek-yogurt-bowl-with-flaxseeds-and-fresh-berries": {
    seoTitle: "Greek Yogurt Flaxseed Bowl with Berries | NutriGuide",
    seoDesc: "A quick, high-protein Greek yogurt bowl with ground flaxseeds and fresh berries. A perfect healthy breakfast for sustained morning energy.",
    tags: ["breakfast", "veg", "Greek Yogurt", "Flaxseeds", "High-Protein", "Keto", "Low-Carb", "Gluten-Free", "yogurt"],
    keywords: ["Greek Yogurt", "Flaxseeds", "Berries", "High-Protein Breakfast", "Healthy Yogurt Bowl"],
    h1ToRemoveRegex: /<h1>Greek\s+Yogurt\s+Bowl\s+with\s+Flaxseeds\s+and\s+Fresh\s+Berries<\/h1>\s*/i
  },
  "grilled-sirloin-steak-recipe": {
    seoTitle: "Perfect Grilled Sirloin Steak Recipe | NutriGuide",
    seoDesc: "Master the art of grilling sirloin steak. Get our easy, expert-approved recipe for a juicy, perfectly grilled sirloin steak every time.",
    tags: ["Keto", "Low-Carb", "Muscle Maintenance", "non-veg", "dinner", "Sirloin Steak", "High-Protein", "grill"],
    keywords: ["Grilled Sirloin Steak", "Sirloin Steak Recipe", "Grilling Sirloin Steak", "Easy Grilled Steak"],
    h1ToRemoveRegex: /<h1>Perfectly\s+Grilled\s+Sirloin\s+Steak:\s+A\s+Guide\s+to\s+Culinary\s+Mastery<\/h1>\s*/i
  },
  "7-day-soy-free-meal-plan": {
    seoTitle: "7-Day Soy-Free Meal Plan & Vegan Reset | NutriGuide",
    seoDesc: "Try our free 7-day soy-free meal plan with 21 delicious vegan recipes, a printable shopping list, and meal prep tips. Perfect dairy & soy free reset.",
    tags: ["Vegan", "Soy-Free", "Gut Health", "Anti-Inflammatory", "Lentils", "Chickpeas", "Hemp Seeds", "breakfast", "lunch", "dinner", "meal-plan"],
    keywords: ["Soy Free Meal Plan", "Soy Free Vegan Diet", "No Tofu Meal Plan", "Soy Free Vegan Reset"],
    h1ToRemoveRegex: /<h1>7-Day\s+Soy-Free\s+Meal\s+Plan:\s+Whole-Food\s+Vegan\s+Recipes\s+&\s+Shopping\s+List<\/h1>\s*/i
  },
  "new-york-strip-steak-recipe": {
    seoTitle: "Pan-Seared New York Strip Steak Recipe | NutriGuide",
    seoDesc: "Learn how to cook the perfect New York strip steak. Get our simple, professional guide to pan-searing restaurant-quality NY strip steak at home.",
    tags: ["Keto", "Low-Carb", "Muscle Maintenance", "non-veg", "dinner", "NY Strip Steak", "Gluten-Free", "pan-seared"],
    keywords: ["New York Strip Steak", "NY Strip Steak Recipe", "Pan Seared Strip Steak", "How to Cook Strip Steak"]
  },
  "creamy-greek-yogurt-with-toasted-sunflower-seeds": {
    seoTitle: "Greek Yogurt with Toasted Sunflower Seeds | NutriGuide",
    seoDesc: "A simple, high-protein breakfast recipe featuring creamy Greek yogurt and golden toasted sunflower seeds. Perfect for a quick, healthy morning start.",
    tags: ["Vegetarian", "Gluten-Free", "Muscle Maintenance", "breakfast", "Greek Yogurt", "Sunflower Seeds", "Anti-Inflammatory"],
    keywords: ["Greek Yogurt Sunflower Seeds", "Yogurt Sunflower Seeds Bowl", "High Protein Breakfast Yogurt"]
  },
  "greek-yogurt-with-toasted-sunflower-seeds": {
    seoTitle: "Greek Yogurt with Toasted Sunflower Seeds | NutriGuide",
    seoDesc: "Discover a great, protein-rich Greek yogurt bowl with toasted sunflower seeds. A healthy, artisan breakfast prepared in minutes.",
    tags: ["breakfast", "Vegetarian", "Gluten-Free", "Greek Yogurt", "Sunflower Seeds", "Muscle Maintenance", "Blood Sugar Balance"],
    keywords: ["Greek Yogurt Sunflower Seeds", "Yogurt Sunflower Seeds Bowl", "High Protein Breakfast Yogurt"]
  },
  "berry-vitality-protein-smoothie": {
    seoTitle: "Berry Vitality Protein Smoothie Recipe | NutriGuide",
    seoDesc: "Energize your morning with our premium berry vitality protein smoothie. A simple, nourishing blend perfect for a healthy, active lifestyle.",
    tags: ["breakfast", "drinks", "veg", "Gluten-Free", "Gut Health", "Muscle Maintenance", "Anti-Inflammatory", "Chia Seeds", "Mixed Berries", "smoothie"],
    keywords: ["Berry Vitality Smoothie", "Berry Protein Smoothie", "Antioxidant Protein Smoothie"]
  },
  "healthy-white-fish-recipes": {
    seoTitle: "Healthy Baked White Fish Recipe & Guide | NutriGuide",
    seoDesc: "Discover our healthy baked white fish recipe. Easy, lemon-herb seasoned white fish fillets baked to tender perfection. Ideal for a quick dinner.",
    tags: ["Gluten-Free", "Dairy-Free", "Low-Carb", "Heart Healthy", "Muscle Maintenance", "White Fish", "non-veg", "dinner", "lunch", "baked-fish"],
    keywords: ["White Fish Recipes", "Healthy Baked Fish", "Lemon Herb White Fish", "Easy Fish Recipe"]
  },
  "greek-yogurt-flaxseed-bowl": {
    seoTitle: "Greek Yogurt Flaxseed Bowl Recipe | NutriGuide",
    seoDesc: "A quick, high-protein breakfast recipe featuring creamy Greek yogurt and flaxseeds. Perfect for sustained energy, gut health, and daily wellness.",
    tags: ["breakfast", "veg", "Vegetarian", "Gluten-Free", "Gut Health", "Greek Yogurt", "Flaxseeds", "Omega-3", "Muscle Maintenance", "yogurt-bowl"],
    keywords: ["Greek Yogurt Flaxseed Bowl", "Flaxseed with Greek Yogurt", "Greek Yogurt Flaxseed Breakfast"],
    h1ToRemoveRegex: /<h1>Greek\s+Yogurt\s+Flaxseed\s+Power\s+Bowl:\s+The\s+Ultimate\s+Morning\s+Ritual<\/h1>\s*/i
  },
  "simple-roasted-salmon-and-broccoli-sheet-pan-dinner": {
    seoTitle: "Roasted Salmon and Broccoli Sheet Pan Dinner | NutriGuide",
    seoDesc: "A quick, healthy one-pan roasted salmon and broccoli sheet pan dinner. Easy to make, high-protein, and delicious for a nourishing weeknight meal.",
    tags: ["Salmon", "Broccoli", "Gluten-Free", "Dairy-Free", "Keto", "Low-Carb", "Heart Healthy", "Anti-Inflammatory", "Muscle Maintenance", "dinner", "non-veg", "sheet-pan"],
    keywords: ["Salmon and Broccoli Sheet Pan", "Roasted Salmon and Broccoli", "Easy Salmon Sheet Pan Dinner", "Healthy Salmon Broccoli Recipe"],
    h1ToRemoveRegex: /<h1>Simple\s+Roasted\s+Salmon\s+and\s+Broccoli\s+Sheet\s+Pan\s+Dinner<\/h1>\s*/i
  }
};

async function main() {
  console.log("🚀 STARTING SEO OPTIMIZATION MIGRATION SCRIPT 🚀");
  console.log("==================================================");
  console.log(`Mode: ${execute ? "🔥 EXECUTE (Production/Local Database will be updated)" : "⚠️ DRY RUN (Simulation)"}`);
  if (!execute) {
    console.log("Tip: Run with '--execute' to save the optimized data to the database.");
  }
  console.log("==================================================\n");

  let updatedCount = 0;

  for (const [slug, pageUpdate] of Object.entries(updates)) {
    console.log(`Checking [${slug}]...`);
    const record = await prisma.content.findUnique({
      where: { slug }
    });

    if (!record) {
      console.log(`❌ Warning: Record with slug "${slug}" not found in the database. Skipping.\n`);
      continue;
    }

    const updateData: any = {};
    let changed = false;

    // Check SEO Title
    if (record.seoTitle !== pageUpdate.seoTitle) {
      updateData.seoTitle = pageUpdate.seoTitle;
      changed = true;
      console.log(`   [SEO TITLE] "${record.seoTitle}" -> "${pageUpdate.seoTitle}"`);
    }

    // Check SEO Description
    if (record.seoDesc !== pageUpdate.seoDesc) {
      updateData.seoDesc = pageUpdate.seoDesc;
      changed = true;
      console.log(`   [SEO DESC] "${record.seoDesc}" -> "${pageUpdate.seoDesc}"`);
    }

    // Check tags
    if (pageUpdate.tags) {
      const currentTags = JSON.parse(record.tags || "[]");
      const tagsDiff = pageUpdate.tags.filter(t => !currentTags.includes(t));
      if (tagsDiff.length > 0 || currentTags.length !== pageUpdate.tags.length) {
        updateData.tags = JSON.stringify(pageUpdate.tags);
        changed = true;
        console.log(`   [TAGS] Updated tags array`);
      }
    }

    // Check keywords
    if (pageUpdate.keywords) {
      const currentKeywords = JSON.parse(record.keywords || "[]");
      const keywordsDiff = pageUpdate.keywords.filter(k => !currentKeywords.includes(k));
      if (keywordsDiff.length > 0 || currentKeywords.length !== pageUpdate.keywords.length) {
        updateData.keywords = JSON.stringify(pageUpdate.keywords);
        changed = true;
        console.log(`   [KEYWORDS] Updated keywords array`);
      }
    }

    // Check duplicate H1 inside HTML body
    if (pageUpdate.h1ToRemoveRegex) {
      const originalBody = record.body;
      const cleanedBody = originalBody.replace(pageUpdate.h1ToRemoveRegex, "");
      if (cleanedBody !== originalBody) {
        updateData.body = cleanedBody;
        changed = true;
        console.log(`   [BODY] Removed duplicate <h1> tag from top of body HTML`);
      }
    }

    if (changed) {
      updatedCount++;
      if (execute) {
        await prisma.content.update({
          where: { id: record.id },
          data: updateData
        });
        console.log(`✅ [UPDATED] Applied changes to "${record.title}"\n`);
      } else {
        console.log(`⚠️ [DRY RUN] Would update "${record.title}"\n`);
      }
    } else {
      console.log(`   (No updates needed)\n`);
    }
  }

  console.log("==================================================");
  console.log(`Migration completed. Total records needing updates: ${updatedCount}`);
  console.log("==================================================");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
