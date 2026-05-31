import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: 'v1beta',
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { contentId, answers } = await req.json();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Please log in to personalize your plan." }, { status: 401 });
    }

    const userId = session.user.id;
    const userName = session.user.name || "Friend";

    if (!contentId || !answers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check rate limit: One request per 24 hours
    const lastRequest = await prisma.personalizedRequest.findFirst({
      where: {
        userId: userId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { createdAt: "desc" }
    });

    if (lastRequest) {
      return NextResponse.json({ 
        error: "You can only request one personalized plan per day. Please try again later." 
      }, { status: 429 });
    }

    // Get the content to know its title and pain point questions
    const content = await prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Extract lead data
    const leadData = {
      goal: answers["goal"] || "",
      age: answers["age"] || "",
      gender: answers["gender"] || "",
      diet: answers["diet"] || "",
      time: answers["time"] || "",
      activity: answers["activity"] || "",
      struggle: answers["struggle"] || "",
      additional: answers["additional"] || "",
    };

    // Add custom question answers
    let customQuestionsAndAnswers = "";
    Object.keys(answers).forEach((key) => {
      if (key.startsWith("custom_")) {
        try {
          const index = parseInt(key.split("_")[1]);
          const customQuestions = JSON.parse(content.painPointQuestions || "[]");
          if (customQuestions[index]) {
            customQuestionsAndAnswers += `${customQuestions[index].question}: ${answers[key]}\n`;
          }
        } catch (e) {}
      }
    });

    // 1. Update User Lead Data
    await prisma.user.update({
      where: { id: userId },
      data: {
        leadData: JSON.stringify(leadData)
      }
    });

    // Strip HTML from the original body to save tokens
    const strippedBody = content.body.replace(/<[^>]*>?/gm, '');

    // Build the LLM prompt with Stewart Lucas brand voice and requested prompt template
    const prompt = `Act as Stewart Lucas, the founder of NutriGuide — a warm, professional culinary coach and nutritionist who has worked with thousands of real people navigating real struggles.

═══════════════════════════════════════════════
CLIENT DOSSIER — READ EVERY LINE BEFORE WRITING
═══════════════════════════════════════════════
Name:              ${userName}
Age Range:         ${leadData.age}
Primary Struggle:  ${leadData.struggle}
Additional Notes:  ${leadData.additional || "None"}
Main Goal:         ${leadData.goal}
Dietary Style:     ${leadData.diet}
Activity Level:    ${leadData.activity}
Prep Time/Day:     ${leadData.time}
${customQuestionsAndAnswers}

═══════════════════════════════════════════════
BASE PLAN REFERENCE (FOR STRUCTURE & LAYOUT ONLY)
═══════════════════════════════════════════════
Base Plan Reference (strip all HTML, use only structure + meals):
${strippedBody}

[CRITICAL RULE] The Base Plan Reference is provided ONLY as a structural layout/meals reference. 
You MUST ignore its specific medical focus or thematic focus (such as Menopause Support, Hormone Balancing, or PCOS) unless they are explicitly present in the CLIENT DOSSIER above. 
Generate a completely custom title and meals tailored strictly to the client's dossier goals, diet, and struggles.

═══════════════════════════════════════════════
STEWART LUCAS VOICE RULES — NON-NEGOTIABLE
═══════════════════════════════════════════════
✓ Warm, professional, encouraging, and clear
✓ Short punchy sentences — never more than 2 lines per paragraph
✓ Use: "vibrant", "honest cooking", "nourished", "purposeful", "wholesome"
✗ DO NOT use repetitive marketing buzzwords such as "cinematic", "artisanal", "moody", "masterclass", "alchemy", "canvas", "ode", "hearth", "resilience", or "curated" in any descriptions or titles.
✗ NEVER say: "balanced diet", "healthy lifestyle", "eat clean", "stay hydrated"
✗ NEVER write generic advice that could apply to anyone
✗ NEVER use bullet walls — break with sub-headers instead
✓ Describe food visually — colors, textures, aromas, temperature
✓ Every meal name must sound appetizing (not "chicken salad" — "herb-kissed chicken over crisp romaine")
✓ Address ${userName} by first name at least 3 times throughout

═══════════════════════════════════════════════
DEEP PERSONALIZATION LOGIC — APPLY ALL THAT MATCH
═══════════════════════════════════════════════

IF struggle contains "cravings":
→ Open with: "Cravings aren't weakness, ${userName} — they're data."
→ Add high-satiety snacks (protein 20g+) between every meal
→ Include a "Craving SOS" box: 3 swaps for common craving moments
→ Explain the blood sugar science behind their specific craving pattern in 2 sentences

IF struggle contains "time" OR prep time is under 20 mins:
→ Every meal must be achievable in ${leadData.time} or less
→ Label each meal with a "[Time] X min" badge
→ Add a "Sunday Prep Stack" section: 3 batch-cook items that power the whole week
→ Prioritize one-pan, one-pot, or no-cook meals

IF struggle contains "motivation" OR "consistency" OR "discipline":
→ Add a "Momentum Map" section: micro-wins for Day 1, Day 3, Day 7
→ Frame every meal as a conscious choice, not a restriction
→ Include a daily "Anchor Habit" — one tiny ritual that builds consistency
→ End with a personal message from Stewart about their specific journey

IF struggle contains "weight" OR goal contains "loss" OR "fat":
→ Add calorie estimates to every meal (realistic, specific numbers)
→ Include a weekly deficit math box: "At this intake, you create approximately X cal deficit"
→ Add "Portion Visual Guide": palm = protein, fist = carbs, thumb = fats
→ Flag meals with a "[Fat-Burn Friendly]" badge

IF struggle contains "energy" OR "fatigue" OR "bloating":
→ Add a "Energy Timeline" — how each meal affects energy 1–3 hours later
→ Flag gut-friendly meals with "[Gut Happy]" badge
→ Include pre/probiotic foods in at least 3 meals
→ Add a "Morning Protocol" — what to do in first 30 minutes after waking

IF diet is "Keto" OR "Low Carb":
→ Add net carb count to every meal
→ Include an "Electrolyte Reminder" box (sodium, potassium, magnesium)
→ Flag each meal: "[Keto Confirmed]" if under 10g net carbs

IF diet is "Vegan" OR "Vegetarian":
→ Add protein source callout on every meal
→ Include a "Complete Protein Combos" reference box
→ Flag B12, Iron, Omega-3 rich meals with nutrient badges

IF diet is "Gluten-Free":
→ Mark every ingredient that needs a GF swap with "(ensure GF certified)"
→ Add a "Hidden Gluten Watch" callout: 5 sneaky gluten sources to check

IF activity is "Sedentary" OR "Light":
→ Calorie targets skewed lower (1,400–1,600 range)
→ Add a "Movement Snack" suggestion per day (2-min habit, not a workout)

IF activity is "Very Active" OR "Athlete":
→ Add pre/post workout meal timing guidance
→ Higher carb meals on training days, clearly flagged
→ Include a "Fuel & Recover" section

═══════════════════════════════════════════════
MANDATORY DOCUMENT STRUCTURE
═══════════════════════════════════════════════

### 1. PERSONAL OPENING LETTER (from Stewart Lucas)
- Address ${userName} directly by name
- Name their struggle "${leadData.struggle}" explicitly in sentence 1
- Validate the struggle — make them feel deeply seen (2–3 sentences)
- Explain specifically how THIS plan is engineered for their exact situation
- End with one powerful motivating sentence tailored to their goal
- Max 120 words total — punchy, not rambling

---

### 2. YOUR TRANSFORMATION BLUEPRINT
- "Your Goal This Week:" — one specific, measurable outcome (not vague)
- "Your #1 Enemy This Week:" — name the exact barrier from their struggle
- "Your Secret Weapon:" — name the single nutritional strategy addressing their struggle
- "Your Daily Target:" — specific calorie/macro target based on their profile
Format as a 4-row reference card (styled box)

---

### 3. [CONDITIONAL SECTION — based on struggle logic above]
Insert whichever section(s) the personalization logic above triggers:
- Craving SOS box
- Sunday Prep Stack
- Momentum Map
- Portion Visual Guide
- Energy Timeline
- Electrolyte Reminder
- Complete Protein Combos
(Skip sections that don't apply — do not leave empty placeholders)

---

### 4. YOUR 7-DAY PERSONALIZED MEAL PLAN
For EACH of the 7 days:

**[Day Name] — [Optional Day Theme e.g. "Reset Day" / "Power Day" / "Comfort Day"]**

| Meal | Dish Name | Description | Time | Calories |
|------|-----------|-------------|------|----------|

- Breakfast, Lunch, Dinner + 1 Snack per day
- Dish names must be specific and appetizing
- Description: colors, textures, key ingredients — ONE descriptive, appetizing sentence
- Time: realistic for ${leadData.time}
- Calories: specific number (not ranges)
- Apply any diet-specific badges from personalization logic
- Day 1 theme: "Strong Start" — most accessible meals to build confidence
- Day 7 theme: "Victory Lap" — slightly elevated, reward-feeling meals

---

### 5. THIS WEEK'S SHOPPING LIST
Grouped by category — quantities included:
Proteins | Produce | Pantry | Dairy/Alternatives
Only include ingredients actually used in the 7-day plan above

---

### 6. [CONDITIONAL] PREP GUIDE
(Include only if prep time < 30 min OR struggle includes "time")
- 5 specific prep actions for Sunday
- Each with exact time required (e.g. "Batch-cook quinoa — 15 min")
- Total prep time estimate

---

### 7. WHAT TO WATCH FOR
Three milestone check-ins tailored to their specific goal:
- **Day 3 Check:** What ${userName} should feel/notice (specific to their struggle)
- **Day 5 Check:** Visible or internal changes to watch watch for
- **Day 7 Check:** Key result indicators + how to build on this week

---

### 8. PERSONAL CLOSING FROM STEWART
- 3–4 sentences maximum
- Reference their specific struggle one final time
- End with one forward-looking sentence about their next week
- Signature: "With warmth and purpose, Stewart Lucas — NutriGuide"

═══════════════════════════════════════════════
OUTPUT FORMAT RULES
═══════════════════════════════════════════════
- The VERY FIRST line of your output MUST be: # 7-Day [Diet/Goal Description] Meal Plan: Personalized Edition
  Example: "# 7-Day Keto Weight Loss Meal Plan: Personalized Edition"
  Customize this title strictly to the client's goal, diet, and struggles. Do NOT include medical targets like PCOS or Menopause unless they are explicitly present in the CLIENT DOSSIER above.
- Output clean Markdown only — no HTML, no JSON wrapper
- Use ### for section headers, #### for sub-sections
- Tables for meal plan (pipe format)
- Bold for meal names, italics for food descriptions
- Max line length: 90 characters (print-friendly)
- Minimum total length: 1,200 words
- Maximum total length: 2,000 words
- NEVER use emojis (such as clock, fire, leaves, green dots, meat, or vegetables) anywhere in the output. Keep it strictly textual.
- Every section must feel written FOR ${userName} — not for a generic reader`;

    // 2. Call Gemini to generate the personalized plan with retries
    let generatedContent = "Generation pending. (Error: AI service currently unavailable.)";
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        generatedContent = response.text || generatedContent;
        break; // Success!
      } catch (aiError: any) {
        attempts++;
        console.error(`Gemini Attempt ${attempts} Failed:`, aiError.message);
        generatedContent = `[AI Generation Failed] ${aiError.message}`;
        
        if (attempts < maxAttempts) {
          // Wait 5 seconds before retrying (increased for rate limits)
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    // 3. Create the Personalized Request with the output
    const request = await prisma.personalizedRequest.create({
      data: {
        userId: userId,
        contentId: content.id,
        answers: JSON.stringify(answers),
        generatedPrompt: prompt,
        generatedContent: generatedContent,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, requestId: request.id }, { status: 201 });

  } catch (error) {
    console.error("Personalized download error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
