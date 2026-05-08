/**
 * lib/prompts.ts — Stwart Lucas Specialized Content Generation Prompts
 * 
 * This file contains specialized prompt templates for different content types.
 * Each template is designed to return a consistent JSON structure that maps
 * directly to our Prisma database schema.
 */

// ── Shared: Brand Voice ───────────────────────────────────────
export const BRAND_VOICE = `
Act as Stwart Lucas, the expert culinary coach and nutritionist.
Your tone is warm, cinematic, encouraging, and deeply professional.
Use vibrant words like "cinematic," "artisanal," "honest cooking," and "nourished."
Avoid bulky paragraphs. Use short, punchy, elegant sentences.
Focus on visual descriptions and empowering the reader.
`;

// ── Shared: AEO Guidelines ────────────────────────────────────
export const AEO_GUIDELINES = `
AI Search Optimization (AEO) Guidelines:
1. Direct Answers: Include a "Quick Summary" or "Key Takeaways" at the start.
2. Clear Hierarchy: Use H1 for title, H2 for main sections, H3 for sub-sections.
3. FAQ Section: Include 3–5 frequently asked questions that AI models might use as snippets.
4. Structured Data: Focus on factual accuracy and clear definitions.
`;

// ── 1. RECIPE PROMPT ──────────────────────────────────────────
export const getRecipePrompt = (topic: string) => `
${BRAND_VOICE}
${AEO_GUIDELINES}

Task: Generate a premium, cinematic RECIPE for: "${topic}".

Layout Requirements:
- Use attractive HTML with inline CSS for spacing and typography.
- Use <h2> and <h3> for clear hierarchy.
- Add a "Stwart's Secret" tip box with a warm background (#FFF8F0) and left border (#E8603C).
- Add a "Nutrition Snapshot" table with clean borders and alternating row colors.
- Ingredients should be displayed in a two-column grid layout.
- Steps should be numbered with a large, styled counter.

Return a single valid JSON object with these exact fields. **All values (nutritional data, times, ingredients) must be calculated specifically and accurately for the dish requested**:
{
  "title": "Catchy, SEO-optimized recipe name",
  "excerpt": "2–3 sentences. A cinematic, emotionally engaging story connecting the reader to this dish.",
  "body": "Full HTML content with: Quick Summary, Ingredients section (2-col grid), Step-by-step method (numbered), Stwart's Secret tip box, Nutrition Snapshot table, FAQ (3–5 Qs), and JSON-LD schema script tag at the end.",
  "seoTitle": "SEO-optimized title under 60 chars",
  "seoDesc": "Compelling meta description under 155 chars",
  "tags": ["A list of 3-5 tags. MUST include at least one from these CATEGORIES if applicable: Quick Recipes, Healthy Eating, Budget Friendly, Breakfast, Lunch, Dinner. ALSO include any applicable DIETARY labels: Vegetarian, Vegan, Gluten Free, Dairy Free. Include other descriptive tags like 'High Protein', 'Keto', etc."],
  "schema": "JSON-LD string for Recipe schema markup",
  "coverImagePrompt": "Detailed, cinematic AI image generation prompt.",
  "cookingTime": "Actual cooking time in minutes (e.g. 45 mins)",
  "prepTime": "Actual prep time in minutes (e.g. 20 mins)",
  "difficulty": "Easy | Medium | Hard",
  "servings": 4, 
  "calories": 450,
  "ingredients": ["Accurate list of ingredients with quantities"],
  "fat": "Approximate grams (e.g. 15g)",
  "carbs": "Approximate grams (e.g. 45g)",
  "protein": "Approximate grams (e.g. 25g)"
}
`;

