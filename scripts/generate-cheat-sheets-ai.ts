import { PrismaClient } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";
import { getCheatSheetPrompt } from "../lib/prompts";
import { saveAndCompressImage } from "../lib/image-utils";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const topics = [
  "Keto Grocery List",
  "Calorie Deficit Guide",
  "Meal Prep Sunday",
  "High Protein Foods",
  "Intermittent Fasting",
  "PCOS Food Guide",
  "Anti-Inflammatory Foods",
  "Macro Counting",
  "Gluten-Free Swaps",
  "Mediterranean Pantry",
  "Gut Health Foods",
  "Sleep & Nutrition",
  "Diabetic-Friendly Swaps",
  "Weight Loss Portion Guide",
  "Hydration Guide"
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

  console.log(`🚀 Cheat Sheet Generation Script`);
  console.log(`Mode: ${isFull ? "FULL (15 items)" : "TEST ONLY (1 item)"}`);
  console.log(`Topics count: ${runTopics.length}`);

  // Delete dummy generated cheat sheets if any (to keep DB clean)
  const deletedDummies = await prisma.content.deleteMany({
    where: {
      type: "CHEAT_SHEET",
      title: { contains: "Generated Content" }
    }
  });
  if (deletedDummies.count > 0) {
    console.log(`🧹 Deleted ${deletedDummies.count} dummy generated cheat sheets.`);
  }

  for (let i = 0; i < runTopics.length; i++) {
    const topic = runTopics[i];
    console.log(`\n[${i + 1}/${runTopics.length}] Generating cheat sheet: "${topic}"...`);
    
    try {
      const prompt = getCheatSheetPrompt(topic);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
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
      const cleanPrompt = (data.coverImagePrompt || `Professional food photography of ${topic}, flat-lay style, bright nutrition props`)
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
          type: "CHEAT_SHEET",
          excerpt: data.excerpt,
          body: data.body,
          coverImage: localUrl,
          coverImagePrompt: data.coverImagePrompt,
          tags: JSON.stringify(data.tags || ["cheatsheet", "guide"]),
          seoTitle: data.seoTitle,
          seoDesc: data.seoDesc,
          schema: typeof data.schema === 'object' ? JSON.stringify(data.schema) : (data.schema || null),
          published: true,
        }
      });

      console.log(`✨ Successfully created cheat sheet: "${content.title}" (slug: ${content.slug})`);
      
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
