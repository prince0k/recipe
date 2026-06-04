import { PrismaClient } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const BRAND_VOICE = `
Act as Stewart Lucas, representing NutriGuide. You are the expert culinary coach and nutritionist.
Your tone is warm, clean, encouraging, conversational, and deeply professional.
Focus on writing like a real, passionate, and experienced human cook and nutritionist.
Use descriptive, natural language, honest cooking insights, and practical wellness tips.
Avoid bulky paragraphs. Use short, punchy, elegant sentences.
When describing cooking, focus on sensory details (e.g., the aroma of roasting garlic, the sizzle of the pan, the rich colors of fresh produce) to make the content feel alive, relatable, and authentic.
Do NOT sound robotic, academic, or preachy. Avoid clinical explanations of simple kitchen terms.

CRITICAL CONTENT DEPTH RULES (ADSENSE ELIGIBILITY):
- Generate highly detailed, comprehensive content. Each page/post MUST have a target length of 800 to 1500+ words of helpful, original text.
- Do NOT write short, superficial summaries or stub articles. Expand on every point with detailed nutrition science, step-by-step guidance, prep advice, and FAQs.

CRITICAL: Do NOT overuse repetitive or dramatic buzzwords and clichés: "cinematic", "artisanal", "moody", "masterclass", "alchemy", "canvas", "ode", "hearth", "resilience", "curated", "delve", "tapestry", "moreover", "testament", "beacon", "treasure trove", "embark", "journey", "not only... but also", "in conclusion", "furthermore", "look no further". Keep the vocabulary natural, grounded, and realistic to avoid sounding repetitive or artificial.
`;

const AEO_GUIDELINES = `
AI Search Optimization (AEO) Guidelines:
1. Direct Answers: Include a "Quick Summary" or "Key Takeaways" at the start.
2. Clear Hierarchy: Use H1 for title, H2 for main sections, H3 for sub-sections.
3. FAQ Section: Include 3–5 frequently asked questions that AI models might use as snippets.
4. Structured Data: Focus on factual accuracy and clear definitions.
`;

const JSON_FORMATTING_RULES = `
CRITICAL JSON FORMATTING RULES:
1. Return a single valid JSON object containing only the "body" key with the full expanded HTML content as its value.
2. Do NOT wrap the JSON output in markdown code blocks. Return only the raw JSON.
3. Inside the HTML content (in the "body" key value), you MUST use SINGLE QUOTES (') for all HTML attributes (e.g. style='background: #FFF8F0;' or class='tip-box'). Never use double quotes inside HTML attributes.
4. Ensure all double quotes inside text values are escaped as \\".
5. Do NOT output raw control characters (tabs, raw carriage returns, raw vertical tabs, or raw backslashes) inside the JSON value. Use \\n for newlines.
`;

