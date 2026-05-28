const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

// Load dotenv
try {
  const dotenv = require("dotenv");
  dotenv.config();
  
  // Also load .env.production if it exists to override environment variables in production
  // We only load this on Linux/macOS (non-win32) to avoid connecting to the VPS path locally on Windows
  const prodEnvPath = path.join(__dirname, "../.env.production");
  if (process.platform !== "win32" && fs.existsSync(prodEnvPath)) {
    console.log("Loading .env.production configuration...");
    const prodEnvConfig = dotenv.parse(fs.readFileSync(prodEnvPath));
    for (const k in prodEnvConfig) {
      process.env[k] = prodEnvConfig[k];
    }
  }
} catch (e) {
  console.log("dotenv not found or .env file missing. Proceeding with process.env variables.");
}

console.log("Database URL in use:", process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 DATABASE SANITIZATION: Stripping localhost/127.0.0.1 prefixes from database records...");

  const contentItems = await prisma.content.findMany({
    select: {
      id: true,
      title: true,
      coverImage: true,
      coverVideo: true,
      body: true,
      schema: true,
    }
  });

  console.log(`Found ${contentItems.length} content items to scan.`);
  let updatedCount = 0;

  for (const item of contentItems) {
    let needsUpdate = false;
    const updateData = {};

    const localhostRegex = /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g;

    if (item.coverImage && localhostRegex.test(item.coverImage)) {
      const cleaned = item.coverImage.replace(localhostRegex, '');
      console.log(`- [CoverImage] Cleaning "${item.title}": "${item.coverImage}" -> "${cleaned}"`);
      updateData.coverImage = cleaned;
      needsUpdate = true;
    }

    if (item.coverVideo && localhostRegex.test(item.coverVideo)) {
      const cleaned = item.coverVideo.replace(localhostRegex, '');
      console.log(`- [CoverVideo] Cleaning "${item.title}": "${item.coverVideo}" -> "${cleaned}"`);
      updateData.coverVideo = cleaned;
      needsUpdate = true;
    }

    if (item.body && localhostRegex.test(item.body)) {
      const cleaned = item.body.replace(localhostRegex, '');
      console.log(`- [Body] Cleaning localhost URLs in body of "${item.title}"`);
      updateData.body = cleaned;
      needsUpdate = true;
    }

    if (item.schema && localhostRegex.test(item.schema)) {
      const cleaned = item.schema.replace(localhostRegex, '');
      console.log(`- [Schema] Cleaning localhost URLs in schema of "${item.title}"`);
      updateData.schema = cleaned;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.content.update({
        where: { id: item.id },
        data: updateData
      });
      updatedCount++;
    }
  }

  console.log(`✅ Sanitization complete. Updated ${updatedCount} content items.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
