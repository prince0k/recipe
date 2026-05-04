import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchSerper, getGeminiResponse } from "@/lib/ai";

export async function GET() {
  console.log("Trending API: Request started");
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      console.log("Trending API: Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Search for trending food/diet topics
    const date = new Date();
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const searchQuery = `trending healthy recipes and diet plans ${monthYear}`;
    let searchResults: any = { organic: [] };
    try {
      searchResults = await searchSerper(searchQuery);
    } catch (e) {
      console.error("Serper failed, using fallback:", e);
    }

    if (!searchResults || !searchResults.organic || searchResults.organic.length === 0) {
      console.log("No organic search results found for trends.");
      searchResults = { organic: [{ title: "Spring Healthy Eating", snippet: "Seasonal wellness trends" }] }; 
    }

    // 2. Use Gemini to extract 10 specific topics
    const prompt = `
      Current Month: ${monthYear}
      Search Results Summary: ${JSON.stringify(searchResults.organic?.slice(0, 10).map((r: any) => ({ title: r.title, snippet: r.snippet })))}

      Based on these search results and your knowledge of current culinary trends for ${monthYear}, identify 10 trending and highly specific topics for a premium nutrition website.
      Each topic should be specific enough to generate blogs, recipes, and diet plans from it.
      
      Example Topics:
      - "The 2026 Mediterranean longevity protocols"
      - "Spring Seasonal Anti-Inflammatory Meal Prep"
      - "High-Fiber Biohacking for Gut Health"

      Return a JSON object with a "categories" array. Each category should have a "name" and a "topics" array of strings.
      Example: { "categories": [ { "name": "Weight Loss", "topics": ["Keto for Beginners", ...] }, { "name": "Seasonal", "topics": ["May Salads", ...] } ] }
    `;

    const aiResponse = await getGeminiResponse(prompt, true);
    console.log("Gemini Trending Response:", aiResponse);
    
    let data = { categories: [] };
    try {
      data = JSON.parse(aiResponse || '{"categories": []}');
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", aiResponse);
      // Minimal fallback structure
      data = { categories: [{ name: "Trending", topics: [] }] };
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Trending Topics Error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch trending topics", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
