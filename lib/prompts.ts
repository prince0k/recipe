/**
 * lib/prompts.ts — NutriGuide by Stewart Lucas Specialized Content Generation Prompts
 * 
 * This file contains specialized prompt templates for different content types.
 * Each template is designed to return a consistent JSON structure that maps
 * directly to our Prisma database schema, optimized for Google AdSense compliance and SEO.
 */

// ── Shared: Brand Voice & Naming Framework ────────────────────
export const BRAND_VOICE = `
Act as Stewart Lucas, representing NutriGuide. You are the expert culinary coach and nutritionist.
Your tone is warm, clean, encouraging, and deeply professional.
Focus on natural, descriptive language, honest cooking, and practical wellness.
Avoid bulky paragraphs. Use short, punchy, elegant sentences.
Focus on visual descriptions and empowering the reader.

CRITICAL CONTENT DEPTH RULES (ADSENSE ELIGIBILITY):
- Generate highly detailed, comprehensive content. Each page/post MUST have a target length of 800 to 1500+ words of helpful, original text.
- Do NOT write short, superficial summaries or stub articles. Expand on every point with detailed nutrition science, step-by-step guidance, prep advice, and FAQs.

CRITICAL SEO NAMING RULES:
- Do NOT use colons (":"), dashes, or sub-brandings in titles (e.g. do NOT write "Recipe: A Morning Masterpiece").
- Strictly avoid AI-sounding marketing buzzwords: "Authentic", "Sun-Kissed", "Sun-Drenched", "Golden Hour", "Velvet", "Artisan", "Symphony", "Masterpiece", "Morning Ritual", "Nourishing", "Vibrant", "Ultimate", "Expert Guide", "Perfect", "Golden", "Alchemy", "Hearth", "Canvas".
- Follow the formula: [Primary search keyword] + [Method/Flavor modifier] + [Unique differentiator/Benefit].
- Target title length: 45 to 65 characters. Keep titles search-friendly, clean, and high-CTR.
- Correct grammar everywhere: ensure proper article usage (e.g., "an expert guide" instead of "a expert guide", "an omelet" instead of "a omelet").
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

Task: Generate a premium, clean, highly-detailed RECIPE for: "${topic}".
Target Word Count: 800 to 1200+ words.

Layout Requirements:
- Use attractive HTML with inline CSS for spacing and typography.
- Use <h2> and <h3> for clear hierarchy.
- Add a "Stewart's Secret" tip box with a warm background (#FFF8F0) and left border (#E8603C).
- Add a "Nutrition Snapshot" table with clean borders and alternating row colors.
- Ingredients should be displayed in a two-column grid layout.
- Steps should be numbered with a large, styled counter.

To ensure AdSense-eligible content depth (800+ words), your HTML "body" MUST contain these sections:
1. **Quick Summary**: 3 bullet points at the top.
2. **Detailed Introduction (250+ words)**: An engaging, story-driven intro explaining the origin, culinary history, and health inspiration of this dish.
3. **Nutritional Science & Benefits (200+ words)**: Break down the health benefits of the key ingredients (e.g., protein, healthy fats, fiber, vitamins) and how they support metabolic health.
4. **Ingredients Overview (2-column layout)**.
5. **Step-by-Step Method (numbered, 200+ words)**: Detailed cooking steps with clear instructions and sensory feedback (smell, visual cues).
6. **Stewart's Secret Coaching Tips (150+ words)**: Professional culinary tips for perfect texture, seasoning, or equipment use.
7. **Meal Prep & Storage Guide (150+ words)**: Detailed steps for batch cooking, refrigeration/freezer life, and safe reheating.
8. **Variations & Swaps (100+ words)**: Swaps for vegan, keto, low-carb, or gluten-free adaptations.
9. **FAQ Section**: 3-5 real user search questions (e.g., "Can I use chicken thigh instead of breast?") with 2-3 sentence answers.
10. JSON-LD schema script tag at the end.

Return a single valid JSON object with these exact fields:
{
  "title": "Clean, SEO-optimized title under 65 chars (no colons, follow naming formula)",
  "excerpt": "2–3 sentences. An engaging, warm, story-driven description connecting the reader to this dish.",
  "body": "Full HTML content containing all 10 sections requested above.",
  "seoTitle": "SEO title under 60 chars",
  "seoDesc": "Compelling meta description under 155 chars",
  "tags": ["A list of 3-5 tags. MUST include at least one from: Quick Recipes, Healthy Eating, Budget Friendly, Breakfast, Lunch, Dinner. Also include dietary labels like Vegetarian, Vegan, Gluten Free, Dairy Free if applicable."],
  "schema": "JSON-LD string for Recipe schema markup",
  "coverImagePrompt": "Detailed, high-quality professional food photography prompt. Overhead 90-degree angle, soft natural light, rustic wooden background.",
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

Task: Write a premium, highly-detailed, informative BLOG ARTICLE about: "${topic}".
Target Word Count: 1000 to 1500+ words.

Layout Requirements:
- Use attractive HTML with inline CSS.
- Open with a powerful 2–3 sentence hook — no generic intros.
- Use <h2> for main sections, <h3> for sub-points.
- Include a "Quick Takeaways" box at the top (light teal background, #F0FAF6).
- Include one "Stewart's Perspective" pull-quote box (italic, warm border, #FFF8F0).
- Include one data-backed or science-backed callout box (light blue, #F0F6FF).
- End with an empowering "Your Next Step" CTA section.

To ensure AdSense-eligible content depth (1000+ words), your HTML "body" MUST contain these sections:
1. **Quick Takeaways Box**: 3 bullet points summarizing the article.
2. **Engagement Hook & Introduction (200+ words)**: Set the scene, explain the common pain points, and outline the goal of the article.
3. **4 to 6 Detailed Sections (600+ words)**: Use <h2> and <h3> tags. Each section must have at least 2 full paragraphs of explanation, scientific research, and practical advice.
4. **Stewart's Perspective Box & Science Callout Box**.
5. **FAQ Section (200+ words)**: 4-5 real user search queries with clear, direct, and helpful answers.
6. **Your Next Step CTA (100+ words)**: An empowering, actionable concluding summary.
7. JSON-LD Article schema script tag at the end.

Return a single valid JSON object with these exact fields:
{
  "title": "Clean, SEO-optimized title under 65 chars (no colons, follow naming formula)",
  "excerpt": "2–3 sentences. A story-driven hook that makes the reader feel this topic is urgent and personal to them.",
  "body": "Full HTML content containing all 7 sections requested above.",
  "seoTitle": "SEO-optimized title under 60 chars",
  "seoDesc": "Compelling meta description under 155 chars",
  "tags": ["tag1", "tag2", "tag3"],
  "schema": "JSON-LD string for Article schema markup",
  "coverImagePrompt": "Detailed, professional AI image generation prompt. Describe lighting, mood, subject, composition, and color palette."
}
`;

