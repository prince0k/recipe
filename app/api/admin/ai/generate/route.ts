import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getGeminiResponse, generateImage, STWART_LUCAS_VOICE, AI_SEO_GUIDELINES } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, type } = await req.json();

    if (!topic || !type) {
      return NextResponse.json({ error: "Missing topic or type" }, { status: 400 });
    }

    const prompt = `
      ${STWART_LUCAS_VOICE}
      ${AI_SEO_GUIDELINES}

      Task: Generate a premium, cinematic ${type} about: "${topic}".
      
      **CRITICAL INSTRUCTION - IMAGES**: 
      You MUST insert exactly 2 image placeholders in the body text at appropriate transition points. 
      Format: [[IMAGE_PROMPT: description]]
      Example: [[IMAGE_PROMPT: A vibrant overhead shot of a Mediterranean salad with feta and olives]]
      The description should be detailed for DALL-E.

      **Layout Requirements**:
      - Use attractive HTML with better use of inline CSS for spacing and typography.
      - **NO Concentrated Center**: Ensure text uses a comfortable reading width but sections feel expansive. Use <section> tags with padding.
      - Use <h2> and <h3> for hierarchy.
      - Add a "Pro Tip" or "Stwart's Secret" box with a light background and border.

      Requirements for ${type}:
      - **Title**: Catchy and SEO-optimized.
      - **Excerpt**: 2-3 sentences summarizing the content.
      - **Body**: Detailed HTML content (1200+ words for blogs).
      - **SEO**: Meta title and Meta description.
      - **Tags**: 3-5 relevant tags.
      - **Schema**: A JSON-LD string.

      Return the response in Strict JSON format:
      {
        "title": "...",
        "excerpt": "...",
        "body": "...", 
        "seoTitle": "...",
        "seoDesc": "...",
        "tags": ["...", "..."],
        "schema": "...",
        "coverImagePrompt": "Description for the main cover image"
      }
    `;

    const aiResponse = await getGeminiResponse(prompt, true);
    const data = JSON.parse(aiResponse || "{}");

    // 1. Generate Cover Image
    const coverImageUrl = await generateImage(data.coverImagePrompt || `Professional food photography of ${topic}`);

    // 2. Process Body Images
    let finalBody = data.body;
    let imageMatches = finalBody.match(/\[\[IMAGE_PROMPT: (.*?)\]\]/g);
    
    // Fallback: If AI forgot to include placeholders, force-insert them
    if (!imageMatches) {
      console.log("AI forgot image placeholders, manually inserting...");
      const sections = finalBody.split('</section>');
      if (sections.length > 2) {
        sections[0] += `\n[[IMAGE_PROMPT: Cinematic food photography related to ${topic}]]\n</section>`;
        sections[1] += `\n[[IMAGE_PROMPT: Artisanal culinary detail shot for ${topic}]]\n</section>`;
        finalBody = sections.join('');
        imageMatches = finalBody.match(/\[\[IMAGE_PROMPT: (.*?)\]\]/g);
      }
    }

    if (imageMatches) {
      for (const match of imageMatches) {
        const promptText = match.replace("[[IMAGE_PROMPT: ", "").replace("]]", "");
        const url = await generateImage(promptText);
        if (url) {
          const imgHtml = `
            <div style="margin: 4rem 0; text-align: center; width: 100%;">
              <img src="${url}" alt="${topic}" style="width: 100%; max-height: 600px; object-fit: cover; border-radius: 2rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);" />
              <p style="margin-top: 1rem; font-style: italic; color: #666; font-size: 0.9rem;">${promptText}</p>
            </div>
          `;
          finalBody = finalBody.replace(match, imgHtml);
        } else {
          finalBody = finalBody.replace(match, ""); // Remove if fails
        }
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
        body: finalBody,
        coverImage: coverImageUrl,
        tags: JSON.stringify(data.tags || []),
        seoTitle: data.seoTitle,
        seoDesc: data.seoDesc,
        schema: data.schema,
        published: false,
      }
    });

    return NextResponse.json({ success: true, id: content.id, title: content.title });
  } catch (error: any) {
    console.error("Content Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
