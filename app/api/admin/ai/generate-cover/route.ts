import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { saveAndCompressImage } from "@/lib/image-utils";
import { getGeminiResponse } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing content ID" }, { status: 400 });
    }

    // 1. Fetch content item
    const content = await prisma.content.findUnique({
      where: { id }
    });

    if (!content) {
      return NextResponse.json({ error: "Content item not found" }, { status: 404 });
    }

    const falKey = process.env.FAL_KEY || "587f2f27-3da0-47fd-987e-053572ce7f8f:c41589d005b2f62dbde3b45c468f9cb5";

    // 2. Determine prompt (generate dynamically using Gemini if missing)
    let prompt = content.coverImagePrompt;
    if (!prompt || prompt.trim() === "") {
      try {
        const aiPrompt = `
          You are a professional art director and AI image prompting expert.
          Generate a single, detailed, highly descriptive cover image prompt for a ${content.type.toLowerCase().replace('_', ' ')} titled "${content.title}".
          
          Here is the description/excerpt of the content:
          "${content.excerpt || content.body?.substring(0, 500)}"
          
          Create a cinematic, warm-toned, premium quality food/wellness photography image prompt.
          Describe composition, lighting (soft natural light, golden hour, moody shadows), specific ingredients or props matching the theme, background textures, color palette, camera angle, and high-resolution details.
          
          Do NOT include any introduction, explanations, formatting or markdown. Output ONLY the raw prompt string.
          The prompt must be suitable for an image generator (e.g. Flux, Midjourney) and must NOT ask for text overlays.
        `;
        console.log(`Generating cover image prompt via Gemini for: "${content.title}"`);
        const generatedPrompt = await getGeminiResponse(aiPrompt);
        if (generatedPrompt && generatedPrompt.trim().length > 0) {
          prompt = generatedPrompt.trim();
          // Update in DB so it's saved for future reference!
          await prisma.content.update({
            where: { id },
            data: { coverImagePrompt: prompt }
          });
          console.log(`Saved generated cover prompt: "${prompt}"`);
        }
      } catch (e: any) {
        console.warn("Failed to generate cover prompt using Gemini, using fallback:", e.message);
      }
    }

    if (!prompt) {
      prompt = `Professional food photography of ${content.title}, soft cinematic lighting, depth of field, high resolution`;
    }

    // 3. Call Fal.ai API
    console.log(`Generating cover image for "${content.title}" using flux/schnell...`);
    const response = await fetch("https://fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: {
        "Authorization": `Key ${falKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt,
        num_images: 1,
        aspect_ratio: "16:9",
        output_format: "png",
        resolution: "1K"
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Fal.ai image generation failed:", errText);
      return NextResponse.json({ error: `Fal.ai error: ${response.status}` }, { status: 502 });
    }

    const data = await response.json();
    const remoteUrl = data.images?.[0]?.url;

    if (!remoteUrl) {
      return NextResponse.json({ error: "No image URL returned by AI" }, { status: 502 });
    }

    // 4. Save and compress image locally
    const localUrl = await saveAndCompressImage(remoteUrl, content.title);

    // 5. Update content in database
    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        coverImage: localUrl
      }
    });

    // 6. Targeted revalidations
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/content");
    revalidatePath("/");
    revalidatePath("/recipes");
    revalidatePath("/blog");
    revalidatePath("/cheat-sheets");
    revalidatePath("/diet-plan");
    if (content.type === "RECIPE") revalidatePath(`/recipes/${content.slug}`);
    if (content.type === "BLOG") revalidatePath(`/blog/${content.slug}`);
    if (content.type === "CHEAT_SHEET") revalidatePath(`/cheat-sheets/${content.slug}`);
    if (content.type === "DIET_PLAN") revalidatePath(`/diet-plan/${content.slug}`);

    return NextResponse.json({ success: true, coverImage: localUrl, title: updatedContent.title });
  } catch (error: any) {
    console.error("Generate Cover Image Error:", error);
    return NextResponse.json({ error: "Failed to generate cover image" }, { status: 500 });
  }
}
