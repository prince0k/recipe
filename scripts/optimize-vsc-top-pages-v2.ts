import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const execute = process.argv.includes("--execute");
  console.log(`Database Migration V2: Deep SEO optimizations`);
  console.log(execute ? "⚠️ EXECUTION MODE ACTIVE: Writing changes to database..." : "🔍 DRY-RUN MODE ACTIVE: No changes will be saved. Pass --execute to save.");

  const jsonPath = path.join(__dirname, "..", "scratch", "vps-content-optimized-11.json");
  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: Optimized JSON file not found at ${jsonPath}`);
    process.exit(1);
  }

  const records = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  console.log(`Loaded ${records.length} records from JSON.`);

  for (const record of records) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Processing slug: ${record.slug}`);
    
    // Check if record exists in the database
    const dbRecord = await prisma.content.findFirst({
      where: { slug: record.slug }
    });

    if (!dbRecord) {
      console.log(`❌ NOT FOUND in database. Skipping.`);
      continue;
    }

    console.log(`Found record: ${dbRecord.title}`);
    console.log(`- SEO Title: "${dbRecord.seoTitle}" -> "${record.seoTitle}"`);
    console.log(`- SEO Desc: "${dbRecord.seoDesc}" -> "${record.seoDesc}"`);
    console.log(`- Keywords: "${dbRecord.keywords}" -> "${record.keywords}"`);
    console.log(`- Tags: "${dbRecord.tags}" -> "${record.tags}"`);
    console.log(`- Body length difference: ${record.body.length - (dbRecord.body?.length || 0)} characters`);

    if (execute) {
      await prisma.content.update({
        where: { id: dbRecord.id },
        data: {
          seoTitle: record.seoTitle,
          seoDesc: record.seoDesc,
          keywords: record.keywords,
          tags: record.tags,
          body: record.body
        }
      });
      console.log(`✅ UPDATE SUCCESSFUL!`);
    } else {
      console.log(`(Dry-run) Would update record.`);
    }
  }

  console.log("\n==================================================");
  console.log("Migration complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