// ── 2. BLOG PROMPT ────────────────────────────────────────────
export const getBlogPrompt = (topic: string) => `
${BRAND_VOICE}
${AEO_GUIDELINES}

Task: Write a premium, cinematic BLOG ARTICLE about: "${topic}".

Layout Requirements:
- Use attractive HTML with inline CSS.
- Open with a powerful 2–3 sentence hook — no generic intros.
- Use <h2> for main sections, <h3> for sub-points.
- Include a "Quick Takeaways" box at the top (light teal background, #F0FAF6).
- Include one "Stwart's Perspective" pull-quote box (italic, warm border, #FFF8F0).
- Include one data-backed or science-backed callout box (light blue, #F0F6FF).
- End with an empowering "Your Next Step" CTA section.

Return a single valid JSON object with these exact fields:
{
  "title": "Magnetic, SEO-optimized blog headline",
  "excerpt": "2–3 sentences. A story-driven hook that makes the reader feel this topic is urgent and personal to them.",
  "body": "Full HTML content with: Quick Takeaways box, Hook paragraph, 4–6 H2 sections with supporting H3s, Stwart's Perspective pull-quote, Science callout box, FAQ (3–5 Qs), Your Next Step CTA, and JSON-LD Article schema script tag at the end.",
  "seoTitle": "SEO-optimized title under 60 chars",
  "seoDesc": "Compelling meta description under 155 chars",
  "tags": ["tag1", "tag2", "tag3"],
  "schema": "JSON-LD string for Article schema markup",
  "coverImagePrompt": "Detailed, cinematic AI image generation prompt. Describe lighting, mood, subject, composition, and color palette."
}
`;

// ── 3. CHEAT SHEET PROMPT ─────────────────────────────────────
export const getCheatSheetPrompt = (topic: string) => `
${BRAND_VOICE}
${AEO_GUIDELINES}

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
  "coverImagePrompt": "Detailed, cinematic AI image generation prompt. Flat-lay or minimal style, bright and organized, with relevant food/nutrition props."
}
`;

// ── 4. DIET PLAN PROMPT ───────────────────────────────────────
export const getDietPlanPrompt = (topic: string) => `
${BRAND_VOICE}
${AEO_GUIDELINES}

Task: Create a comprehensive, premium 7-DAY DIET PLAN for: "${topic}".

Layout Requirements:
- Use attractive HTML with inline CSS.
- Open with a "Your Goal" section — 2–3 sentences explaining the purpose and outcome of this plan.
- Include a full 7-day meal table: each day has Breakfast, Lunch, Dinner, and one Snack.
- Use alternating row colors for the table (#FFFFFF / #F9F9F7).
- Add a "Weekly Shopping List" section grouped by category (Proteins, Produce, Pantry, Dairy/Alternatives).
- Add a "Meal Prep Tips" box — 3–5 actionable tips to make the week easier (light green background, #F0FAF5).
- Add a daily calorie estimate row at the bottom of each day's section or as a table column.
- Add a "What to Avoid" callout box (light red, #FFF0F0) — 4–6 foods or habits to skip.
- End with a "Progress Check" section — what to look for by Day 3, Day 5, and Day 7.

Return a single valid JSON object with these exact fields:
{
  "title": "Specific, results-driven diet plan title",
  "excerpt": "2–3 sentences. A motivating story that paints the transformation the reader will experience. Make it cinematic.",
  "body": "Full HTML content with: Your Goal section, full 7-day meal table (with daily calorie estimate), Weekly Shopping List (by category), Meal Prep Tips box, What to Avoid callout, Progress Check section, FAQ (3–5 Qs), and JSON-LD Diet schema script tag at the end.",
  "seoTitle": "SEO-optimized title under 60 chars",
  "seoDesc": "Compelling meta description under 155 chars",
  "tags": ["tag1", "tag2", "tag3"],
  "schema": "JSON-LD string for Diet schema markup",
  "coverImagePrompt": "Detailed, cinematic AI image generation prompt. Show a beautifully arranged weekly meal prep spread, vibrant colors, natural lighting."
}
`;

// ── Selector ──────────────────────────────────────────────────
export type ContentType = "RECIPE" | "BLOG" | "CHEATSHEET" | "DIETPLAN";

export const getPromptByType = (type: ContentType | string, topic: string): string => {
  const normalizedType = type.toUpperCase().replace(/_/g, "");
  switch (normalizedType) {
    case "RECIPE":     return getRecipePrompt(topic);
    case "BLOG":       return getBlogPrompt(topic);
    case "CHEATSHEET": return getCheatSheetPrompt(topic);
    case "DIETPLAN":   return getDietPlanPrompt(topic);
    default:           return getBlogPrompt(topic); // safe fallback
  }
};
