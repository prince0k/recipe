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
      - **Excerpt**: 2-3 sentences summarizing the content.
      - **Body**: Detailed HTML content (1200+ words for blogs).
      - **SEO**: Meta title and Meta description.
      - **Tags**: 3-5 relevant tags.
      - **Schema**: A JSON-LD string.
      - **coverImagePrompt**: A detailed, descriptive AI image generation prompt for a high-quality cinematic cover image (1200x800). Focus on mood, lighting, and composition.

      Return the response in Strict JSON format:
      {
        "title": "...",
        "excerpt": "...",
        "body": "...", 
        "seoTitle": "...",
        "seoDesc": "...",
        "tags": ["...", "..."],
        "schema": "...",
        "coverImagePrompt": "..."
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
