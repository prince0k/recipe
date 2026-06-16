import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getGeminiResponse, generateImage, STEWART_LUCAS_VOICE } from "@/lib/ai";
import { sendPinterestAlertEmail } from "@/lib/email";
import { applyTextOverlay, uploadToImgBB } from "@/lib/pinterest-utils";
import fs from "fs";
import path from "path";

// Helper to convert base64 or URL image data to Buffer
async function getBufferFromImageData(rawData: string): Promise<Buffer> {
  if (rawData.startsWith("data:")) {
    const base64Data = rawData.split(",")[1];
    return Buffer.from(base64Data, "base64");
  } else {
    const response = await fetch(rawData);
    return Buffer.from(await response.arrayBuffer());
  }
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ideaId } = await req.json();
    if (!ideaId) {
      return NextResponse.json({ error: "Missing idea ID" }, { status: 400 });
    }

    // 1. Fetch Approved Idea
    const idea = await prisma.pinterestIdea.findUnique({
      where: { id: ideaId }
    });

    if (!idea || idea.status !== "APPROVED") {
      return NextResponse.json({ error: "Idea not found or not approved" }, { status: 400 });
    }

    console.log(`🤖 Generating blog content and Pin for: "${idea.title}"`);

    // Ensure local directory exists for drafts
    const draftUploadDir = path.join(process.cwd(), "public", "uploads", "pinterest", "drafts");
    if (!fs.existsSync(draftUploadDir)) {
      fs.mkdirSync(draftUploadDir, { recursive: true });
    }

    // 2. Generate Full Recipe / Blog Post Draft using Gemini (Stewart Lucas tone)
    const contentPrompt = `
You are Stewart Lucas, the expert culinary coach and nutritionist at NutriGuide.
Tone guidelines:
${STEWART_LUCAS_VOICE}

Please write a complete, high-quality, professional, science-backed recipe or healthy nutrition blog post based on the following approved idea:
Title: "${idea.title}"
Concept: "${idea.concept}"

Include:
- An engaging introduction written in your conversational, sensory-rich voice.
- For a recipe: prep time, cook time, list of ingredients (in JSON-friendly array notation if possible, but write normally), and clear step-by-step instructions.
- For a blog post: clear section headings (H2/H3) and practical wellness tips.
- A "Key Takeaways" or quick summary at the start.
- An FAQ section with 3 frequently asked questions at the end.

Provide your response strictly in clean Markdown format. Do not use block codes or wrapper text outside the markdown.
`;

    const generatedBody = await getGeminiResponse(contentPrompt, false);
    
    // Save draft Content in database
    const slug = slugify(idea.title) + "-" + Math.floor(Math.random() * 1000);
    const contentDraft = await prisma.content.create({
      data: {
        title: idea.title,
        slug,
        type: idea.title.toLowerCase().includes("recipe") || idea.concept.toLowerCase().includes("recipe") ? "RECIPE" : "BLOG",
        excerpt: idea.concept.substring(0, 160),
        body: generatedBody,
        published: false // Starts as Draft
      }
    });

    // 3. Generate Pinterest Pin Metadata for the new post
    const pinMetadataPrompt = `
We need to generate Pinterest Pin metadata for the following new blog post:
Title: "${idea.title}"
Concept: "${idea.concept}"

Please provide:
1. An optimized, click-worthy Pin Title (max 100 characters).
2. An optimized Pin Description (max 500 characters, including 3 relevant hashtags, keywords, and a clear call-to-action).
3. A recommended Pinterest Board Name (e.g. "Healthy Breakfasts", "Gut Health Tips", "Keto Diet Recipes").
4. A visual image prompt suitable for a professional food photography shot of this topic.
5. The text overlay string to be written on the Pin image (short, punchy, click-enticing, max 30 characters, e.g. "Soy-Free Vegan Tart").
6. The overlay position: "top", "center", or "bottom".
7. The overlay style: "dark", "light", or "accent".

Return your response strictly in JSON format. Do not return markdown boxes, just return the JSON string.
Format:
{
  "pinTitle": "...",
  "pinDescription": "...",
  "boardName": "...",
  "imagePrompt": "...",
  "textOverlay": "...",
  "overlayPosition": "top|center|bottom",
  "overlayStyle": "dark|light|accent"
}
`;

    const pinMetaResponse = await getGeminiResponse(pinMetadataPrompt, true);
    const pinMeta = JSON.parse(pinMetaResponse);

    // 4. Generate Pin Image for the new post
    console.log(`🎨 Generating AI image for new post with prompt: "${pinMeta.imagePrompt}"`);
    const rawImage = await generateImage(pinMeta.imagePrompt, "preview");
    const imageBuffer = await getBufferFromImageData(rawImage);

    // 5. Composite Text Overlay onto new image
    console.log(`✍️ Compositing text overlay: "${pinMeta.textOverlay}"`);
    const compositeBuffer = await applyTextOverlay(imageBuffer, pinMeta.textOverlay, {
      position: pinMeta.overlayPosition || "bottom",
      style: pinMeta.overlayStyle || "dark",
      title: "NutriGuide"
    });

    // Save image locally
    const fileName = `pin-new-${contentDraft.id}-${Date.now()}.jpg`;
    const localFilePath = path.join(draftUploadDir, fileName);
    fs.writeFileSync(localFilePath, compositeBuffer);
    
    let publicImageUrl = `/uploads/pinterest/drafts/${fileName}`;

    // Upload to ImgBB if key is present (great for local testing)
    const imgbbKey = process.env.IMGBB_API_KEY;
    if (imgbbKey) {
      try {
        console.log("☁️ Uploading new Pin image to ImgBB...");
        publicImageUrl = await uploadToImgBB(compositeBuffer, imgbbKey);
        console.log(`✅ ImgBB Upload Success: ${publicImageUrl}`);
      } catch (err: any) {
        console.warn("⚠️ ImgBB Upload failed, using local path fallback:", err.message);
      }
    }

    // Save PinterestPin draft in DB
    const newPin = await prisma.pinterestPin.create({
      data: {
        ideaId,
        contentId: contentDraft.id,
        title: pinMeta.pinTitle,
        description: pinMeta.pinDescription,
        boardName: pinMeta.boardName,
        imageUrl: publicImageUrl,
        textOverlay: pinMeta.textOverlay,
        overlayPosition: pinMeta.overlayPosition,
        overlayStyle: pinMeta.overlayStyle,
        isNew: true,
        status: "DRAFT"
      }
    });

    // 6. Evergreen Mix: Pick an existing published recipe/blog post
    console.log("♻️ Selecting an existing published post for traffic-mixing...");
    
    // Find already pinned content IDs to exclude them if possible
    const pinnedPins = await prisma.pinterestPin.findMany({
      select: { contentId: true }
    });
    const pinnedContentIds = pinnedPins.map(p => p.contentId).filter(Boolean) as string[];

    let oldContent = await prisma.content.findFirst({
      where: {
        published: true,
        id: { notIn: pinnedContentIds }
      },
      orderBy: { createdAt: "asc" }
    });

    if (!oldContent) {
      // Fallback: Pick oldest published
      oldContent = await prisma.content.findFirst({
        where: { published: true },
        orderBy: { createdAt: "asc" }
      });
    }

    if (oldContent) {
      console.log(`♻️ Selected old content: "${oldContent.title}"`);

      // Generate Pin Metadata for the old post
      const oldPinPrompt = `
We need to generate Pinterest Pin metadata for an existing blog post.
Title: "${oldContent.title}"
Excerpt: "${oldContent.excerpt}"

Please provide:
1. An optimized, click-worthy Pin Title (max 100 characters).
2. An optimized Pin Description (max 500 characters, including 3 relevant hashtags, keywords, and a clear call-to-action).
3. A recommended Pinterest Board Name (e.g. "Healthy Breakfasts", "Gut Health Tips", "Keto Diet Recipes").
4. A visual image prompt suitable for a professional food photography shot of this topic.
5. The text overlay string to be written on the Pin image (short, punchy, click-enticing, max 30 characters, e.g. "Low-Carb Harvest Bowl").
6. The overlay position: "top", "center", or "bottom".
7. The overlay style: "dark", "light", or "accent".

Return response strictly as raw JSON:
{
  "pinTitle": "...",
  "pinDescription": "...",
  "boardName": "...",
  "imagePrompt": "...",
  "textOverlay": "...",
  "overlayPosition": "top|center|bottom",
  "overlayStyle": "dark|light|accent"
}
`;

      const oldPinMetaResponse = await getGeminiResponse(oldPinPrompt, true);
      const oldPinMeta = JSON.parse(oldPinMetaResponse);

      // Generate AI image for old content
      console.log(`🎨 Generating AI image for old post with prompt: "${oldPinMeta.imagePrompt}"`);
      const rawOldImage = await generateImage(oldPinMeta.imagePrompt, "preview");
      const oldImageBuffer = await getBufferFromImageData(rawOldImage);

      // Composite Text Overlay
      const oldCompositeBuffer = await applyTextOverlay(oldImageBuffer, oldPinMeta.textOverlay, {
        position: oldPinMeta.overlayPosition || "bottom",
        style: oldPinMeta.overlayStyle || "dark",
        title: "NutriGuide"
      });

      const oldFileName = `pin-old-${oldContent.id}-${Date.now()}.jpg`;
      const oldLocalFilePath = path.join(draftUploadDir, oldFileName);
      fs.writeFileSync(oldLocalFilePath, oldCompositeBuffer);
      
      let oldPublicImageUrl = `/uploads/pinterest/drafts/${oldFileName}`;

      if (imgbbKey) {
        try {
          console.log("☁️ Uploading old Pin image to ImgBB...");
          oldPublicImageUrl = await uploadToImgBB(oldCompositeBuffer, imgbbKey);
          console.log(`✅ ImgBB Upload Success: ${oldPublicImageUrl}`);
        } catch (err: any) {
          console.warn("⚠️ ImgBB Upload failed for old content, using local path:", err.message);
        }
      }

      // Save old PinterestPin draft in DB
      await prisma.pinterestPin.create({
        data: {
          contentId: oldContent.id,
          title: oldPinMeta.pinTitle,
          description: oldPinMeta.pinDescription,
          boardName: oldPinMeta.boardName,
          imageUrl: oldPublicImageUrl,
          textOverlay: oldPinMeta.textOverlay,
          overlayPosition: oldPinMeta.overlayPosition,
          overlayStyle: oldPinMeta.overlayStyle,
          isNew: false,
          status: "DRAFT"
        }
      });
    }

    // 7. Update Idea Status to PROCESSED
    await prisma.pinterestIdea.update({
      where: { id: ideaId },
      data: { status: "PROCESSED" }
    });

    // 8. Email Notification to Admin (review is ready)
    const adminEmail = process.env.ADMIN_EMAIL || "prince4sharmaa123@gmail.com";
    const siteUrl = process.env.SITE_URL || process.env.AUTH_URL || "https://stewartlucas.com";
    const reviewUrl = `${siteUrl.replace(/\/$/, "")}/admin/pinterest/approve-pin`;

    const htmlContent = `
      <p>Hello Stewart Lucas,</p>
      <p>Gemini has successfully generated the draft recipe/blog article and the custom Pinterest Pin graphics (with text overlays) for your approved idea:</p>
      
      <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #e60023; border-radius: 4px; background: #fafafa;">
        <h3 style="margin: 0 0 8px 0; color: #111; font-family: serif; font-size: 18px;">${idea.title}</h3>
        <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.5;">${idea.concept}</p>
      </div>

      <p>A matching evergreen "old post" has also been selected and drafted to maintain traffic-balancing on your Pinterest boards.</p>
      
      <p>Click the button below to review the article drafts and check the visual layout of the overlay graphics before scheduled posting.</p>
      
      <div class="cta-container">
        <a href="${reviewUrl}" class="cta-button">Review & Approve Pins</a>
      </div>
      
      <p>To your health and success,</p>
      <p><strong>The NutriGuide Team</strong></p>
    `;

    console.log(`📧 Sending draft ready email to: ${adminEmail}...`);
    try {
      await sendPinterestAlertEmail({
        to: adminEmail,
        subject: "Pinterest Pin Graphics & Drafts Ready! 📌",
        htmlContent
      });
      console.log("✅ Email notification sent!");
    } catch (err: any) {
      console.error("❌ Failed to send draft email alert:", err.message || err);
    }

    return NextResponse.json({
      success: true,
      newPinId: newPin.id,
      newContentId: contentDraft.id
    });

  } catch (error: any) {
    console.error("Generate content/pin error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
