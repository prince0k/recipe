import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getGeminiResponse, generateImage } from "@/lib/ai";
import { saveAndCompressImage } from "@/lib/image-utils";
import { getPromptByType } from "@/lib/prompts";


export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, type, imageMode = "image" } = await req.json();

    if (!topic || !type) {
      return NextResponse.json({ error: "Missing topic or type" }, { status: 400 });
    }

    // Get specialized prompt for this content type
    const prompt = getPromptByType(type, topic);

    const aiResponse = await getGeminiResponse(prompt, true);
    const data = JSON.parse(aiResponse || "{}");

    // 1. Handle Image Generation Mode
    let coverImageUrl = null;
    if (imageMode === "image") {
      try {
        const rawCoverImage = await generateImage(data.coverImagePrompt || `Professional food photography of ${topic}`, 'preview');
        coverImageUrl = await saveAndCompressImage(rawCoverImage, data.title || topic);
      } catch (e) {
        console.error("Image generation failed:", e);
        // Fallback to null or let it be prompt-only
      }
    }

    // Save to database as DRAFT
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + Math.random().toString(36).substring(2, 7);

    const content = await prisma.content.create({
      data: {
        title: data.title,
        slug: slug,
        type: type.toUpperCase(), // Ensure consistent casing (RECIPE, BLOG, etc)
        excerpt: data.excerpt,
        body: data.body,
        coverImage: coverImageUrl,
        coverImagePrompt: data.coverImagePrompt,
        ingredients: data.ingredients ? JSON.stringify(data.ingredients) : "[]",
        cookingTime: data.cookingTime,
        prepTime: data.prepTime,
        difficulty: data.difficulty,
        servings: data.servings,
        calories: data.calories,
        fat: data.fat,
        carbs: data.carbs,
        protein: data.protein,
        tags: JSON.stringify(data.tags || []),
        seoTitle: data.seoTitle,
        seoDesc: data.seoDesc,
        schema: typeof data.schema === 'object' ? JSON.stringify(data.schema) : (data.schema || null),
        published: false,
      }
    });

    // Instantly clear the cache for the specific lists where this content will appear
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/content");
    revalidatePath("/");
    revalidatePath("/recipes");
    revalidatePath("/blog");
    revalidatePath("/cheetsheets");

    return NextResponse.json({ success: true, id: content.id, title: content.title });
  } catch (error: any) {
    console.error("Content Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
