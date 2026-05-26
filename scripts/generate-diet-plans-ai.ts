import { PrismaClient } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";
import { getDietPlanPrompt } from "../lib/prompts";
import { saveAndCompressImage } from "../lib/image-utils";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const topics = [
  "7-Day Anti-Inflammatory Diet Plan",
  "High-Protein Vegetarian Diet Plan",
  "Keto Diet Plan for Beginners",
  "Low-FODMAP Gut Healing Diet Plan",
  "Mediterranean Diet Plan for Heart Health",
  "Gluten-Free Performance Meal Plan",
  "Budget-Friendly Meal Prep Diet Plan",
  "Intermittent Fasting & Electrolyte Meal Plan",
  "Low-Glycemic Insulin Resistance Diet Plan",
  "Clean Eating Plant-Based Meal Plan"
];

function sanitizeContent(text: string) {
  return text
    .replace(/Stwart Lucas/g, 'Stewart Lucas')
    .replace(/Stwart/g, 'Stewart')
    .trim();
}

async function main() {
  console.log(`🚀 Generating ${topics.length} premium diet plans using Gemini API...`);

  // First, clean up dummy generated diet plans if any
  const deletedDummies = await prisma.content.deleteMany({
    where: {
      type: "DIET_PLAN",
      title: { contains: "Generated Content" }
    }
  });
  console.log(`🧹 Deleted ${deletedDummies.count} dummy generated diet plans.`);

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    console.log(`\n[${i + 1}/${topics.length}] Generating: "${topic}"...`);
    
    try {
      const prompt = getDietPlanPrompt(topic);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let text = response.text || "";
      text = sanitizeContent(text);
      
      // Clean markdown code blocks if any
      text = text.replace(/```json\n?/, "").replace(/\n?```/, "").trim();

      const data = JSON.parse(text);

      const slug = data.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + "-" + Math.random().toString(36).substring(2, 7);

      // Generate cover image via Pollinations first as a placeholder, then we'll localize/compress it!
      const cleanPrompt = (data.coverImagePrompt || `Professional food photography of ${topic}, professional lighting, healthy dining`)
        .replace(/[^a-zA-Z0-9 ,.'\-]/g, "")
        .slice(0, 300);
      const seed = Math.floor(Math.random() * 999999);
      const remoteUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1200&height=800&seed=${seed}&nologo=true`;

      console.log(`Localizing and compressing cover image...`);
      const localUrl = await saveAndCompressImage(remoteUrl, data.title);

      const content = await prisma.content.create({
        data: {
          title: data.title,
          slug: slug,
          type: "DIET_PLAN",
          excerpt: data.excerpt,
          body: data.body,
          coverImage: localUrl,
          coverImagePrompt: data.coverImagePrompt,
          tags: JSON.stringify(data.tags || ["diet", "health"]),
          seoTitle: data.seoTitle,
          seoDesc: data.seoDesc,
          schema: typeof data.schema === 'object' ? JSON.stringify(data.schema) : (data.schema || null),
          published: true,
        }
      });

      console.log(`✨ Successfully created: "${content.title}" (slug: ${content.slug})`);
      
      // Delay to avoid rate-limiting
      await new Promise(r => setTimeout(r, 1000));
    } catch (e: any) {
      console.error(`❌ Failed to generate "${topic}":`, e.message);
    }
  }

  console.log("\n🏁 Seeding complete! Database holds all remaining premium diet plans.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
