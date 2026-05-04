import { prisma } from "@/lib/db";
import { ContentCard } from "@/components/content/ContentCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Healthy Recipes | NutriGuide",
  description: "Browse our collection of healthy, science-backed recipes.",
};

export default async function RecipesPage() {
  const recipes = await prisma.content.findMany({
    where: { 
      type: "RECIPE",
      published: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-gray-200 pb-8 mb-8">
        <h1 className="text-4xl font-extrabold font-serif text-gray-900">Healthy Recipes</h1>
        <p className="mt-4 text-xl text-gray-500">
          Delicious, nutritionist-approved meals that are easy to make.
        </p>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg">No recipes found. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe) => (
            <ContentCard
              key={recipe.id}
              type={recipe.type as any}
              title={recipe.title}
              slug={recipe.slug}
              excerpt={recipe.excerpt}
              coverImage={recipe.coverImage}
              tags={JSON.parse(recipe.tags)}
              hrefPrefix="recipes"
            />
          ))}
        </div>
      )}
    </div>
  );
}