// ── 3. CHEAT SHEET PROMPT ─────────────────────────────────────
export const getCheatSheetPrompt = (topic: string) => `
${BRAND_VOICE}
${AEO_GUIDELINES}

Task: Create a premium, highly-detailed, print-friendly CHEAT SHEET about: "${topic}".
Target Word Count: 800 to 1200+ words.

LAYOUT REQUIREMENTS:
- Single valid HTML file with all inline CSS (no external stylesheets)
- Font: system-ui, -apple-system, sans-serif
- Max width: 900px, centered, white background, subtle box-shadow
- Open with a 1–2 sentence "Why This Matters" — direct, zero fluff
- "Quick Summary" box: amber/gold border (#F59E0B), background #FFFBF0, top 3 rules in bold
- Primary layout: 2-column CSS Grid comparison or reference table
- Table styling: header row background #1a1a1a with white text, alternating rows #FFFFFF / #F9F9F7
- Badge labels (inline-block, border-radius: 4px, font-size: 12px):
    ✓ Do → background #D1FAE5, color #065F46
    ✗ Avoid → background #FEE2E2, color #991B1B
    Pro Tip → background #FEF3C7, color #92400E
    Info → background #DBEAFE, color #1E40AF
- Group items under <h3> sub-headings
- "Common Mistakes" section: red-left-border (#EF4444), background #FFF5F5, each mistake one line only
- All bullet points: ONE line maximum — this is a cheat sheet, not an essay
- End with FAQ section: 5 questions, each in <details><summary> accordion format
- JSON-LD HowTo schema <script> tag at the very end of body

To ensure AdSense-eligible content depth (800+ words), include:
- **Introductory Context (150+ words)**: Elaborating on the scientific value of this quick reference.
- **Concepts Definition (150+ words)**: Providing 3 definitions of key scientific concepts related to the topic.
- **Reference Table & Badged Sections (300+ words)**: In-depth items, descriptions, and criteria.
- **Common Mistakes Callout (100+ words)**: At least 6 mistakes explained clearly.
- **FAQ Section (200+ words)**: 5 real user questions and expanded answers inside accordions.

Return this exact JSON structure:
{
  "title": "SEO title under 65 characters (no colons, follow naming formula)",
  "excerpt": "1–2 sentences. Position as the ultimate quick-reference the reader will bookmark forever.",
  "body": "Full inline-CSS HTML: Why This Matters, Quick Summary box, Intro, Definitions, 2-column reference table, badged sections, Common Mistakes, FAQ accordion (5 Qs), HowTo JSON-LD script",
  "seoTitle": "SEO title under 60 characters",
  "seoDesc": "Meta description under 155 chars",
  "tags": ["primary-keyword", "secondary-keyword", "diet-type", "goal", "skill-level"],
  "schema": "Minified JSON-LD string for HowTo schema — include name, description, step array with 5+ steps",
  "coverImagePrompt": "Professional flat-lay image prompt: specific props, lighting style (soft natural light), color palette, overhead angle, no text overlay"
}
`;

