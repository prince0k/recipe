import React from 'react';

interface RecipeSchemaProps {
  title: string;
  description?: string;
  image?: string;
  cookingTime?: string | number; // e.g. "45 mins" or 45
  servings?: number;
  ingredients?: string[];
  instructions?: string[];
  nutrition?: {
    calories?: string;
    protein?: string;
    fat?: string;
    carbs?: string;
  };
  datePublished?: string;
  authorName?: string;
}

export function RecipeSchema({
  title,
  description,
  image,
  cookingTime,
  servings,
  ingredients,
  instructions,
  nutrition,
  datePublished,
  authorName = 'Stewart Lucas',
}: RecipeSchemaProps) {
  // Extract number from cookingTime string if necessary
  const durationMinutes = (() => {
    if (typeof cookingTime === 'number') return cookingTime;
    if (typeof cookingTime === 'string') {
      const match = cookingTime.match(/\d+/);
      return match ? parseInt(match[0], 10) : undefined;
    }
    return undefined;
  })();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: title,
    description: description || 'A delicious healthy recipe from NutriGuide.',
    author: {
      '@type': 'Person',
      name: authorName,
      url: 'https://stewartlucas.com/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'NutriGuide by Stewart Lucas',
      url: 'https://stewartlucas.com',
    },
    ...(image && { image: [image] }),
    ...(durationMinutes && { 
      totalTime: `PT${durationMinutes}M`, 
      cookTime: `PT${durationMinutes}M` 
    }),
    ...(servings && { recipeYield: `${servings} servings` }),
    ...(datePublished && { datePublished }),
    ...(ingredients && ingredients.length > 0 && { recipeIngredient: ingredients }),
    ...(instructions && instructions.length > 0 && {
      recipeInstructions: instructions.map((step, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        text: step,
      })),
    }),
    ...(nutrition && (nutrition.calories || nutrition.protein || nutrition.fat || nutrition.carbs) && {
      nutrition: {
        '@type': 'NutritionInformation',
        ...(nutrition.calories && { calories: `${nutrition.calories} calories` }),
        ...(nutrition.protein && { proteinContent: nutrition.protein }),
        ...(nutrition.fat && { fatContent: nutrition.fat }),
        ...(nutrition.carbs && { carbohydrateContent: nutrition.carbs }),
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
