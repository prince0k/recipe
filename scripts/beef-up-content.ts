import { PrismaClient } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

const BRAND_VOICE = `
Act as Stewart Lucas, representing NutriGuide. You are the expert culinary coach and nutritionist.
Your tone is warm, clean, encouraging, and deeply professional.
Focus on natural, descriptive language, honest cooking, and practical wellness.
Avoid bulky paragraphs. Use short, punchy, elegant sentences.
Focus on visual descriptions and empowering the reader.
CRITICAL: Do NOT overuse repetitive or dramatic buzzwords such as "cinematic", "artisanal", "moody", "masterclass", "alchemy", "canvas", "ode", "hearth", "resilience", or "curated". Keep the vocabulary natural, grounded, and realistic to avoid sounding repetitive or artificial.
`;

const AEO_GUIDELINES = `
AI Search Optimization (AEO) Guidelines:
1. Direct Answers: Include a "Quick Summary" or "Key Takeaways" at the start.
2. Clear Hierarchy: Use H1 for title, H2 for main sections, H3 for sub-sections.
3. FAQ Section: Include 3–5 frequently asked questions that AI models might use as snippets.
4. Structured Data: Focus on factual accuracy and clear definitions.
`;

// Helper to count words by stripping HTML tags
function countWords(htmlString: string): number {
  if (!htmlString) return 0;
  const textOnly = htmlString.replace(/<[^>]*>?/gm, " ").trim();
  const words = textOnly.split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

function sanitizeContent(text: string): string {
  return text
    .replace(/Stwart Lucas/g, 'Stewart Lucas')
    .replace(/Stwart/g, 'Stewart')
    .trim();
}

async function main() {
  const args = process.argv.slice(2);
  const execute = args.includes("--execute");
  const limitArg = args.find(arg => arg.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1]) : 5;
  const slugArg = args.find(arg => arg.startsWith("--slug="));
  const targetSlug = slugArg ? slugArg.split("=")[1] : null;

  console.log("🚀 NUTRIGUIDE CONTENT EXPANSION (BEEF-UP) TOOL 🚀");
  console.log("==================================================");
  console.log(`Mode: ${execute ? "🔥 EXECUTE (Database will be updated)" : "⚠️ DRY RUN (Simulated check)"}`);
  console.log(`Batch Limit: ${limit} items`);
  if (targetSlug) {
    console.log(`Targeting Slug: ${targetSlug}`);
  }
  if (!execute) {
    console.log("Tip: Run with '--execute' to save the expanded content back to the database.");
  }
  console.log("==================================================\n");

  // Build query
  const where: any = {
    type: { not: "PENDING_RECIPE" }
  };
  
  if (targetSlug) {
    where.slug = targetSlug;
  }

  const items = await prisma.content.findMany({ where });
  
  // Filter for thin items (< 800 words)
  const thinItems = items.filter(item => {
    const words = countWords(item.body);
    return words < 800;
  });

  console.log(`Found ${thinItems.length} thin content items (< 800 words) in total.`);
  const batch = thinItems.slice(0, limit);
  console.log(`Selected batch of ${batch.length} items to expand.\n`);

  for (let i = 0; i < batch.length; i++) {
    const item = batch[i];
    const originalWords = countWords(item.body);
    console.log(`[${i + 1}/${batch.length}] Processing [${item.type}] "${item.title}"...`);
    console.log(`    Current length: ${originalWords} words`);
    console.log(`    Slug:           /${item.type.toLowerCase().replace('_', '-')}/${item.slug}`);

    const prompt = `
${BRAND_VOICE}
${AEO_GUIDELINES}

You are Stewart Lucas, Certified Nutritionist & Culinary Coach.
I need you to expand and "beef up" the following thin content recipe/post to make it extremely in-depth, helpful, and SEO-friendly (target: 800–1200+ words).

Title: "${item.title}"
Type: "${item.type}"

Current Body:
"""
${item.body}
"""

Instructions:
1. Rewrite and expand the current HTML body.
2. Keep the original ingredients list and the core cooking steps, but format them beautifully using clean inline-CSS HTML.
3. Add the following detailed sections to reach the 800-1200+ word target:
   - **Introduction**: A detailed, engaging, story-driven intro about the dish, its origin, and why it's perfect for a healthy lifestyle.
   - **Nutritional Science & Benefits**: Explain the health benefits of the key ingredients (e.g., healthy fats, fiber, lean protein, antioxidants) and how they support body wellness.
   - **Stewart's Culinary Coaching Tips**: Share professional chef tips for getting the perfect texture, flavor balance, or cooking technique.
   - **Meal Prep & Storage Guide**: Explain how to store leftovers (fridge/freezer life), reheat them without losing texture, or prep components in advance.
   - **Flavor Variations**: Provide 3-4 creative swaps (e.g., low-carb alternatives, protein swaps, vegan/vegetarian options).
   - **FAQ Section**: Include 3-5 frequently asked questions and direct answers that users might search for (formatted as real search queries).
4. Output the result as a single valid JSON object containing only the "body" key with the full expanded escaped HTML content as its value. Do not wrap in markdown code blocks or add any other text outside the JSON.

JSON Format:
{
  "body": "Full expanded HTML content..."
}
`;

    if (execute) {
      try {
        console.log(`    Calling Gemini API to expand content...`);
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });

        let text = response.text || "";
        text = sanitizeContent(text);
        text = text.replace(/```json\n?/, "").replace(/\n?```/, "").trim();

        let data: any;
        try {
          data = JSON.parse(text);
        } catch (jsonErr: any) {
          try {
            // Remove control characters (e.g. raw tabs, newlines inside string values)
            const cleanText = text
              .replace(/[\u0000-\u0019]+/g, " ")
              .trim();
            data = JSON.parse(cleanText);
          } catch (secondErr) {
            console.error("Raw response that failed to parse:\n", text.substring(0, 500) + "...\n");
            throw jsonErr;
          }
        }
        const expandedBody = data.body;
        const newWords = countWords(expandedBody);

        if (newWords < 800) {
          console.warn(`    ⚠️ Generated content is only ${newWords} words. Retrying with explicit demand...`);
        }

        await prisma.content.update({
          where: { id: item.id },
          data: { body: expandedBody }
        });

        console.log(`    ✅ Successfully expanded: ${originalWords} ➔ ${newWords} words!\n`);
      } catch (err: any) {
        console.error(`    ❌ Failed to expand "${item.title}":`, err.message);
      }

      // Small delay to prevent rate limits
      await new Promise(r => setTimeout(r, 2000));
    } else {
      console.log(`    [DRY RUN] Would expand from ${originalWords} to 800+ words.\n`);
    }
  }

  console.log("==================================================");
  console.log("Batch run finished.");
  console.log("==================================================\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