// ── 4. DIET PLAN PROMPT ───────────────────────────────────────
export const getDietPlanPrompt = (topic: string) => `
${BRAND_VOICE}
${AEO_GUIDELINES}

Task: Create a comprehensive, premium 7-DAY DIET PLAN for: "${topic}".
Target Word Count: 1000 to 1500+ words.

LAYOUT REQUIREMENTS:
- Single valid HTML file with all inline CSS (no external stylesheets)
- Font: system-ui, -apple-system, sans-serif
- Max width: 960px, centered, white background
- "Key Takeaways" box: green border (#10B981), background #F0FDF4, top 3 outcomes in bold

To ensure AdSense-eligible content depth (1000+ words), include:
1. **Key Takeaways Box** (3 bullet points).
2. **Nutritional Science Rationale (250+ words)**: Explaining the clinical research behind why this specific meal setup works for the targeted goal.
3. **7-Day Meal Table**: Columns: Day | Breakfast | Lunch | Dinner | Snack | Est. Calories. Meal names must be descriptive (e.g. "Lemon-Herb Baked Salmon with Fluffy Quinoa" instead of "salmon and quinoa"). Calorie counts must be specific whole numbers. Day 1 starts with a solid green highlight, Day 7 ends with an amber highlight.
4. **Detailed Meal Descriptions (300+ words)**: Write brief preparation tips or macro breakdowns for at least 5 main meals from the table.
5. **Weekly Shopping List (2-col grid)**: Divided into Proteins, Produce, Pantry Staples, and Dairy & Alternatives.
6. **Meal Prep Tips Box (150+ words)**: Exactly 5 actionable, specific tips.
7. **What to Avoid Callout (100+ words)**: Exactly 6 items to skip.
8. **Progress Check (Milestone Cards)**: Day 3, Day 5, and Day 7 cards explaining what to expect.
9. **FAQ Section (200+ words)**: 5 real user search questions and expanded answers in accordion format.
10. **Next Steps** (3 bullet points) & Diet JSON-LD schema <script> tag.

Return this exact JSON structure:
{
  "title": "Clean, SEO-optimized title under 65 chars (no colons, follow naming formula)",
  "excerpt": "2–3 sentences. Motivating, warm transformation story — paint the before and after.",
  "body": "Full inline-CSS HTML containing all 10 sections requested above.",
  "seoTitle": "SEO title under 60 chars",
  "seoDesc": "Meta description under 155 chars",
  "tags": ["diet-type", "health-goal", "timeframe", "dietary-restriction", "meal-type"],
  "schema": "Minified JSON-LD string for Diet schema — include name, description, dietFeatures array, suitableForDiet"
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
