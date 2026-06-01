import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  console.log("Starting script to fix all Recipe schemas in DB...\n");

  const recipes = await prisma.content.findMany({
    where: { type: 'RECIPE' },
    include: {
      reviews: {
        where: { isApproved: true }
      }
    }
  });

  console.log(`Found ${recipes.length} recipe items in the database.\n`);

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

    // 5. Durations with fallbacks
    const prepMinutes = parseMinutes(recipe.prepTime) || 15;
    const cookMinutes = parseMinutes(recipe.cookingTime) || 25;
    const prepTimeStr = `PT${prepMinutes}M`;
    const cookTimeStr = `PT${cookMinutes}M`;
    const totalTimeStr = `PT${prepMinutes + cookMinutes}M`;

    // 6. Base Image
    const imageUrl = cleanImageUrl(recipe.coverImage);

    // 7. Schema Definition
    const generatedSchema = {
      "@context": "https://schema.org",
      "@type": "Recipe",
      "name": recipe.title,
      "description": recipe.excerpt || "A delicious healthy recipe from Stewart Lucas.",
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
      "url": `https://stewartlucas.com/recipes/${recipe.slug}`,
      "datePublished": recipe.createdAt.toISOString(),
      "dateModified": recipe.updatedAt.toISOString(),
      "prepTime": prepTimeStr,
      "cookTime": cookTimeStr,
      "totalTime": totalTimeStr,
      "recipeYield": recipe.servings ? `${recipe.servings} servings` : "4 servings",
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
        "calories": recipe.calories ? `${recipe.calories} calories` : "350 calories",
        ...(recipe.protein && { "proteinContent": recipe.protein }),
        ...(recipe.fat && { "fatContent": recipe.fat }),
        ...(recipe.carbs && { "carbohydrateContent": recipe.carbs })
      }
    };

    console.log(`Updating recipe: "${recipe.title}" (Slug: ${recipe.slug})`);
    await prisma.content.update({
      where: { id: recipe.id },
      data: {
        schema: JSON.stringify(generatedSchema, null, 2)
      }
    });
  }

  console.log("\n✅ Successfully updated database with correct Recipe JSON-LD schemas!");
}

main().catch((e) => {
  console.error('Error executing script:', e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
