import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target directories for compression
const targetDirectories = [
  path.join(__dirname, "../public/assets"),
  path.join(__dirname, "../public/uploads")
];

// Helper to recursively get all files in a directory
function getFilesRecursively(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else {
      results.push(filePath);
    }
  }
  return results;
}

async function main() {
  console.log("▶ Starting comprehensive assets compression...");
  let totalOldSize = 0;
  let totalNewSize = 0;
  let filesCompressed = 0;

  for (const dir of targetDirectories) {
    console.log(`\nScanning directory: ${dir}`);
    if (!fs.existsSync(dir)) {
      console.log(`⚠️ Directory does not exist, skipping.`);
      continue;
    }

    const files = getFilesRecursively(dir);
    const imageFiles = files.filter(filePath => {
      const ext = path.extname(filePath).toLowerCase();
      return [".png", ".jpg", ".jpeg", ".webp"].includes(ext);
    });

    console.log(`Found ${imageFiles.length} image files to process.`);

    for (const filePath of imageFiles) {
      const relativePath = path.relative(path.join(__dirname, ".."), filePath);
      const ext = path.extname(filePath).toLowerCase();
      const oldStats = fs.statSync(filePath);
      const oldSize = oldStats.size;
      totalOldSize += oldSize;

      try {
        console.log(`Processing "${relativePath}" (${(oldSize / 1024).toFixed(1)} KB)...`);
        
        // Read file to buffer first to prevent file lock issues when overwriting
        const inputBuffer = fs.readFileSync(filePath);
        let sharpInstance = sharp(inputBuffer);

        if (ext === ".png") {
          sharpInstance = sharpInstance.png({ quality: 80, palette: true, compressionLevel: 8 });
        } else if (ext === ".jpg" || ext === ".jpeg") {
          sharpInstance = sharpInstance.jpeg({ quality: 80, progressive: true });
        } else if (ext === ".webp") {
          sharpInstance = sharpInstance.webp({ quality: 80, effort: 4 });
        }

        const outputBuffer = await sharpInstance.toBuffer();

        // Only overwrite if it actually saved space
        if (outputBuffer.length < oldSize) {
          fs.writeFileSync(filePath, outputBuffer);
          const newSize = outputBuffer.length;
          totalNewSize += newSize;
          const savings = ((1 - newSize / oldSize) * 100).toFixed(1);
          console.log(`  ✅ Compressed: ${(newSize / 1024).toFixed(1)} KB (Reduced by ${savings}%)`);
          filesCompressed++;
        } else {
          totalNewSize += oldSize;
          console.log(`  ℹ️ Already optimized (No size reduction)`);
        }
      } catch (err) {
        totalNewSize += oldSize;
        console.error(`  ❌ Failed to compress ${relativePath}:`, err.message);
      }
    }
  }

  console.log("\n========================================");
  console.log("🎉 Asset compression complete!");
  console.log(`Files updated/compressed: ${filesCompressed}`);
  console.log(`Total original size: ${(totalOldSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total optimized size: ${(totalNewSize / 1024 / 1024).toFixed(2)} MB`);
  if (totalOldSize > 0) {
    const totalSavings = ((1 - totalNewSize / totalOldSize) * 100).toFixed(1);
    console.log(`Net space savings: ${totalSavings}%`);
  }
  console.log("========================================");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
