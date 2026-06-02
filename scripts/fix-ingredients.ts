import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function extractIngredients(bodyHtml: string): string[] {
  // Try matching Ingredients header followed by <ul> list
  const ingredientsHeaderMatch = bodyHtml.match(/Ingredients\s*:?\s*<\/h[23]>\s*<ul[^>]*>([\s\S]*?)<\/ul>/i);
  if (ingredientsHeaderMatch && ingredientsHeaderMatch[1]) {
    const ulContent = ingredientsHeaderMatch[1];
    const liMatches = ulContent.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    if (liMatches) {
      return liMatches.map(li => li.replace(/<[^>]*>?/gm, '').trim()).filter(Boolean);
    }
  }

  // Fallback to the first <ul> list in the body
  const firstUlMatch = bodyHtml.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i);
  if (firstUlMatch && firstUlMatch[1]) {
    const liMatches = firstUlMatch[1].match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    if (liMatches) {
      return liMatches.map(li => li.replace(/<[^>]*>?/gm, '').trim()).filter(Boolean);
    }
  }

  return [];
}

async function main() {
  const recipes = await prisma.content.findMany({
    where: { type: 'RECIPE' }
  });

  console.log(`Found ${recipes.length} recipes to inspect.`);

  let updatedCount = 0;

  for (const recipe of recipes) {
    const currentIngredients = (() => {
      try {
        return JSON.parse(recipe.ingredients || '[]');
      } catch {
        return [];
      }
    })();

    // Only update if currently empty
    if (currentIngredients.length === 0) {
      const extracted = extractIngredients(recipe.body);
      if (extracted.length > 0) {
        console.log(`Updating recipe "${recipe.title}" with ${extracted.length} ingredients.`);
        await prisma.content.update({
          where: { id: recipe.id },
          data: { ingredients: JSON.stringify(extracted) }
        });
        updatedCount++;
      } else {
        console.log(`Could not extract ingredients for recipe "${recipe.title}".`);
      }
    } else {
      console.log(`Recipe "${recipe.title}" already has ${currentIngredients.length} ingredients.`);
    }
  }

  console.log(`Done! Updated ${updatedCount} recipes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
