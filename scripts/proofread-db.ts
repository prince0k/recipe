import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const writeMode = process.argv.includes('--write');

function cleanText(text: string): string {
  if (!text) return text;
  let cleaned = text;

  // 1. Fix Stwart typo
  cleaned = cleaned.replace(/Stwart/g, 'Stewart');
  cleaned = cleaned.replace(/stwart/g, 'stewart');

  // 2. Fix over-reliance on AI words
  // "cinematic" replacements
  cleaned = cleaned.replace(/\ba cinematic guide\b/gi, 'a complete guide');
  cleaned = cleaned.replace(/\bA Cinematic Guide\b/g, 'A Complete Guide');
  cleaned = cleaned.replace(/\bcinematic guide\b/gi, 'complete guide');
  cleaned = cleaned.replace(/\bCinematic Guide\b/g, 'Complete Guide');
  cleaned = cleaned.replace(/\ba cinematic approach\b/gi, 'a practical approach');
  cleaned = cleaned.replace(/\bA Cinematic Approach\b/g, 'A Practical Approach');
  cleaned = cleaned.replace(/\bcinematic approach\b/gi, 'practical approach');
  cleaned = cleaned.replace(/\bCinematic Approach\b/g, 'Practical Approach');
  cleaned = cleaned.replace(/\bcinematic meal prep\b/gi, 'smart meal prep');
  cleaned = cleaned.replace(/\bCinematic Meal Prep\b/g, 'Smart Meal Prep');
  cleaned = cleaned.replace(/\ba cinematic ode\b/gi, 'a celebration');
  cleaned = cleaned.replace(/\bA Cinematic Ode\b/g, 'A Celebration');
  cleaned = cleaned.replace(/\bcinematic ode\b/gi, 'celebration');
  cleaned = cleaned.replace(/\bCinematic Ode\b/g, 'Celebration');
  cleaned = cleaned.replace(/\bcinematic keto compass\b/gi, 'keto compass');
  cleaned = cleaned.replace(/\bCinematic Keto Compass\b/g, 'Keto Compass');
  cleaned = cleaned.replace(/\bcinematic blueprint\b/gi, 'essential blueprint');
  cleaned = cleaned.replace(/\bCinematic Blueprint\b/g, 'Essential Blueprint');
  cleaned = cleaned.replace(/\bcinematic sleep\b/gi, 'essential sleep');
  cleaned = cleaned.replace(/\bCinematic Sleep\b/g, 'Essential Sleep');
  cleaned = cleaned.replace(/\bcinematic hydration\b/gi, 'optimal hydration');
  cleaned = cleaned.replace(/\bCinematic Hydration\b/g, 'Optimal Hydration');
  
  // Generic "cinematic"
  cleaned = cleaned.replace(/\bcinematic\b/gi, 'complete');
  cleaned = cleaned.replace(/\bCinematic\b/g, 'Complete');

  // "artisanal" replacements
  cleaned = cleaned.replace(/\ban artisanal smoothie bowl\b/gi, 'a healthy smoothie bowl');
  cleaned = cleaned.replace(/\bAn Artisanal Smoothie Bowl\b/g, 'A Healthy Smoothie Bowl');
  cleaned = cleaned.replace(/\bartisanal smoothie bowl\b/gi, 'healthy smoothie bowl');
  cleaned = cleaned.replace(/\bArtisanal Smoothie Bowl\b/g, 'Healthy Smoothie Bowl');
  cleaned = cleaned.replace(/\ban artisanal approach\b/gi, 'a structured approach');
  cleaned = cleaned.replace(/\bAn Artisanal Approach\b/g, 'A Structured Approach');
  cleaned = cleaned.replace(/\bartisanal approach\b/gi, 'practical approach');
  cleaned = cleaned.replace(/\bArtisanal Approach\b/g, 'Practical Approach');
  
  // Generic "artisanal"
  cleaned = cleaned.replace(/\bartisanal\b/gi, 'healthy');
  cleaned = cleaned.replace(/\bArtisanal\b/g, 'Healthy');

  // "honest" replacements
  cleaned = cleaned.replace(/\bhonest eating\b/gi, 'healthy eating');
  cleaned = cleaned.replace(/\bHonest Eating\b/g, 'Healthy Eating');
  cleaned = cleaned.replace(/\bhonest, stunning\b/gi, 'expert, practical');
  cleaned = cleaned.replace(/\bHonest, Stunning\b/g, 'Expert, Practical');
  cleaned = cleaned.replace(/\bartistry in honest eating\b/gi, 'the art of healthy eating');
  cleaned = cleaned.replace(/\bArtistry in Honest Eating\b/g, 'The Art of Healthy Eating');
  cleaned = cleaned.replace(/\bhonest ingredients\b/gi, 'simple ingredients');
  cleaned = cleaned.replace(/\bHonest ingredients\b/gi, 'Simple ingredients');
  cleaned = cleaned.replace(/\bHonest Ingredients\b/g, 'Simple Ingredients');
  cleaned = cleaned.replace(/\bhonest cooking\b/gi, 'healthy cooking');
  cleaned = cleaned.replace(/\bHonest cooking\b/gi, 'Healthy cooking');
  cleaned = cleaned.replace(/\bHonest Cooking\b/g, 'Healthy Cooking');
  cleaned = cleaned.replace(/\bhonest delights\b/gi, 'healthy delights');
  cleaned = cleaned.replace(/\bHonest Delights\b/g, 'Healthy Delights');
  cleaned = cleaned.replace(/\bhonest science\b/gi, 'reliable science');
  cleaned = cleaned.replace(/\bHonest Science\b/g, 'Reliable Science');
  cleaned = cleaned.replace(/\bhonest recovery\b/gi, 'optimal recovery');
  cleaned = cleaned.replace(/\bHonest Recovery\b/g, 'Optimal Recovery');
  cleaned = cleaned.replace(/\bhonest, whole\b/gi, 'fresh, whole');
  cleaned = cleaned.replace(/\bHonest, whole\b/g, 'Fresh, whole');
  cleaned = cleaned.replace(/\bhonest\b/gi, 'simple');
  cleaned = cleaned.replace(/\bHonest\b/g, 'Simple');

  // "stunning" replacements
  cleaned = cleaned.replace(/\ba stunning\b/gi, 'a great');
  cleaned = cleaned.replace(/\bA stunning\b/g, 'A great');
  cleaned = cleaned.replace(/\bstunning morning ritual\b/gi, 'healthy morning ritual');
  cleaned = cleaned.replace(/\bStunning Morning Ritual\b/g, 'Healthy Morning Ritual');
  cleaned = cleaned.replace(/\bstunning tips\b/gi, 'expert tips');
  cleaned = cleaned.replace(/\bStunning Tips\b/g, 'Expert Tips');
  cleaned = cleaned.replace(/\bstunning feast\b/gi, 'delicious feast');
  cleaned = cleaned.replace(/\bStunning Feast\b/g, 'Delicious Feast');
  cleaned = cleaned.replace(/\bstunningally\b/gi, 'wonderfully');
  cleaned = cleaned.replace(/\bstunningly\b/gi, 'wonderfully');
  cleaned = cleaned.replace(/\bstunning\b/gi, 'excellent');
  cleaned = cleaned.replace(/\bStunning\b/g, 'Excellent');

  // Fix capitalization after punctuation or start of sentence/phrase
  cleaned = cleaned.replace(/^authentic\b/, 'Authentic');
  cleaned = cleaned.replace(/: authentic\b/g, ': Authentic');
  cleaned = cleaned.replace(/: A authentic\b/g, ': An Authentic');
  cleaned = cleaned.replace(/\bA stunning\b/g, 'A Stunning');
  cleaned = cleaned.replace(/^stunning\b/, 'Stunning');
  cleaned = cleaned.replace(/: stunning\b/g, ': Stunning');
  cleaned = cleaned.replace(/\bGolden kitchen\b/g, 'Golden Kitchen');
  cleaned = cleaned.replace(/^nourished\b/, 'Nourished');
  cleaned = cleaned.replace(/: nourished\b/g, ': Nourished');
  cleaned = cleaned.replace(/^honest\b/, 'Honest');
  cleaned = cleaned.replace(/: honest\b/g, ': Honest');

  return cleaned;
}

function generateCleanSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, '');    // Remove leading/trailing hyphens
}

async function main() {
  console.log(`Proofreading Database... [Mode: ${writeMode ? 'WRITE' : 'DRY RUN'}]\n`);

  const allContent = await prisma.content.findMany();
  
  let changeCount = 0;
  
  // Track slugs to ensure uniqueness
  const slugRegistry = new Set<string>();

  for (const item of allContent) {
    const originalTitle = item.title;
    const originalExcerpt = item.excerpt;
    const originalBody = item.body;
    const originalSeoTitle = item.seoTitle || '';
    const originalSeoDesc = item.seoDesc || '';
    const originalSlug = item.slug;

    // Clean text fields
    const newTitle = cleanText(originalTitle);
    const newExcerpt = cleanText(originalExcerpt);
    const newBody = cleanText(originalBody);
    const newSeoTitle = cleanText(originalSeoTitle);
    const newSeoDesc = cleanText(originalSeoDesc);

    // Slug cleanup: generate clean slug from new title and resolve conflicts
    let baseSlug = generateCleanSlug(newTitle);
    
    // Check if the original slug had a suffix, e.g. -17bx1d or -54glx or -w201p
    // We want to remove any random 5-6 character alphanumeric suffix that was added for DB uniqueness/import,
    // BUT we must not remove actual parts of words.
    // Our generateCleanSlug from newTitle automatically creates a clean base slug without any random suffix!
    // So we can use that baseSlug as our new starting point.
    let targetSlug = baseSlug;
    let counter = 1;
    
    while (slugRegistry.has(targetSlug)) {
      counter++;
      targetSlug = `${baseSlug}-${counter}`;
    }
    
    slugRegistry.add(targetSlug);

    const hasTitleChange = originalTitle !== newTitle;
    const hasExcerptChange = originalExcerpt !== newExcerpt;
    const hasBodyChange = originalBody !== newBody;
    const hasSeoTitleChange = originalSeoTitle !== newSeoTitle;
    const hasSeoDescChange = originalSeoDesc !== newSeoDesc;
    const hasSlugChange = originalSlug !== targetSlug;

    if (hasTitleChange || hasExcerptChange || hasBodyChange || hasSeoTitleChange || hasSeoDescChange || hasSlugChange) {
      changeCount++;
      console.log(`----------------------------------------------------------------------`);
      console.log(`Item ID: ${item.id} [${item.type}]`);
      
      if (hasTitleChange) {
        console.log(`  Title:`);
        console.log(`    OLD: "${originalTitle}"`);
        console.log(`    NEW: "${newTitle}"`);
      }
      if (hasSlugChange) {
        console.log(`  Slug:`);
        console.log(`    OLD: "${originalSlug}"`);
        console.log(`    NEW: "${targetSlug}"`);
      }
      if (hasExcerptChange) {
        console.log(`  Excerpt: Changed (Stwart/AI terms fixed)`);
      }
      if (hasBodyChange) {
        console.log(`  Body: Changed (Stwart/AI terms fixed)`);
      }
      if (hasSeoTitleChange) {
        console.log(`  SEO Title:`);
        console.log(`    OLD: "${originalSeoTitle}"`);
        console.log(`    NEW: "${newSeoTitle}"`);
      }
      if (hasSeoDescChange) {
        console.log(`  SEO Desc:`);
        console.log(`    OLD: "${originalSeoDesc}"`);
        console.log(`    NEW: "${newSeoDesc}"`);
      }

      if (writeMode) {
        await prisma.content.update({
          where: { id: item.id },
          data: {
            title: newTitle,
            slug: targetSlug,
            excerpt: newExcerpt,
            body: newBody,
            seoTitle: newSeoTitle || null,
            seoDesc: newSeoDesc || null
          }
        });
      }
    } else {
      // Just register the slug if no changes
      slugRegistry.add(originalSlug);
    }
  }

  console.log(`\n======================================================================`);
  console.log(`Total items checked: ${allContent.length}`);
  console.log(`Total items requiring changes: ${changeCount}`);
  
  if (changeCount > 0 && !writeMode) {
    console.log(`\n💡 To apply these changes to the database, run:`);
    console.log(`   npx tsx scripts/proofread-db.ts --write`);
  } else if (changeCount > 0 && writeMode) {
    console.log(`\n✅ Successfully updated ${changeCount} items in the database!`);
  } else {
    console.log(`\n✅ Database is clean! No changes needed.`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
