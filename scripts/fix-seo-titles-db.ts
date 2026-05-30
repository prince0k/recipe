/**
 * Fix SEO Titles DB Script
 * 
 * Updates all Content records in the database with keyword-focused
 * SEO titles that are strictly under 60 characters.
 * 
 * Run: npx tsx scripts/fix-seo-titles-db.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Exact mapping of content IDs to their new keyword-focused, under 60-character SEO titles
const SEO_TITLE_MAPPING: Record<string, string> = {
  // Recipes & Blogs with old "Stewart Lucas" branding / long titles
  'cmorom7g8000ti3wsinkcvl7u': 'High-Protein Pantry Guide | NutriGuide',
  'cmov1hhpg0001i3ro9rqwvs94': 'Golden Lentil Roast Recipe | NutriGuide',
  'cmov1mgwg0003i3ro4g067rfl': 'Healthy Smoothie Bowl Recipe | NutriGuide',
  'cmov24pgf0007i3rov7fp9u81': 'Sugar-Free Dark Chocolate Tart | NutriGuide',
  'cmov25fr80008i3rocruooent': 'High Fiber Harvest Bowl Recipe | NutriGuide',
  'cmov2ebba000bi3ro55imh77j': 'Gluten-Free Bread Baking Guide | NutriGuide',
  'cmov2i1zp000fi3roqqz2b839': 'Budget Healthy Meal Guide | NutriGuide',
  'cmouuw69a0000i3gkc62ul7az': 'Prebiotic 5-Day Meal Plan | NutriGuide',
  'cmov1d6hi0000i3rop3fxph29': 'Mediterranean Diet & Healthy Eating | NutriGuide',
  'cmov1k8wk0002i3rowbmaum3x': 'Intermittent Fasting Guide | NutriGuide',
  'cmov1w6l20005i3ro5c03f9rh': 'Anti-Inflammatory Foods Guide | NutriGuide',
  'cmov23sc00006i3ro83sj66i2': 'Probiotics & Gut Health Guide | NutriGuide',
  'cmov28am70009i3roc0rxsyzy': 'Heart Healthy Fats Guide | NutriGuide',
  'cmov2d0hh000ai3roeq9anlx5': 'Mindful Eating & Nutrition Tips | NutriGuide',
  'cmov2fr1g000di3rovu37618h': 'Superfoods for Longevity Guide | NutriGuide',
  
  // Diet plans
  'cmouuyauh0001i3gkzowfbmdq': 'Prebiotic 5-Day Meal Plan | NutriGuide',
  'cmov1papr0004i3rokpgvfq11': 'Meal Prep for Busy Professionals | NutriGuide',
  'cmov2gahw000ei3roqwbht5qu': 'Post-Workout Recovery Guide | NutriGuide',
  'cmpmhxz5o0000i3qwbbupg49y': '7-Day Anti-Inflammatory Diet | NutriGuide',

  // Cheat sheets & others
  'cmov2eqwb000ci3ron0eib17s': 'Hydration & Electrolytes Guide | NutriGuide',
  'cmpkgrttv0000i3scmifqa1kq': 'Keto Grocery List & Carb Counter | NutriGuide',
  'cmpkgt0et0001i3sc4l650f61': 'Calorie Deficit Quick Start Guide | NutriGuide',
  'cmpkgu7zf0002i3sculn0aeuc': 'Meal Prep Master Template | NutriGuide',
  'cmpkgvqjc0003i3sc74c2ai07': 'IF & Electrolytes Guide | NutriGuide',
  'cmpkgwy4i0004i3sckx327gyk': 'High-Protein Snack Swap | NutriGuide',
  'cmpkgxue30005i3sc0p4mt3o7': 'Gluten-Free Pantry Guide | NutriGuide',
  'cmpkgzo230006i3scpr2zdwpo': 'Under $5 Meal Prep Guide | NutriGuide',
  'cmpkh12vg0007i3sccqmwcuhr': 'Low-FODMAP Digestive Comfort Guide | NutriGuide',
  'cmpkh4kf10000i3sowglfqenw': 'Anti-Inflammatory Spice Matcher | NutriGuide',
  'cmpkh5tag0001i3so3efyqepy': 'Pre & Post-Workout Timing | NutriGuide',
  'cmpkh6lnk0002i3sogc7i3rk0': 'Superfood Smoothie Builder | NutriGuide',
  'cmpkh7lot0003i3sof293ck54': 'Plant-Based Protein Swaps | NutriGuide',
  'cmpkh8skz0004i3so5vijx9ho': 'Sleep & Nutrition Guide | NutriGuide',
  'cmpkh9ymj0005i3solbyi434o': 'Daily Hydration & Electrolytes Guide | NutriGuide',
  'cmpkhaoxf0006i3sof3vgfn2a': 'Mediterranean Diet Daily Checklist | NutriGuide',
  'cmpmihpv80000i3wcs0f5h0qs': 'Keto Grocery List Cheat Sheet | NutriGuide',
};

// Fallback dynamic generator to ensure under-60 characters and NutriGuide branding
function generateFallbackSeoTitle(title: string): string {
  // Strip out old branding suffixes if present
  let clean = title
    .replace(/\s*[|–-]\s*(Stewart Lucas|Lucas Stewart|Expert Nutrition Guide|Stewart Lucas Method|Culinary Coaching|Culinary Nutrition|Culinary comprehensive guide).*/gi, '')
    .trim();
  
  if (clean.length + 13 <= 60) {
    return `${clean} | NutriGuide`;
  }
  if (clean.length > 60) {
    return clean.slice(0, 56) + '...';
  }
  return clean;
}

async function main() {
  console.log('🔍 Fetching all content entries from database...');
  const allContent = await prisma.content.findMany({
    select: { id: true, title: true, seoTitle: true, type: true }
  });

  console.log(`Found ${allContent.length} database entries to process.\n`);
  let updatedCount = 0;

  for (const item of allContent) {
    let targetSeoTitle = SEO_TITLE_MAPPING[item.id];
    
    if (!targetSeoTitle) {
      // Fallback for new/unmapped content
      targetSeoTitle = generateFallbackSeoTitle(item.seoTitle || item.title);
      console.log(`⚠️ Unmapped entry [${item.type}] "${item.title}". Generated fallback: "${targetSeoTitle}"`);
    }

    if (targetSeoTitle.length > 60) {
      console.error(`❌ ERROR: Proposed title exceeds 60 characters: "${targetSeoTitle}" (${targetSeoTitle.length} chars)`);
      continue;
    }

    if (item.seoTitle !== targetSeoTitle) {
      await prisma.content.update({
        where: { id: item.id },
        data: { seoTitle: targetSeoTitle }
      });
      console.log(`✅ [${item.type}] Title Updated:`);
      console.log(`   Old: "${item.seoTitle || '(NULL)'}"`);
      console.log(`   New: "${targetSeoTitle}" (${targetSeoTitle.length} chars)\n`);
      updatedCount++;
    }
  }

  console.log(`🎉 Done! Updated ${updatedCount} SEO titles in the database.`);
}

main()
  .catch((err) => {
    console.error('❌ Error executing script:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
