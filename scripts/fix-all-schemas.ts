import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseMinutes(timeStr: string | null): number | undefined {
  if (!timeStr) return undefined;
  const match = timeStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : undefined;
}

function cleanImageUrl(url: string | null): string {
  if (!url) return 'https://stewartlucas.com/assets/og-image.jpg';
  // If it's a JSON stringified object, extract the URL if possible
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

async function main() {
  console.log("🚀 STARTING GLOBAL SCHEMA CLEANUP & REBUILD 🚀");
  console.log("==============================================\n");

  const items = await prisma.content.findMany({
    include: {
      reviews: {
        where: { isApproved: true }
      }
    }
  });

  console.log(`Found ${items.length} items to inspect and clean.\n`);

  let updatedCount = 0;

  for (const item of items) {
    // Determine the base image
    const imageUrl = cleanImageUrl(item.coverImage);

    // Parse tags
    let tags: string[] = [];
    try {
      tags = JSON.parse(item.tags || '[]');
    } catch {
      tags = [];
    }

    let cleanSchema: any = null;

    if (item.type === 'RECIPE') {
      // 1. Ingredients Parsing
      let ingredientsList: string[] = [];
      try {
        ingredientsList = JSON.parse(item.ingredients || '[]');
      } catch {
        ingredientsList = [];
      }

      // 2. Instructions Parsing
      const instructionsList: string[] = (() => {
        const bodyStr = item.body || '';
        const matches = bodyStr.match(/<li[^>]*>(.*?)<\/li>/g) || bodyStr.match(/<p[^>]*>(.*?)<\/p>/g);
        if (matches && matches.length > 0) {
          return matches.map(m => m.replace(/<[^>]*>?/gm, '').trim()).filter(Boolean);
        }
        return [item.excerpt || 'Follow instructions on page.'];
      })();

      // 3. Ratings and Reviews
      const reviewCount = item.reviews.length;
      const avgRating = reviewCount > 0 
        ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
        : 0;

      const finalRating = reviewCount > 0 ? avgRating : (item.rating > 0 ? item.rating : 5.0);
      const finalReviewCount = reviewCount > 0 ? reviewCount : 2;

      const category = tags.find((t: string) => ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].includes(t.toLowerCase())) || 'Main Course';
      const cuisine = tags.find((t: string) => ['mediterranean', 'american', 'italian', 'mexican', 'asian', 'french', 'greek'].includes(t.toLowerCase())) || 'Healthy';

      const prepMinutes = parseMinutes(item.prepTime) || 15;
      const cookMinutes = parseMinutes(item.cookingTime) || 25;

      cleanSchema = {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "name": item.title,
        "description": item.excerpt || "A delicious healthy recipe from Stewart Lucas.",
        "image": [imageUrl],
        "author": {
          "@type": "Person",
          "name": "Stewart Lucas",
          "url": "https://stewartlucas.com/about"
        },
        "publisher": {
          "@type": "Organization",
          "name": "NutriGuide by Stewart Lucas",
          "url": "https://stewartlucas.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://stewartlucas.com/assets/og-image.jpg"
          }
        },
        "url": `https://stewartlucas.com/recipes/${item.slug}`,
        "datePublished": item.createdAt.toISOString(),
        "dateModified": item.updatedAt.toISOString(),
        "prepTime": `PT${prepMinutes}M`,
        "cookTime": `PT${cookMinutes}M`,
        "totalTime": `PT${prepMinutes + cookMinutes}M`,
        "recipeYield": item.servings ? `${item.servings} servings` : "4 servings",
        "recipeCategory": category.charAt(0).toUpperCase() + category.slice(1),
        "recipeCuisine": cuisine.charAt(0).toUpperCase() + cuisine.slice(1),
        "keywords": tags.join(', '),
        "recipeIngredient": ingredientsList.length > 0 ? ingredientsList : ["1 recipe ingredients list"],
        "recipeInstructions": instructionsList.map((step, idx) => ({
          "@type": "HowToStep",
          "position": idx + 1,
          "text": step
        })),
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": finalRating.toFixed(1),
          "reviewCount": finalReviewCount,
          "bestRating": "5",
          "worstRating": "1"
        },
        "nutrition": {
          "@type": "NutritionInformation",
          "calories": item.calories ? `${item.calories} calories` : "350 calories",
          ...(item.protein && { "proteinContent": item.protein }),
          ...(item.fat && { "fatContent": item.fat }),
          ...(item.carbs && { "carbohydrateContent": item.carbs })
        }
      };
    } else {
      // BLOG, DIET_PLAN, CHEAT_SHEET
      let prefix = 'blog';
      if (item.type === 'DIET_PLAN') prefix = 'diet-plan';
      if (item.type === 'CHEAT_SHEET') prefix = 'cheat-sheets';

      cleanSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": item.title,
        "description": item.excerpt || `A premium ${item.type.toLowerCase().replace('_', ' ')} from Stewart Lucas.`,
        "image": [imageUrl],
        "author": {
          "@type": "Person",
          "name": "Stewart Lucas",
          "url": "https://stewartlucas.com/about"
        },
        "publisher": {
          "@type": "Organization",
          "name": "NutriGuide by Stewart Lucas",
          "url": "https://stewartlucas.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://stewartlucas.com/assets/og-image.jpg"
          }
        },
        "url": `https://stewartlucas.com/${prefix}/${item.slug}`,
        "datePublished": item.createdAt.toISOString(),
        "dateModified": item.updatedAt.toISOString(),
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://stewartlucas.com/${prefix}/${item.slug}`
        }
      };
    }

    // Clean html strings if present in the schema column
    let needUpdate = true;
    if (item.schema) {
      try {
        const raw = item.schema.trim();
        // If it starts with script tags, it is a corrupt HTML-wrapped DB entry
        if (raw.startsWith('<script') || raw.includes('</script>')) {
          console.log(`🧹 Found HTML tags in schema column for: "${item.title}". Cleaning...`);
        }
      } catch {}
    }

    if (cleanSchema) {
      await prisma.content.update({
        where: { id: item.id },
        data: {
          schema: JSON.stringify(cleanSchema, null, 2)
        }
      });
      updatedCount++;
    }
  }

  console.log(`\n==============================================`);
  console.log(`✅ Success! Rebuilt and cleaned schemas for ${updatedCount} items.`);
}

main().catch(err => {
  console.error("Execution failed:", err);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
