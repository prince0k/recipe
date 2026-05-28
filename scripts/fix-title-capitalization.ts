/**
 * Fix Title Capitalization Script
 * 
 * Fixes known lowercase word issues in recipe titles that were caused by
 * automated search-and-replace operations (e.g. "artisanal" -> "authentic",
 * "cinematic" -> "stunning" without fixing case).
 * 
 * Run: npx tsx scripts/fix-title-capitalization.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function fixTitle(title: string): string {
  let fixed = title;
  
  // Fix "authentic" at start of title or after punctuation
  fixed = fixed.replace(/^authentic\b/, 'Authentic');
  fixed = fixed.replace(/: authentic\b/g, ': Authentic');
  
  // Fix "stunning" — usually appears as "A stunning" which should be "A Stunning"
  fixed = fixed.replace(/\bA stunning\b/g, 'A Stunning');
  fixed = fixed.replace(/^stunning\b/, 'Stunning');
  fixed = fixed.replace(/: stunning\b/g, ': Stunning');
  
  // Fix "kitchen" when used as part of a proper name like "Golden kitchen" -> "Golden Kitchen"
  fixed = fixed.replace(/\bGolden kitchen\b/g, 'Golden Kitchen');
  
  // Fix "nourished" in title context
  fixed = fixed.replace(/^nourished\b/, 'Nourished');
  fixed = fixed.replace(/: nourished\b/g, ': Nourished');
  fixed = fixed.replace(/\bA nourished\b/g, 'A Nourished');
  
  // Fix "honest" in title context  
  fixed = fixed.replace(/^honest\b/, 'Honest');
  fixed = fixed.replace(/: honest\b/g, ': Honest');

  // Fix "hearth" when part of a name
  fixed = fixed.replace(/\bGolden hearth\b/g, 'Golden Hearth');
  
  return fixed;
}

function fixExcerpt(excerpt: string): string {
  let fixed = excerpt;
  
  // Fix common lowercased words at the start of sentences in excerpts
  fixed = fixed.replace(/\. authentic\b/g, '. Authentic');
  fixed = fixed.replace(/\. stunning\b/g, '. Stunning');
  fixed = fixed.replace(/\. honest\b/g, '. Honest');
  fixed = fixed.replace(/\. nourished\b/g, '. Nourished');
  
  // Fix "a authentic" -> "an authentic"  
  fixed = fixed.replace(/\ba authentic\b/gi, 'an authentic');
  
  return fixed;
}

async function main() {
  console.log('🔍 Scanning for title capitalization issues...\n');
  
  const allContent = await prisma.content.findMany({
    where: { published: true },
    select: { id: true, title: true, excerpt: true, type: true },
  });
  
  const fixes: { id: string; oldTitle: string; newTitle: string; oldExcerpt: string; newExcerpt: string; type: string }[] = [];
  
  for (const item of allContent) {
    const newTitle = fixTitle(item.title);
    const newExcerpt = fixExcerpt(item.excerpt || '');
    if (newTitle !== item.title || newExcerpt !== (item.excerpt || '')) {
      fixes.push({
        id: item.id,
        oldTitle: item.title,
        newTitle,
        oldExcerpt: item.excerpt || '',
        newExcerpt,
        type: item.type,
      });
    }
  }
  
  if (fixes.length === 0) {
    console.log('✅ No capitalization issues found!');
    await prisma.$disconnect();
    return;
  }
  
  console.log(`Found ${fixes.length} items to fix:\n`);
  fixes.forEach((f, i) => {
    console.log(`  ${i + 1}. [${f.type}]`);
    if (f.oldTitle !== f.newTitle) {
      console.log(`     TITLE OLD: "${f.oldTitle}"`);
      console.log(`     TITLE NEW: "${f.newTitle}"`);
    }
    if (f.oldExcerpt !== f.newExcerpt) {
      console.log(`     EXCERPT: (fixed capitalization)`);
    }
    console.log();
  });
  
  // Apply fixes
  console.log('\n📝 Applying fixes...\n');
  let fixCount = 0;
  for (const fix of fixes) {
    const updateData: any = {};
    if (fix.oldTitle !== fix.newTitle) updateData.title = fix.newTitle;
    if (fix.oldExcerpt !== fix.newExcerpt) updateData.excerpt = fix.newExcerpt;
    
    await prisma.content.update({
      where: { id: fix.id },
      data: updateData,
    });
    fixCount++;
    console.log(`  ✅ Fixed: "${fix.newTitle}"`);
  }
  
  console.log(`\n🎉 Done! Fixed ${fixCount} items.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Error:', e);
  prisma.$disconnect();
  process.exit(1);
});
