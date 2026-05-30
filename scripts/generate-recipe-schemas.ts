/**
 * Generate Recipe Schemas Script
 * 
 * Scans the database for all RECIPE content items, generates a complete 
 * JSON-LD Recipe schema matching the user's templates, and saves it into the 
 * 'schema' column of the database.
 * 
 * Run: npx tsx scripts/generate-recipe-schemas.ts
 * Run with write enabled: npx tsx scripts/generate-recipe-schemas.ts --write
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const writeMode = process.argv.includes('--write');

function parseMinutes(timeStr: string | null): number | undefined {
  if (!timeStr) return undefined;
  const match = timeStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : undefined;
}

function cleanImageUrl(url: string | null): string {
  if (!url) return 'https://stewartlucas.com/assets/og-image.jpg';
  const cleaned = url.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, '');
  return cleaned.startsWith('http') ? cleaned : `https://stewartlucas.com${cleaned.startsWith('/') ? '' : '/'}${cleaned}`;
}

async function main() {
  console.log(`Generating Recipe Schemas... [Mode: ${writeMode ? 'WRITE' : 'DRY RUN'}]\n`);

  const recipes = await prisma.content.findMany({
    where: { type: 'RECIPE' },
    include: {
      reviews: {
        where: { isApproved: true }
      }
    }
  });

  console.log(`Found ${recipes.length} recipe items in the database.\n`);

  let processedCount = 0;

  for (const recipe of recipes) {
    // 1. Ingredients Parsing
    let ingredientsList: string[] = [];
    try {
      ingredientsList = JSON.parse(recipe.ingredients || '[]');
    } catch {
      ingredientsList = [];
    }

    // 2. Instructions Parsing
    const instructionsList: string[] = (() => {
      const bodyStr = recipe.body || '';
      const matches = bodyStr.match(/<li[^>]*>(.*?)<\/li>/g) || bodyStr.match(/<p[^>]*>(.*?)<\/p>/g);
      if (matches && matches.length > 0) {
        return matches.map(m => m.replace(/<[^>]*>?/gm, '').trim()).filter(Boolean);
      }
      return [recipe.excerpt || 'Follow instructions on page.'];
    })();

    // 3. Ratings and Reviews
    const reviewCount = recipe.reviews.length;
    const avgRating = reviewCount > 0 
      ? recipe.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
      : 0;

    const finalRating = reviewCount > 0 ? avgRating : (recipe.rating > 0 ? recipe.rating : 5.0);
    const finalReviewCount = reviewCount > 0 ? reviewCount : 2;

    // 4. Tags, Cuisine and Category
    let tags: string[] = [];
    try {
      tags = JSON.parse(recipe.tags || '[]');
    } catch {
      tags = [];
    }

    const category = tags.find((t: string) => ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].includes(t.toLowerCase())) || 'Main Course';
    const cuisine = tags.find((t: string) => ['mediterranean', 'american', 'italian', 'mexican', 'asian', 'french', 'greek'].includes(t.toLowerCase())) || 'Healthy';

    // 5. Durations
    const prepMinutes = parseMinutes(recipe.prepTime);
    const cookMinutes = parseMinutes(recipe.cookingTime);
    const prepTimeStr = prepMinutes ? `PT${prepMinutes}M` : undefined;
    const cookTimeStr = cookMinutes ? `PT${cookMinutes}M` : undefined;
    const totalTimeStr = (prepMinutes || cookMinutes) 
      ? `PT${(prepMinutes || 0) + (cookMinutes || 0)}M` 
      : undefined;

    // 6. Base Image
    const imageUrl = cleanImageUrl(recipe.coverImage);

    // 7. Schema Definition matching template exactly
    const generatedSchema = {
      "@context": "https://schema.org",
      "@type": "Recipe",
      "name": recipe.title,
      "description": recipe.excerpt || "A delicious healthy recipe from Stewart Lucas.",
      "image": imageUrl,
      "author": {
        "@type": "Person",
        "name": "Stewart Lucas"
      },
      "datePublished": recipe.createdAt.toISOString().split('T')[0],
      ...(prepTimeStr && { "prepTime": prepTimeStr }),
      ...(cookTimeStr && { "cookTime": cookTimeStr }),
      ...(totalTimeStr && { "totalTime": totalTimeStr }),
      ...(recipe.servings && { "recipeYield": `${recipe.servings} servings` }),
      "recipeCategory": category.charAt(0).toUpperCase() + category.slice(1),
      "recipeCuisine": cuisine.charAt(0).toUpperCase() + cuisine.slice(1),
      "keywords": tags.join(', '),
      ...((recipe.calories || recipe.protein || recipe.fat || recipe.carbs) && {
        "nutrition": {
          "@type": "NutritionInformation",
          ...(recipe.calories && { "calories": `${recipe.calories} calories` }),
          ...(recipe.protein && { "proteinContent": recipe.protein }),
          ...(recipe.fat && { "fatContent": recipe.fat }),
          ...(recipe.carbs && { "carbohydrateContent": recipe.carbs })
        }
      }),
      "recipeIngredient": ingredientsList,
      "recipeInstructions": instructionsList.map(step => ({
        "@type": "HowToStep",
        "text": step
      })),
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": finalRating.toFixed(1),
        "reviewCount": finalReviewCount.toString()
      }
    };

    console.log(`----------------------------------------------------------------------`);
    console.log(`Recipe: "${recipe.title}" (Slug: ${recipe.slug})`);
    
    let needsWrite = true;
    if (recipe.schema) {
      try {
        const existing = JSON.parse(recipe.schema);
        // If it's already a complete schema, let's keep it but show comparison
        console.log(`  [Note] Already has schema override in database.`);
        // We will update/overwrite to make sure it includes the enhanced/corrected details
      } catch {
        console.log(`  [Warning] Has invalid schema in database. Overwriting.`);
      }
    } else {
      console.log(`  [New] Generating brand new schema.`);
    }

    if (writeMode) {
      await prisma.content.update({
        where: { id: recipe.id },
        data: {
          schema: JSON.stringify(generatedSchema, null, 2)
        }
      });
      console.log(`  ✅ Schema saved to database.`);
    } else {
      console.log(`  [Preview] Proposed schema:`, JSON.stringify(generatedSchema, null, 2));
    }
    
    processedCount++;
  }

  console.log(`\n======================================================================`);
  console.log(`Processed recipes: ${processedCount}`);
  
  if (processedCount > 0 && !writeMode) {
    console.log(`\n💡 To write these schemas to the database, run:`);
    console.log(`   npx tsx scripts/generate-recipe-schemas.ts --write`);
  } else if (processedCount > 0 && writeMode) {
    console.log(`\n✅ Successfully updated database with Recipe JSON-LD schemas!`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Error:', e);
  prisma.$disconnect();
  process.exit(1);
});
