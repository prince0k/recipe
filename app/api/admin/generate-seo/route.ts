import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, body } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required for SEO generation." }, { status: 400 });
    }

    // Heuristic/Mock SEO Generation (Since no OpenAI key is available)
    // 1. Generate an optimized title (add high-converting words)
    const powerWords = ["Complete Guide", "Ultimate", "Best", "Easy", "Fast", "Proven"];
    const randomPowerWord = powerWords[Math.floor(Math.random() * powerWords.length)];
    const seoTitle = `${title} - The ${randomPowerWord} for 2026`;

    // 2. Generate an optimized description by stripping HTML and extracting the first 150 chars
    const strippedBody = body.replace(/<[^>]*>?/gm, '').trim();
    let seoDesc = strippedBody.substring(0, 150);
    
    // Fallback if body is empty
    if (!seoDesc) {
      seoDesc = `Discover our comprehensive resources and expert advice on ${title}. Improve your health and wellness today with NutriGuide.`;
    } else {
      // Add a CTA at the end
      seoDesc = `${seoDesc.trim()}... Read more to discover the full plan!`;
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({ seoTitle, seoDesc }, { status: 200 });
  } catch (error) {
    console.error("SEO generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
