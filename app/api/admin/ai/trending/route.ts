import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { searchSerper, getGeminiResponse } from "@/lib/ai";

// Rotate through different search angles so Serper never returns the same results twice
const SEARCH_ANGLES = [
  "trending healthy recipes viral social media",
  "best diet plans nutritionists recommending",
  "new superfoods and nutrition science discoveries",
  "gut health meal prep ideas trending",
  "weight loss meal plans science backed",
  "anti-inflammatory foods recipes popular",
  "high protein low carb meal ideas trending",
  "seasonal produce recipes home cooking",
  "budget healthy meals trending",
  "longevity diet blue zones recipes",
];

export async function GET() {
  console.log("Trending API: Request started");
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const date = new Date();
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    // 1. Pick a random search angle so Serper returns different results each time
    const randomAngle = SEARCH_ANGLES[Math.floor(Math.random() * SEARCH_ANGLES.length)];
    const searchQuery = `${randomAngle} ${monthYear}`;
    console.log("Trending API: Searching for:", searchQuery);

    let searchResults: any = { organic: [] };
    try {
      searchResults = await searchSerper(searchQuery);
    } catch (e) {
      console.error("Serper failed, using fallback:", e);
    }

    if (!searchResults?.organic?.length) {
      searchResults = { organic: [{ title: "Seasonal Healthy Eating", snippet: "Current wellness trends" }] };
    }

    // 2. Fetch existing content titles from DB so Gemini knows what to AVOID
    const existingContent = await prisma.content.findMany({
      select: { title: true },
      orderBy: { createdAt: "desc" },
      take: 50, // Only send the last 50 to avoid huge prompts
    });
    const existingTitles = existingContent.map(c => c.title);

    // 3. Ask Gemini to suggest fresh topics, explicitly avoiding duplicates
    const prompt = `
      Current Month: ${monthYear}
      Search Results Summary: ${JSON.stringify(searchResults.organic?.slice(0, 8).map((r: any) => ({ title: r.title, snippet: r.snippet })))}

      ALREADY PUBLISHED CONTENT (DO NOT suggest anything similar to these titles):
      ${existingTitles.length > 0 ? existingTitles.map(t => `- "${t}"`).join('\n') : 'None yet.'}

      Task: Based on the search results and current culinary trends for ${monthYear}, suggest 10 FRESH, UNIQUE topics for a premium nutrition website called "Stewart Lucas".
      
      Rules:
      - Do NOT suggest anything similar to the already published content listed above.
      - Each topic must be specific, actionable, and different from each other.
      - Mix content types: some recipes, some diet plans, some educational blogs.
      - Vary the angle: gut health, weight loss, seasonal eating, budget cooking, longevity, etc.

      Return a JSON object with a "categories" array. Each category should have a "name" and a "topics" array of strings.
      Example: { "categories": [ { "name": "Weight Loss", "topics": ["Keto for Beginners", ...] }, { "name": "Seasonal", "topics": ["May Salads", ...] } ] }
    `;

    const aiResponse = await getGeminiResponse(prompt, true);
    console.log("Gemini Trending Response:", aiResponse);

    let data: { categories: { name: string; topics: string[] }[] } = { categories: [] };
    try {
      data = JSON.parse(aiResponse || '{"categories": []}');
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", aiResponse);
      data = { categories: [{ name: "Trending", topics: [] }] };
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Trending Topics Error:", error);
    return NextResponse.json({
      error: "Failed to fetch trending topics",
      details: error.message,
    }, { status: 500 });
  }
}
