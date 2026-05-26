import { PrismaClient } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

const topics = [
  "Anti-Inflammatory Spice & Herb Matcher",
  "Pre & Post-Workout Nutrition Timing",
  "Superfood Smoothie Builder (Macro-Balanced)",
  "Plant-Based Protein Substitution Matrix",
  "Optimal Sleep & Sleep-Prep Nutrition Guide",
  "Daily Water & Hydration Tracker with Electrolytes",
  "Mediterranean Diet Daily Checklist"
];

function sanitizeContent(text) {
  return text
    .replace(/Stwart Lucas/g, 'Stewart Lucas')
    .replace(/Stwart/g, 'Stewart')
    .trim();
}

function getPrompt(topic) {
  return `
Act as Stewart Lucas, representing NutriGuide. You are the expert culinary coach and nutritionist.
Your tone is warm, clean, encouraging, and deeply professional.
Focus on natural, descriptive language, honest cooking, and practical wellness.
Avoid bulky paragraphs. Use short, punchy, elegant sentences.
Focus on visual descriptions and empowering the reader.
CRITICAL: Do NOT overuse repetitive or dramatic buzzwords such as "cinematic", "artisanal", "moody", "masterclass", "alchemy", "canvas", "ode", "hearth", "resilience", or "curated". Keep the vocabulary natural, grounded, and realistic to avoid sounding repetitive or artificial.

AI Search Optimization (AEO) Guidelines:
1. Direct Answers: Include a "Quick Summary" or "Key Takeaways" at the start.
2. Clear Hierarchy: Use H1 for title, H2 for main sections, H3 for sub-sections.
3. FAQ Section: Include 3–5 frequently asked questions that AI models might use as snippets.
4. Structured Data: Focus on factual accuracy and clear definitions.

Task: Create a premium, highly visual CHEAT SHEET about: "${topic}".

Layout Requirements:
- Use attractive HTML with inline CSS. This must be print-friendly and scannable.
- Open with a 1–2 sentence "Why This Matters" intro — no fluff.
- Use a 2-column comparison or reference table as the primary layout.
- Use colored badge-style labels to categorize items (e.g. "✓ Do", "✗ Avoid", "⚡ Pro Tip").
- Group related items under <h3> sub-headings.
- Add a "Quick Reference Box" — a bordered summary of the 3 most important rules (gold/amber background, #FFFBF0).
- Add a "Common Mistakes" section with a red-tinted row or icon.
- Keep all bullet points to a single line — this is a cheat sheet, not an essay.

Return a single valid JSON object with these exact fields:
{
  "title": "Punchy, action-oriented cheat sheet title",
  "excerpt": "1–2 sentences. Position this as the ultimate quick-reference guide the reader will bookmark forever.",
  "body": "Full HTML content with: Why This Matters intro, Quick Reference Box (top 3 rules), 2-column reference table, categorized sections with badge labels, Common Mistakes section, FAQ (3–5 Qs), and JSON-LD HowTo schema script tag at the end.",
  "seoTitle": "SEO-optimized title under 60 chars",
  "seoDesc": "Compelling meta description under 155 chars",
  "tags": ["tag1", "tag2", "tag3"],
  "schema": "JSON-LD string for HowTo schema markup",
  "coverImagePrompt": "Detailed, professional AI image generation prompt. Flat-lay or minimal style, bright and organized, with relevant food/nutrition props."
}
`;
}

async function main() {
  console.log(`🚀 Seeding the remaining ${topics.length} premium cheat sheets using Gemini API...`);

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    console.log(`\n[${i + 1}/${topics.length}] Generating: "${topic}"...`);
    
    try {
      const prompt = getPrompt(topic);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let text = response.text || "";
      text = sanitizeContent(text);
      
      // Clean markdown code blocks if any
      text = text.replace(/```json\n?/, "").replace(/\n?```/, "").trim();

      const data = JSON.parse(text);

      // Create high-quality cover image URL via Pollinations.ai using coverImagePrompt
      const cleanPrompt = (data.coverImagePrompt || `Professional flat lay photography of ${topic}, bright organic food styling, organized minimalist layout`)
        .replace(/[^a-zA-Z0-9 ,.'\-]/g, "")
        .slice(0, 300);
      const seed = Math.floor(Math.random() * 999999);
      const coverImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1200&height=800&seed=${seed}&nologo=true`;

      const slug = data.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + "-" + Math.random().toString(36).substring(2, 7);

      const content = await prisma.content.create({
        data: {
          title: data.title,
          slug: slug,
          type: "CHEAT_SHEET",
          excerpt: data.excerpt,
          body: data.body,
          coverImage: coverImageUrl,
          coverImagePrompt: data.coverImagePrompt,
          tags: JSON.stringify(data.tags || ["guide", "nutrition"]),
          seoTitle: data.seoTitle,
          seoDesc: data.seoDesc,
          schema: typeof data.schema === 'object' ? JSON.stringify(data.schema) : (data.schema || null),
          published: true,
        }
      });

      console.log(`✨ Successfully seeded: "${content.title}" (slug: ${content.slug})`);
      
      // Delay to avoid rate-limiting
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.error(`❌ Failed to generate "${topic}":`, e.message);
    }
  }

  console.log("\n🏁 Seeding complete! Database holds all remaining premium cheat sheets.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
