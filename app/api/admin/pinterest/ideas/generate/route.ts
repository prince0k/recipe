import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getGeminiResponse, generateImage, STEWART_LUCAS_VOICE } from "@/lib/ai";
import { sendPinterestAlertEmail } from "@/lib/email";
import { applyTextOverlay, uploadToImgBB } from "@/lib/pinterest-utils";
import { getPromptByType } from "@/lib/prompts";
import { saveAndCompressImage } from "@/lib/image-utils";
import fs from "fs";
import path from "path";

// Helper to convert base64 or URL image data to Buffer
async function getBufferFromImageData(rawData: string): Promise<Buffer> {
  if (rawData.startsWith("data:")) {
    const base64Data = rawData.split(",")[1];
    return Buffer.from(base64Data, "base64");
  } else if (rawData.startsWith("/")) {
    const filePath = path.join(process.cwd(), "public", rawData);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath);
    }
  }
  const response = await fetch(rawData);
  return Buffer.from(await response.arrayBuffer());
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

function extractFirstJSONObject(str: string): string {
  const startIdx = str.indexOf("{");
  if (startIdx === -1) {
    throw new Error("Could not find start of JSON object");
  }
  
  let braceCount = 0;
  let inString = false;
  let escapeNext = false;
  
  for (let i = startIdx; i < str.length; i++) {
    const char = str[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === "\\") {
      escapeNext = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === "{") {
        braceCount++;
      } else if (char === "}") {
        braceCount--;
        if (braceCount === 0) {
          return str.substring(startIdx, i + 1);
        }
      }
    }
  }
  
  throw new Error("Could not find matching closing brace for JSON object");
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

    // 2. Determine type and generate content draft (HTML)
    const contentType = idea.type || (idea.title.toLowerCase().includes("recipe") || idea.concept.toLowerCase().includes("recipe") ? "RECIPE" : "BLOG");
    const contentPrompt = getPromptByType(contentType, idea.title);

    console.log(`🧠 Generating standard ${contentType} content draft for "${idea.title}"...`);
    const contentResponseText = await getGeminiResponse(contentPrompt, true);
    
    const cleanContentJson = extractFirstJSONObject(contentResponseText);
    const contentData = JSON.parse(cleanContentJson);

    // 3. Generate Pinterest Pin Metadata for the new post
    const pinMetadataPrompt = `
We need to generate Pinterest Pin metadata for the following new blog post:
Title: "${contentData.title || idea.title}"
Excerpt: "${contentData.excerpt || idea.concept}"

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

    console.log("📌 Generating Pinterest pin metadata...");
    const pinMetaResponse = await getGeminiResponse(pinMetadataPrompt, true);
    const cleanPinMetaJson = extractFirstJSONObject(pinMetaResponse);
    const pinMeta = JSON.parse(cleanPinMetaJson);

    // 4. Generate visual cover image (used for both website cover image and pin base)
    // Hardcoded to the exact premium wellness brand food bowl prompt specified by user to ensure consistency and save credits
    const finalImagePrompt = "Redesign this health landing-page hero image for a premium wellness brand. Keep the healthy food bowl aesthetic (avocado, greens, grilled protein) but make it modern, clean, and high-converting.";
    console.log(`🎨 Generating AI image with prompt: "${finalImagePrompt}"`);
    const rawImage = await generateImage(finalImagePrompt, "preview");
    
    // Save/compress local cover image for website
    console.log("💾 Saving and compressing cover image for website...");
    const coverImageUrl = await saveAndCompressImage(rawImage, contentData.title || idea.title);

    // Save draft Content in database (fully populated!)
    const slug = slugify(contentData.title || idea.title) + "-" + Math.floor(Math.random() * 1000);
    
    // Auto-classification of tags (supporting both what Gemini returns and standard category fallbacks)
    const tags: string[] = Array.isArray(contentData.tags) ? contentData.tags : [];
    const lowerTitle = (contentData.title || idea.title).toLowerCase();
    if (lowerTitle.includes("breakfast") && !tags.includes("Breakfast")) tags.push("Breakfast");
    if (lowerTitle.includes("lunch") && !tags.includes("Lunch")) tags.push("Lunch");
    if (lowerTitle.includes("dinner") && !tags.includes("Dinner")) tags.push("Dinner");
    if (lowerTitle.includes("snack") && !tags.includes("Snacks")) tags.push("Snacks");

    const contentDraft = await prisma.content.create({
      data: {
        title: contentData.title || idea.title,
        slug,
        type: contentType,
        excerpt: contentData.excerpt || idea.concept.substring(0, 160),
        body: contentData.body,
        coverImage: coverImageUrl,
        coverImagePrompt: finalImagePrompt,
        ingredients: contentData.ingredients ? JSON.stringify(contentData.ingredients) : "[]",
        cookingTime: contentData.cookingTime || null,
        prepTime: contentData.prepTime || null,
        difficulty: contentData.difficulty || null,
        servings: contentData.servings || null,
        calories: contentData.calories || null,
        fat: contentData.fat || null,
        carbs: contentData.carbs || null,
        protein: contentData.protein || null,
        tags: JSON.stringify([...new Set(tags)]),
        seoTitle: contentData.seoTitle || null,
        seoDesc: contentData.seoDesc || null,
        schema: typeof contentData.schema === 'object' ? JSON.stringify(contentData.schema) : (contentData.schema || null),
        published: false // Starts as Draft
      }
    });

    // 5. Composite Text Overlay onto new image for the Pinterest pin
    console.log(`✍️ Compositing text overlay: "${pinMeta.textOverlay}"`);
    const imageBuffer = await getBufferFromImageData(rawImage);
    const compositeBuffer = await applyTextOverlay(imageBuffer, pinMeta.textOverlay, {
      position: pinMeta.overlayPosition || "bottom",
      style: pinMeta.overlayStyle || "dark",
      title: "NutriGuide"
    });

    // Save Pinterest pin image locally
    const fileName = `pin-new-${contentDraft.id}-${Date.now()}.jpg`;
    const localFilePath = path.join(draftUploadDir, fileName);
    fs.writeFileSync(localFilePath, compositeBuffer);
    
    let publicImageUrl = `/uploads/pinterest/drafts/${fileName}`;

    // Upload to ImgBB if key is present
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

      // Use existing cover image for the old/evergreen post to save credits, fallback to generation only if coverImage is missing
      let oldImageBuffer: Buffer;
      if (oldContent.coverImage) {
        console.log(`♻️ Reusing existing cover image for old post "${oldContent.title}": ${oldContent.coverImage}`);
        oldImageBuffer = await getBufferFromImageData(oldContent.coverImage);
      } else {
        console.log(`🎨 Generating AI image for old post with prompt: "${oldPinMeta.imagePrompt}"`);
        const rawOldImage = await generateImage(oldPinMeta.imagePrompt, "preview");
        oldImageBuffer = await getBufferFromImageData(rawOldImage);
      }

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
