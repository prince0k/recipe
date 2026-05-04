import { prisma } from "@/lib/db";
import { ContentCard } from "@/components/content/ContentCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Healthy Recipes | NutriGuide",
  description: "Browse our collection of healthy, science-backed recipes designed for optimal nutrition.",
};

export default async function RecipesPage() {
  const recipes = await prisma.content.findMany({
    where: {
      type: "RECIPE",
      published: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-border pb-10">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Our Collection
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Healthy Recipes
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Delicious, nutritionist-approved meals that are simple to make and packed with essential nutrients.
          </p>
        </div>

        {/* Content */}
        {recipes.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center rounded-lg border border-border bg-secondary/50 py-20">
            <p className="text-muted-foreground">No recipes found. Check back soon!</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <ContentCard
                key={recipe.id}
                type={recipe.type as "RECIPE"}
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
    </div>
  );
}
