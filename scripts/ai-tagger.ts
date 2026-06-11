import { PrismaClient } from "@prisma/client";
import { getGeminiResponse } from "../lib/ai";

const prisma = new PrismaClient();

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
  console.log("🚀 Starting AI-powered content tagging...");

  // Fetch all content items
  const contentItems = await prisma.content.findMany({
    orderBy: { createdAt: "desc" }
  });

  console.log(`Found ${contentItems.length} content items to analyze and tag.`);

  for (let i = 0; i < contentItems.length; i++) {
    const item = contentItems[i];
    console.log(`\n[${i + 1}/${contentItems.length}] Analyzing: "${item.title}" (Type: ${item.type})`);

    // Clean body text (remove HTML tags for better AI parsing and token savings)
    const cleanBody = (item.body || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 3000); // Take first 3000 chars

    const cleanExcerpt = (item.excerpt || "").slice(0, 500);

    // Construct AI Prompt
    const prompt = `
You are an expert SEO metadata and taxonomy specialist for a premium health and cooking website called NutriGuide.
Analyze the following content title, excerpt, and body text:

Title: "${item.title}"
Type: "${item.type}"
Excerpt: "${cleanExcerpt}"
Body: "${cleanBody}"

Generate a list of exactly 5 to 10 highly relevant keywords/tags for this content.
Follow these rules:
1. Include dietary profile tags where applicable (e.g. "Vegan", "Vegetarian", "Gluten-Free", "Keto", "Dairy-Free", "Low-Carb", "Sugar-Free").
2. Include health focus or benefit tags (e.g. "Gut Health", "Microbiome", "Weight Loss", "Muscle Maintenance", "Biohacking", "Heart Healthy", "Anti-Inflammatory").
3. Include primary ingredients if it is a recipe (e.g. "Lentils", "Chia Seeds", "Salmon", "Tandoori Chicken").
4. Classify it into one or more of these specific category tags if they fit: "breakfast", "lunch", "dinner", "veg", "non-veg", "drinks", "snacks", "desserts".
5. Keep tag casing professional (e.g., "Gut Health", "Gluten-Free", "breakfast", "non-veg").
6. Do NOT include generic tags like "Recipe" or "Healthy" or "Nutrition".

Return ONLY a JSON array of strings.
Example: ["Gut Health", "Vegan", "Microbiome", "breakfast", "veg"]
`;

    try {
      // Call Gemini in JSON mode
      const responseText = await getGeminiResponse(prompt, true);
      let tags: string[] = JSON.parse(responseText);

      if (Array.isArray(tags)) {
        // Clean up tags
        tags = tags
          .map(t => t.trim())
          .filter(t => t.length > 0 && t.toLowerCase() !== "recipe" && t.toLowerCase() !== "healthy");

        console.log(`- Generated Tags: ${JSON.stringify(tags)}`);

        // Save tags in database (both in tags field and keywords field to align SEO metadata)
        await prisma.content.update({
          where: { id: item.id },
          data: {
            tags: JSON.stringify(tags),
            keywords: JSON.stringify(tags)
          }
        });
      } else {
        console.warn(`- Failed to parse tags (not an array): ${responseText}`);
      }
    } catch (err: any) {
      console.error(`- Error processing "${item.title}":`, err.message);
    }

    // Rate limiting delay (1 second between API calls)
    await delay(1000);
  }

  console.log("\n✅ AI content tagging completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