const DESIGN_THEME = `
CRITICAL HTML DESIGN GUIDELINES:
The generated HTML body will be inserted inside a prose container on a warm-toned website. You MUST match the existing design system. The following rules are MANDATORY:

COLOR PALETTE (USE ONLY THESE COLORS):
- Primary (Deep Red):       #8B0000
- Primary Dark:             #660000
- Secondary (Burnt Orange): #B35412
- Accent (Soft Yellow):     #F4D03F
- Background (Warm White):  #FAF9F6
- Surface (Beige):          #F5F5DC
- Olive:                    #556B2F
- Text (Earthy Dark Brown): #2C1E11
- Text Muted:               #5D4037
- Border:                   #E0D4C3

HEADING RULES:
- Do NOT apply any inline color, font, or style to <h2> or <h3> tags. Leave them plain (e.g. <h2>Section Title</h2>). The website CSS styles them automatically.
- Do NOT use green, teal, blue, red, or any bright colors on headings.

CALLOUT / TIP BOXES:
- "Stewart's Secret" or coaching tip box: style='background: #F5F5DC; border-left: 4px solid #8B0000; padding: 16px 20px; margin: 24px 0; border-radius: 8px;'
- Science or nutrition fact box: style='background: #FAF9F6; border: 1px solid #E0D4C3; padding: 16px 20px; margin: 24px 0; border-radius: 8px;'
- Warning or "avoid" box: style='background: #FAF9F6; border-left: 4px solid #B35412; padding: 16px 20px; margin: 24px 0; border-radius: 8px;'
- Quick Summary / Key Takeaways box: style='background: #F5F5DC; border: 1px solid #E0D4C3; padding: 16px 20px; margin: 24px 0; border-radius: 8px;'

TABLE STYLING:
- Do NOT add inline styles to tables. Use plain <table>, <thead>, <tbody>, <tr>, <th>, <td> tags. The website has global CSS that styles all tables automatically.

GENERAL RULES:
- Body text paragraphs: Do NOT apply inline color styles. Leave <p> tags unstyled.
- Lists: Do NOT apply inline color styles.
- Links: Use style='color: #8B0000; text-decoration: underline;' if needed.
- Horizontal rules: style='border: none; border-top: 1px solid #E0D4C3; margin: 32px 0;'
- FAQ accordion: Use <details><summary> tags with no inline styles.
- Do NOT use any bright colors (green #10B981, teal #0D9488, blue #3B82F6, etc.). Stick to the earthy palette above.
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
${JSON_FORMATTING_RULES}
${DESIGN_THEME}

You are Stewart Lucas, Certified Nutritionist & Culinary Coach.
I need you to expand and "beef up" the following thin content recipe/post to make it extremely humanized, in-depth, helpful, and SEO-friendly (target: 800–1200+ words).

Title: "${item.title}"
Type: "${item.type}"

Current Body:
"""
${item.body}
"""

Instructions:
1. Rewrite and expand the current HTML body.
2. Keep the original ingredients list and the core cooking steps, but format them beautifully using clean HTML following the DESIGN THEME rules above. Use SINGLE QUOTES (') for all HTML attributes.
3. Write in an authentic, natural, human voice. Incorporate sensory details (smells, textures, pan sounds) and personal cooking experiences.
4. Use plain <h2> and <h3> tags for section headings — do NOT add any inline styles to headings.
5. Use the themed callout box styles for tip boxes, fact boxes, and warning boxes.
6. Use plain <table> tags for any tables — do NOT add inline styles to tables.
7. Add the following detailed sections to reach the 800-1200+ word target:
   - **Introduction**: A detailed, engaging, human story-driven intro about the dish, its origin, and why it's perfect for a healthy lifestyle.
   - **Nutritional Science & Benefits**: Explain the health benefits of the key ingredients inside a themed fact box.
   - **Stewart's Culinary Coaching Tips**: Share professional chef tips inside the themed tip box.
   - **Meal Prep & Storage Guide**: Explain how to store leftovers (fridge/freezer life), reheat them without losing texture, or prep components in advance.
   - **Flavor Variations**: Provide 3-4 creative swaps (e.g., low-carb alternatives, protein swaps, vegan/vegetarian options).
   - **FAQ Section**: Include 3-5 frequently asked questions using <details><summary> accordion format.
8. Output the result as a single valid JSON object matching the CRITICAL JSON FORMATTING RULES.

JSON Format:
{
  "body": "Full expanded HTML content..."
}
`;

    if (execute) {
      try {
        let text = "";
        try {
          console.log(`    Calling Gemini API to expand content...`);
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            }
          });
          text = response.text || "";
        } catch (geminiErr: any) {
          console.warn(`    ⚠️ Gemini API failed: ${geminiErr.message}. Trying OpenAI fallback...`);
          if (process.env.OPENAI_API_KEY) {
            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [{ role: "user", content: prompt }],
              response_format: { type: "json_object" }
            });
            text = completion.choices[0]?.message?.content || "";
          } else {
            throw geminiErr;
          }
        }

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
