import { PrismaClient } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

function getPrompt(mealPlanTitle, mealPlanBody) {
  return `
You are an expert nutritionist helper. 
I have a meal plan titled "${mealPlanTitle}". Here is the meal plan content:
${mealPlanBody}

Please extract a list of all unique dishes, meals, or recipes mentioned in this meal plan that require a recipe to cook.
For example, extract dishes like "Mushroom egg white omelet", "Quinoa salad with chickpeas", "Roasted chicken with asparagus", "Lentil soup with garden vegetables", "Baked tempeh".
Do not extract simple single-ingredient snacks like "Raw almonds", "Pistachios", "Edamame", "Banana", "Water", "Coffee", or "Protein powder" unless they are part of a cooked dish.

Format your response as a JSON array of strings containing only the dish names.
Example:
[
  "Mushroom Egg White Omelet",
  "Quinoa Salad with Chickpeas",
  "Roasted Chicken with Asparagus",
  "Lentil Soup with Garden Vegetables",
  "Baked Tempeh with Broccoli"
]
`;
}

async function main() {
  console.log("🔍 Fetching existing diet plans from database...");
  
  const dietPlans = await prisma.content.findMany({
    where: {
      type: "DIET_PLAN"
    }
  });

  console.log(`Found ${dietPlans.length} diet plans to process.`);

  for (let i = 0; i < dietPlans.length; i++) {
    const plan = dietPlans[i];
    console.log(`\n[${i + 1}/${dietPlans.length}] Processing "${plan.title}"...`);

    if (!plan.body) {
      console.log("   ⚠️ Empty meal plan body. Skipping.");
      continue;
    }

    try {
      const prompt = getPrompt(plan.title, plan.body);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let text = response.text || "";
      text = text.replace(/```json\n?/, "").replace(/\n?```/, "").trim();
      const dishes = JSON.parse(text);

      if (!Array.isArray(dishes)) {
        console.warn(`   ⚠️ Gemini did not return an array. Response: ${text}`);
        continue;
      }

      console.log(`   Extracted ${dishes.length} dishes.`);

      for (const dish of dishes) {
        const slug = dish.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        
        // Check if a recipe or pending recipe already exists with this title/slug
        const existing = await prisma.content.findFirst({
          where: {
            OR: [
              { title: dish },
              { slug: slug },
              { slug: `${slug}-pending` }
            ]
          }
        });

        if (!existing) {
          await prisma.content.create({
            data: {
              title: dish,
              slug: `${slug}-pending`,
              type: "PENDING_RECIPE",
              excerpt: `Pending recipe extracted from: ${plan.title}`,
              body: "",
              published: false,
              tags: JSON.stringify(["Pending"]),
            }
          });
          console.log(`   ✅ Created pending recipe: ${dish}`);
        } else {
          console.log(`   ⏭️ Skipped (already exists): ${dish}`);
        }
      }

      // Brief delay to prevent rate-limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`   ❌ Failed to process "${plan.title}":`, err.message);
    }
  }

  console.log("\n🏁 Done! All existing diet plans processed successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
