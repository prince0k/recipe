import { prisma } from "@/lib/db";
import { ContentCard } from "@/components/content/ContentCard";
import { Metadata } from "next";
import { Pagination } from "@/components/ui/Pagination";
import { RecipeFilters, RecipeSort } from "@/components/content/RecipeFilters";
import { getCachedRecipes } from "@/lib/queries";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Explore Recipes | Stewart Lucas",
  description: "Browse our collection of cinematic, moody, and budget-friendly home-cooked recipes.",
};

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sParams = await searchParams;
  const category = typeof sParams.category === 'string' ? sParams.category : undefined;
  const time = typeof sParams.time === 'string' ? sParams.time : undefined;
  const dietary = typeof sParams.dietary === 'string' ? sParams.dietary.split(',') : (Array.isArray(sParams.dietary) ? sParams.dietary : undefined);
  const sort = typeof sParams.sort === 'string' ? sParams.sort : 'newest';
  const page = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1;
  const pageSize = 12;
  
  // Use updated cached query with dynamic key
  const { data: recipes, totalPages } = await getCachedRecipes(category, page, pageSize, time, dietary, sort);

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-surface py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block">Handpicked Collection</span>
          <h1 className="text-5xl md:text-6xl font-bold text-text mb-6">Our Recipes</h1>
          <p className="text-xl text-text-muted font-serif italic max-w-2xl mx-auto">
            From 15-minute quick fixes to slow-roasted weekend feasts. Every recipe is a cinematic experience.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Interactive Filters Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <Suspense fallback={<div className="animate-pulse h-96 bg-surface rounded-xl" />}>
              <RecipeFilters />
            </Suspense>
          </aside>

          {/* Recipe Grid */}
          <main className="flex-grow">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-border">
              <p className="text-text-muted font-serif italic">{recipes.length} recipes found</p>
              <Suspense fallback={<div className="w-32 h-8 bg-surface animate-pulse" />}>
                <RecipeSort />
              </Suspense>
            </div>

            {recipes.length === 0 ? (
              <div className="text-center py-32 bg-surface rounded-[3rem] border border-border cinematic-shadow">
                <svg className="w-20 h-20 text-border mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-text-muted text-xl font-serif italic">No recipes match your filters yet.</p>
                <a href="/recipes" className="mt-8 text-primary font-bold underline block">Reset all filters</a>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-10">
                  {recipes.map((recipe) => (
                    <ContentCard
                      key={recipe.id}
                      type={recipe.type as any}
                      title={recipe.title}
                      slug={recipe.slug}
                      excerpt={recipe.excerpt}
                      coverImage={recipe.coverImage}
                      tags={(() => {
                        try {
                          return typeof recipe.tags === 'string' ? JSON.parse(recipe.tags) : recipe.tags;
                        } catch (e) {
                          return [];
                        }
                      })()}
                      hrefPrefix="recipes"
                    />
                  ))}
                </div>

                <div className="mt-16">
                  <Pagination 
                    currentPage={page} 
                    totalPages={totalPages} 
                    baseUrl="/recipes"
                  />
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

