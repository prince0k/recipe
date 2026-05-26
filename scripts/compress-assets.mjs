import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, "../public/assets");

async function main() {
  console.log("▶ Starting static assets compression...");
  
  if (!fs.existsSync(assetsDir)) {
    console.error(`❌ Assets directory not found at ${assetsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(assetsDir);
  const pngFiles = files.filter(f => f.toLowerCase().endsWith(".png"));

  if (pngFiles.length === 0) {
    console.log("ℹ️ No PNG files found in public/assets directory.");
    return;
  }

  for (const file of pngFiles) {
    const filePath = path.join(assetsDir, file);
    const webpFileName = file.replace(/\.png$/i, ".webp");
    const webpPath = path.join(assetsDir, webpFileName);

    const oldStats = fs.statSync(filePath);
    const oldSizeKB = (oldStats.size / 1024).toFixed(1);

    try {
      console.log(`Compressing "${file}" (${oldSizeKB} KB)...`);
      await sharp(filePath)
        .webp({ quality: 80, effort: 4 })
        .toFile(webpPath);

      const newStats = fs.statSync(webpPath);
      const newSizeKB = (newStats.size / 1024).toFixed(1);
      const reduction = ((1 - newStats.size / oldStats.size) * 100).toFixed(1);

      console.log(`✅ Saved "${webpFileName}" (${newSizeKB} KB) - Reduced by ${reduction}%`);
    } catch (err) {
      console.error(`❌ Failed to compress ${file}:`, err.message);
    }
  }

  console.log("🎉 Asset compression complete!");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
