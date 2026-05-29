import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 Running SEO and Content Verification Scan on VPS Database...\n');
  const allContent = await prisma.content.findMany();

  let typoCount = 0;
  let aiTermsCount = 0;
  let suffixCount = 0;

  for (const item of allContent) {
    const textFields = [
      { name: 'title', val: item.title },
      { name: 'excerpt', val: item.excerpt },
      { name: 'body', val: item.body },
      { name: 'seoTitle', val: item.seoTitle || '' },
      { name: 'seoDesc', val: item.seoDesc || '' },
      { name: 'schema', val: item.schema || '' },
      { name: 'tags', val: item.tags || '[]' }
    ];

    // 1. Check for Stwart typos
    for (const field of textFields) {
      if (field.val.toLowerCase().includes('stwart')) {
        console.log(`❌ Typo Found in [${item.type}] "${item.title}"`);
        console.log(`   Field: ${field.name}`);
        console.log(`   Content: ...${field.val.substring(Math.max(0, field.val.toLowerCase().indexOf('stwart') - 30), field.val.toLowerCase().indexOf('stwart') + 40)}...\n`);
        typoCount++;
      }
    }

    // 2. Check for AI buzzwords
    const aiWords = ['cinematic', 'artisanal', 'honest', 'stunning'];
    for (const word of aiWords) {
      for (const field of textFields) {
        // Exclude tags parsing or valid contexts
        if (field.val.toLowerCase().includes(word)) {
          // If it's the title/slug or description matching the AI generation patterns
          console.log(`⚠️ AI Buzzword "${word}" found in [${item.type}] "${item.title}"`);
          console.log(`   Field: ${field.name}`);
          console.log(`   Content: ...${field.val.substring(Math.max(0, field.val.toLowerCase().indexOf(word) - 30), field.val.toLowerCase().indexOf(word) + 40)}...\n`);
          aiTermsCount++;
        }
      }
    }

    // 3. Check for random ID suffixes in slugs
    // We look for a hyphen followed by 5 or 6 alphanumeric characters at the end of the slug,
    // which either contains at least one digit or has no vowels (identifying random hashes like 54glx, afbpj)
    const slugParts = item.slug.split('-');
    const lastPart = slugParts[slugParts.length - 1];
    const isRandomSuffix = lastPart && 
      /^[a-z0-9]{5,6}$/.test(lastPart) && 
      (/\d/.test(lastPart) || !/[aeiou]/.test(lastPart));

    if (isRandomSuffix) {
      console.log(`❌ Random Suffix found in slug: [${item.type}] "${item.title}"`);
      console.log(`   Slug: ${item.slug}\n`);
      suffixCount++;
    }
  }

  console.log('======================================================================');
  console.log(`📊 SCAN SUMMARY:`);
  console.log(`- Stwart typos: ${typoCount === 0 ? '✅ 0 found' : `❌ ${typoCount} found`}`);
  console.log(`- AI Buzzwords remaining: ${aiTermsCount === 0 ? '✅ 0 found' : `⚠️ ${aiTermsCount} found`}`);
  console.log(`- Slugs with random ID suffixes: ${suffixCount === 0 ? '✅ 0 found' : `❌ ${suffixCount} found`}`);
  console.log('======================================================================\n');

  if (typoCount === 0 && suffixCount === 0) {
    console.log('🎉 Your database content is clean and SEO optimized!');
  } else {
    console.log('💡 To clean up and fix these remaining issues in your database, run:');
    console.log('   npx tsx scripts/proofread-db.ts --write');
  }

  await prisma.$disconnect();
}

verify().catch((e) => {
  console.error('❌ Verification script encountered an error:', e);
  prisma.$disconnect();
  process.exit(1);
});
