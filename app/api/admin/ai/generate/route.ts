import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getGeminiResponse, generateImage, STWART_LUCAS_VOICE, AI_SEO_GUIDELINES } from "@/lib/ai";
import { saveAndCompressImage } from "@/lib/image-utils";


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

    const prompt = `
      ${STWART_LUCAS_VOICE}
      ${AI_SEO_GUIDELINES}

      Task: Generate a premium, cinematic ${type} about: "${topic}".
      
      **Layout Requirements**:
      - Use attractive HTML with better use of inline CSS for spacing and typography.
      - Use <h2> and <h3> for hierarchy.
      - Add a "Pro Tip" or "Stwart's Secret" box with a light background and border.

      Requirements for ${type}:
      - **Title**: Catchy and SEO-optimized.
      - **Excerpt**: 2-3 sentences summarizing the content. This should be an emotionally engaging "Story" that connects the reader to the dish or topic.
      - **Body**: Detailed HTML content. For recipes, this should be the step-by-step preparation method with clear instructions.
      - **SEO**: Meta title and Meta description.
      - **Tags**: 3-5 relevant tags.
      - **Schema**: A JSON-LD string.
      - **coverImagePrompt**: A detailed, descriptive AI image generation prompt.

      ${type === "RECIPE" ? `
      Additional Requirements for RECIPE:
      - **cookingTime**: Total time (e.g., "45 mins").
      - **prepTime**: Preparation time (e.g., "15 mins").
      - **difficulty**: "Easy", "Medium", or "Hard".
      - **servings**: Number of servings (e.g., 4).
      - **calories**: Caloric value per serving.
      - **ingredients**: A list of strings (e.g., ["500g Shrimp", "2 Limes"]).
      - **Nutrition**: Include Fat (g), Carbs (g), and Protein (g) in the body or schema, but also provide them as separate fields if possible.
      ` : ""}

      Return the response in Strict JSON format:
      {
        "title": "...",
        "excerpt": "...",
        "body": "...", 
        "seoTitle": "...",
        "seoDesc": "...",
        "tags": ["...", "..."],
        "schema": "...",
        "coverImagePrompt": "...",
        ${type === "RECIPE" ? `
        "cookingTime": "...",
        "prepTime": "...",
        "difficulty": "...",
        "servings": 4,
        "calories": 450,
        "ingredients": ["...", "..."],
        "fat": "12g",
        "carbs": "54g",
        "protein": "18g"
        ` : ""}
      }
    `;

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
        type: type,
        excerpt: data.excerpt,
        body: data.body,
        coverImage: coverImageUrl,
        coverImagePrompt: data.coverImagePrompt,
        ingredients: type === "RECIPE" ? JSON.stringify(data.ingredients || []) : "[]",
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
