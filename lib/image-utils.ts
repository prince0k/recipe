import fs from "fs";
import path from "path";
import sharp from "sharp";

/**
 * Takes any AI-generated image (base64 data URI or external URL like Pollinations)
 * and saves it locally as a compressed WebP file, returning a local /uploads/ path.
 *
 * This keeps all images on your own server — no slow external requests on every page load.
 */
export async function saveAndCompressImage(
  source: string,
  label = "ai-image"
): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "images");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  const fileName = `${Date.now()}-${slug}.jpg`;
  const filePath = path.join(uploadDir, fileName);
  const publicUrl = `/uploads/images/${fileName}`;

  let buffer: Buffer;

  try {
    if (source.startsWith("data:")) {
      // ── Base64 data URI (Gemini inline image) ──────────────────────
      const base64Data = source.split(",")[1];
      buffer = Buffer.from(base64Data, "base64");
    } else {
      // ── External URL (Pollinations, Unsplash, etc.) ─────────────────
      const response = await fetch(source, {
        signal: AbortSignal.timeout(15_000), // 15s timeout
      });
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
      buffer = Buffer.from(await response.arrayBuffer());
    }

    // Compress and resize to max 1200px wide, JPEG quality 85
    await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(filePath);

    const stats = fs.statSync(filePath);
    console.log(
      `[ImageUtil] ✅ Saved ${publicUrl} (${(stats.size / 1024).toFixed(0)} KB)`
    );

    return publicUrl;
  } catch (error: any) {
    console.error(`[ImageUtil] ❌ Failed to save image: ${error.message}`);
    
    // If it was an external URL, we can return it as is (it's not base64)
    if (!source.startsWith("data:")) {
      return source;
    }

    // If it was base64 and failed to save, return a placeholder instead of the massive string
    return "/assets/placeholder-image.jpg"; 
  }
}
