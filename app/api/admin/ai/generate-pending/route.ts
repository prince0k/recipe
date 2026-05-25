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

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing pending recipe ID" }, { status: 400 });
    }

    // 1. Fetch pending recipe record
    const pendingItem = await prisma.content.findUnique({
      where: { id }
    });

    if (!pendingItem) {
      return NextResponse.json({ error: "Pending recipe not found" }, { status: 404 });
    }

    if (pendingItem.type !== "PENDING_RECIPE") {
      return NextResponse.json({ error: "Content item is not a pending recipe" }, { status: 400 });
    }

    const topic = pendingItem.title;
    const type = "RECIPE";

    // 2. Generate Recipe Content using AI
    const prompt = getPromptByType(type, topic);
    const aiResponse = await getGeminiResponse(prompt, true);
    const data = JSON.parse(aiResponse || "{}");

    // 3. Generate Cover Image
    let coverImageUrl = null;
    try {
      const rawCoverImage = await generateImage(data.coverImagePrompt || `Professional food photography of ${topic}`, 'preview');
      coverImageUrl = await saveAndCompressImage(rawCoverImage, data.title || topic);
    } catch (e) {
      console.error("AI Image generation failed for pending recipe:", e);
    }

    // 4. Clean clean slug
    let cleanSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    
    // Ensure slug uniqueness (in case another recipe has the exact same slug)
    const existingSlug = await prisma.content.findUnique({
      where: { slug: cleanSlug }
    });
    if (existingSlug && existingSlug.id !== id) {
      cleanSlug = `${cleanSlug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    // 5. Parse and merge tags
    const tags: string[] = Array.isArray(data.tags) ? data.tags : [];
    
    // Auto-classification
    const cookTimeMatch = data.cookingTime?.match(/(\d+)/);
    if (cookTimeMatch) {
      const minutes = parseInt(cookTimeMatch[1]);
      if (minutes <= 30 && !tags.includes("Quick Recipes")) tags.push("Quick Recipes");
    }
    const titleLower = data.title.toLowerCase();
    if ((titleLower.includes("breakfast") || titleLower.includes("morning")) && !tags.includes("Breakfast")) {
      tags.push("Breakfast");
    } else if (titleLower.includes("lunch") && !tags.includes("Lunch")) {
      tags.push("Lunch");
    } else if ((titleLower.includes("dinner") || titleLower.includes("supper")) && !tags.includes("Dinner")) {
      tags.push("Dinner");
    }
    const bodyLower = data.body.toLowerCase();
    if (bodyLower.includes("vegan") && !tags.includes("Vegan")) tags.push("Vegan");
    if (bodyLower.includes("vegetarian") && !tags.includes("Vegetarian")) tags.push("Vegetarian");
    if ((bodyLower.includes("gluten-free") || bodyLower.includes("gluten free")) && !tags.includes("Gluten Free")) {
      tags.push("Gluten Free");
    }

    // 6. Update the existing record (repurpose it from PENDING_RECIPE into RECIPE)
    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        title: data.title,
        slug: cleanSlug,
        type: "RECIPE",
        excerpt: data.excerpt,
        body: data.body,
        coverImage: coverImageUrl || pendingItem.coverImage,
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
        tags: JSON.stringify([...new Set(tags)]),
        seoTitle: data.seoTitle,
        seoDesc: data.seoDesc,
        schema: typeof data.schema === 'object' ? JSON.stringify(data.schema) : (data.schema || null),
        published: false, // Keep as draft for admin review
      }
    });

    // 7. Targeted revalidations
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/content");
    revalidatePath("/");
    revalidatePath("/recipes");

    return NextResponse.json({ success: true, id: updatedContent.id, title: updatedContent.title });
  } catch (error: any) {
    console.error("Pending Recipe Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate recipe from pending item" }, { status: 500 });
  }
}
