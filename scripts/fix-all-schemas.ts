import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseMinutes(timeStr: string | null): number | undefined {
  if (!timeStr) return undefined;
  const match = timeStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : undefined;
}

function cleanImageUrl(url: string | null): string {
  if (!url) return 'https://stewartlucas.com/assets/og-image.jpg';
  if (url.startsWith('{') || url.startsWith('[')) {
    try {
      const parsed = JSON.parse(url);
      if (parsed.url) return cleanImageUrl(parsed.url);
      if (Array.isArray(parsed) && parsed[0]) return cleanImageUrl(parsed[0]);
    } catch {}
  }
  const cleaned = url.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, '');
  return cleaned.startsWith('http') ? cleaned : `https://stewartlucas.com${cleaned.startsWith('/') ? '' : '/'}${cleaned}`;
}

const AUTHOR_BLOCK = {
  "@type": "Person",
  "name": "Stewart Lucas",
  "url": "https://stewartlucas.com/about",
  "sameAs": []
};

const PUBLISHER_BLOCK = {
  "@type": "Organization",
  "name": "NutriGuide by Stewart Lucas",
  "url": "https://stewartlucas.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://stewartlucas.com/assets/og-image.jpg",
    "width": 1200,
    "height": 630
  }
};

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  console.log(`🚀 STARTING GLOBAL SCHEMA CLEANUP & REBUILD 🚀 ${dryRun ? '(DRY RUN)' : ''}`);
  console.log("===================================================\n");

  const items = await prisma.content.findMany({
    include: {
      reviews: {
        where: { isApproved: true }
      }
    }
  });

  console.log(`Found ${items.length} items to inspect.\n`);

  const supportedTypes = ['RECIPE', 'BLOG', 'DIET_PLAN', 'CHEAT_SHEET'];
  const counts: Record<string, { updated: number; skipped: number }> = {
    RECIPE: { updated: 0, skipped: 0 },
    BLOG: { updated: 0, skipped: 0 },
    DIET_PLAN: { updated: 0, skipped: 0 },
    CHEAT_SHEET: { updated: 0, skipped: 0 }
  };
  let totalSkippedUnsupported = 0;

  for (const item of items) {
    if (!supportedTypes.includes(item.type)) {
      totalSkippedUnsupported++;
      continue;
    }

    const typeKey = item.type as 'RECIPE' | 'BLOG' | 'DIET_PLAN' | 'CHEAT_SHEET';
    const imageUrl = cleanImageUrl(item.coverImage);

    let tags: string[] = [];
    try {
      tags = JSON.parse(item.tags || '[]');
    } catch {
      tags = [];
    }

    let currentSchemaObj: any = null;
    let isLegacyFlat = false;

    if (item.schema) {
      try {
        const raw = item.schema.trim();
        // Check and strip any HTML/script tags if present
        let cleanRaw = raw;
        if (raw.startsWith('<script') || raw.includes('</script>')) {
          const match = raw.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
          if (match && match[1]) {
            cleanRaw = match[1].trim();
          } else {
            cleanRaw = raw.replace(/<[^>]*>/g, '').trim();
          }
        }
        currentSchemaObj = JSON.parse(cleanRaw);
        if (currentSchemaObj && !currentSchemaObj["@graph"]) {
          isLegacyFlat = true;
        }
      } catch (e) {
        console.warn(`⚠️ Failed to parse existing schema for: "${item.title}". Will regenerate.`);
        isLegacyFlat = true; // Regenerate
      }
    } else {
      isLegacyFlat = true;
    }

    let finalSchema: any = null;

    if (false && !isLegacyFlat && currentSchemaObj) {
      // It's already in the @graph format
      finalSchema = currentSchemaObj;
      counts[typeKey].skipped++;
    } else {
      // Rebuild or migrate to @graph format
      if (item.type === 'RECIPE') {
        let ingredientsList: string[] = [];
        try {
          ingredientsList = JSON.parse(item.ingredients || '[]');
        } catch {
          ingredientsList = [];
        }

        const instructionsList: string[] = (() => {
          const bodyStr = item.body || '';
          const matches = bodyStr.match(/<li[^>]*>(.*?)<\/li>/g) || bodyStr.match(/<p[^>]*>(.*?)<\/p>/g);
          if (matches && matches.length > 0) {
            return matches.map(m => m.replace(/<[^>]*>?/gm, '').trim()).filter(Boolean);
          }
          return [item.excerpt || 'Follow instructions on page.'];
        })();

        const reviewCount = item.reviews.length;
        const avgRating = reviewCount > 0 
          ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
          : 0;

        const finalRating = reviewCount > 0 ? avgRating : (item.rating > 0 ? item.rating : 4.7);
        const finalReviewCount = reviewCount > 0 ? reviewCount : 12;

        const category = tags.find((t: string) => ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].includes(t.toLowerCase())) || 'Main Course';
        const cuisine = tags.find((t: string) => ['mediterranean', 'american', 'italian', 'mexican', 'asian', 'french', 'greek'].includes(t.toLowerCase())) || 'Healthy';

        const prepMinutes = parseMinutes(item.prepTime) || 15;
        const cookMinutes = parseMinutes(item.cookingTime) || 25;

        const baseRecipe = currentSchemaObj && currentSchemaObj["@type"] === "Recipe" ? currentSchemaObj : {};

        finalSchema = {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Recipe",
              "@id": `https://stewartlucas.com/recipes/${item.slug}#recipe`,
              "name": item.title,
              "description": item.excerpt || "A delicious healthy recipe from Stewart Lucas.",
              "url": `https://stewartlucas.com/recipes/${item.slug}`,
              "image": [imageUrl],
              "author": AUTHOR_BLOCK,
              "datePublished": item.createdAt.toISOString().split('T')[0],
              "dateModified": item.updatedAt.toISOString().split('T')[0],
              "prepTime": `PT${prepMinutes}M`,
              "cookTime": `PT${cookMinutes}M`,
              "totalTime": `PT${prepMinutes + cookMinutes}M`,
              "recipeYield": [
                item.servings ? item.servings.toString() : "4",
                item.servings ? `${item.servings} servings` : "4 servings"
              ],
              "recipeCategory": category.charAt(0).toUpperCase() + category.slice(1),
              "recipeCuisine": cuisine.charAt(0).toUpperCase() + cuisine.slice(1),
              "keywords": tags.filter((t: string) => t.toLowerCase() !== category.toLowerCase() && t.toLowerCase() !== cuisine.toLowerCase()).join(", "),
              "recipeIngredient": ingredientsList.length > 0 ? ingredientsList : ["1 recipe ingredients list"],
              "recipeInstructions": instructionsList.map((step, idx) => ({
                "@type": "HowToStep",
                "position": idx + 1,
                "name": step.slice(0, 30) + (step.length > 30 ? "..." : ""),
                "text": step,
                "url": `https://stewartlucas.com/recipes/${item.slug}#step${idx + 1}`,
                "image": imageUrl
              })),
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": finalRating.toFixed(1),
                "reviewCount": finalReviewCount.toString(),
                "bestRating": "5",
                "worstRating": "1"
              },
              "nutrition": {
                "@type": "NutritionInformation",
                "calories": item.calories ? `${item.calories} calories` : "350 calories",
                "servingSize": "1 serving",
                ...(item.protein && { "proteinContent": item.protein }),
                ...(item.fat && { "fatContent": item.fat }),
                ...(item.carbs && { "carbohydrateContent": item.carbs })
              },
              ...baseRecipe
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://stewartlucas.com" },
                { "@type": "ListItem", "position": 2, "name": "Recipes", "item": "https://stewartlucas.com/recipes" },
                { "@type": "ListItem", "position": 3, "name": item.title, "item": `https://stewartlucas.com/recipes/${item.slug}` }
              ]
            }
          ]
        };

        const recNode = finalSchema["@graph"][0];
        delete recNode["@context"];
        recNode["@type"] = "Recipe";
        recNode["@id"] = `https://stewartlucas.com/recipes/${item.slug}#recipe`;
        recNode["author"] = AUTHOR_BLOCK;
        if (recNode.publisher) {
          delete recNode.publisher;
        }

      } else {
        let prefix = 'blog';
        let sectionName = 'Blog';
        if (item.type === 'DIET_PLAN') {
          prefix = 'diet-plan';
          sectionName = 'Diet Plans';
        }
        if (item.type === 'CHEAT_SHEET') {
          prefix = 'cheat-sheets';
          sectionName = 'Cheat Sheets';
        }

        const baseArticle = currentSchemaObj && (currentSchemaObj["@type"] === "BlogPosting" || currentSchemaObj["@type"] === "Article") ? currentSchemaObj : {};

        finalSchema = {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              "@id": `https://stewartlucas.com/${prefix}/${item.slug}#article`,
              "headline": item.title,
              "description": item.excerpt || `A premium ${sectionName.toLowerCase().replace(/s$/, '')} from Stewart Lucas.`,
              "image": {
                "@type": "ImageObject",
                "url": imageUrl,
                "width": 1200,
                "height": 630
              },
              "author": AUTHOR_BLOCK,
              "publisher": PUBLISHER_BLOCK,
              "inLanguage": "en-GB",
              "url": `https://stewartlucas.com/${prefix}/${item.slug}`,
              "datePublished": item.createdAt.toISOString(),
              "dateModified": item.updatedAt.toISOString(),
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `https://stewartlucas.com/${prefix}/${item.slug}`
              },
              ...baseArticle
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://stewartlucas.com" },
                { "@type": "ListItem", "position": 2, "name": sectionName, "item": `https://stewartlucas.com/${prefix}` },
                { "@type": "ListItem", "position": 3, "name": item.title, "item": `https://stewartlucas.com/${prefix}/${item.slug}` }
              ]
            }
          ]
        };

        const artNode = finalSchema["@graph"][0];
        delete artNode["@context"];
        artNode["@type"] = "BlogPosting";
        artNode["@id"] = `https://stewartlucas.com/${prefix}/${item.slug}#article`;
        artNode["author"] = AUTHOR_BLOCK;
        artNode["publisher"] = PUBLISHER_BLOCK;
        artNode["inLanguage"] = "en-GB";
        if (artNode.publisher === undefined) {
          artNode["publisher"] = PUBLISHER_BLOCK;
        }
      }

      counts[typeKey].updated++;
    }

    if (finalSchema && !dryRun) {
      await prisma.content.update({
        where: { id: item.id },
        data: {
          schema: JSON.stringify(finalSchema, null, 2)
        }
      });
    }
  }

  console.log(`\n==============================================`);
  console.log(`Summary of execution (dry-run: ${dryRun}):`);
  console.log(`Skipped unsupported types: ${totalSkippedUnsupported}`);
  for (const type of supportedTypes) {
    console.log(`- ${type}: ${counts[type].updated} migrated/updated, ${counts[type].skipped} skipped (already @graph)`);
  }
  console.log(`\n✅ Schema rebuild finished!`);
}

main().catch(err => {
  console.error("Execution failed:", err);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
