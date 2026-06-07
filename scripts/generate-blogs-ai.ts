import { PrismaClient } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";
import { getBlogPrompt } from "../lib/prompts";
import { saveAndCompressImage } from "../lib/image-utils";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const topics = [
  "The Science of Meal Prepping: Save Time and Eat Better",
  "Macro Counting 101: A Beginner's Guide to Protein, Carbs, and Fats",
  "Gut Health Hacks: 5 Foods to Improve Digestion and Reduce Bloating",
  "How to Master High-Protein Vegetarian Cooking",
  "The Truth About Cravings: How to Manage Them Without Restricting Yourself",
  "Inflammation-Busting Ingredients to Add to Your Daily Meals",
  "Clean Eating vs. Diet Culture: How to Build a Healthy Relationship with Food",
  "Intermittent Fasting: Benefits, Challenges, and How to Get Started",
  "How to Optimize Your Nutrition for Better Quality Sleep",
  "Smart Swaps: Simple Ingredient Changes for Healthier Home-Cooked Meals",
  "Hydration Science: Why Water Alone Isn't Enough for Performance",
  "Pre and Post Workout Nutrition: What to Eat Before and After Exercise",
  "Unlocking Energy: Foods That Combat Daily Fatigue and Brain Fog",
  "Healthy Eating on a Budget: Meal Prep Tips Under $5 a Day",
  "The Mediterranean Way: Eating for Longevity and Heart Health"
];

function sanitizeContent(text: string) {
  return text
    .replace(/Stwart Lucas/g, 'Stewart Lucas')
    .replace(/Stwart/g, 'Stewart')
    .trim();
}

async function main() {
  const isFull = process.env.FULL_GENERATION === "true";
  const runTopics = isFull ? topics : [topics[0]];

  console.log(`🚀 Blog Generation Script`);
  console.log(`Mode: ${isFull ? "FULL (15 items)" : "TEST ONLY (1 item)"}`);
  console.log(`Topics count: ${runTopics.length}`);

  // Delete dummy generated blogs if any (to keep DB clean)
  const deletedDummies = await prisma.content.deleteMany({
    where: {
      type: "BLOG",
      title: { contains: "Generated Content" }
    }
  });
  if (deletedDummies.count > 0) {
    console.log(`🧹 Deleted ${deletedDummies.count} dummy generated blogs.`);
  }

  for (let i = 0; i < runTopics.length; i++) {
    const topic = runTopics[i];
    console.log(`\n[${i + 1}/${runTopics.length}] Generating blog: "${topic}"...`);
    
    try {
      const prompt = getBlogPrompt(topic);
      const modelsToTry = ["gemini-3.1-flash-lite", "gemini-2.5-flash-lite"];
      let text = "";
      for (const modelName of modelsToTry) {
        let retries = 2;
        while (retries > 0) {
          try {
            console.log(`Calling Gemini API (${modelName}) (attempts remaining: ${retries})...`);
            const response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                responseMimeType: "application/json",
              }
            });
            text = response.text || "";
            break;
          } catch (err: any) {
            retries--;
            if (retries === 0) {
              if (modelName === modelsToTry[modelsToTry.length - 1]) throw err;
              console.warn(`⚠️ ${modelName} failed completely. Falling back to next model...`);
              break;
            }
            console.warn(`⚠️ Gemini API (${modelName}) failed: ${err.message}. Retrying in 5 seconds...`);
            await new Promise(r => setTimeout(r, 5000));
          }
        }
        if (text) break;
      }
      text = sanitizeContent(text);
      
      // Clean markdown code blocks if any
      text = text.replace(/```json\n?/, "").replace(/\n?```/, "").trim();

      const data = JSON.parse(text);

      const slug = data.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + "-" + Math.random().toString(36).substring(2, 7);

      // Generate cover image via Pollinations first as a placeholder, then we'll localize/compress it
      const cleanPrompt = (data.coverImagePrompt || `Professional food photography of ${topic}, bright nutrition props, soft natural lighting`)
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
          type: "BLOG",
          excerpt: data.excerpt,
          body: data.body,
          coverImage: localUrl,
          coverImagePrompt: data.coverImagePrompt,
          tags: JSON.stringify(data.tags || ["blog", "nutrition"]),
          seoTitle: data.seoTitle,
          seoDesc: data.seoDesc,
          schema: typeof data.schema === 'object' ? JSON.stringify(data.schema) : (data.schema || null),
          published: true,
        }
      });

      console.log(`✨ Successfully created blog: "${content.title}" (slug: ${content.slug})`);
      
      // Delay to avoid rate-limiting
      if (runTopics.length > 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (e: any) {
      console.error(`❌ Failed to generate "${topic}":`, e.message);
    }
  }

  console.log("\n🏁 Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
