import { prisma } from "@/lib/db";
import { ContentCard } from "@/components/content/ContentCard";
import { Metadata } from "next";
import { Pagination } from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "Explore Recipes | Stwart Lucas",
  description: "Browse our collection of cinematic, moody, and budget-friendly home-cooked recipes.",
};

import { getAllRecipes } from "@/lib/queries";

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sParams = await searchParams;
  const category = typeof sParams.category === 'string' ? sParams.category : undefined;
  const page = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1;
  const pageSize = 12;
  
  // Use cached query
  const { data: recipes, totalPages } = await getAllRecipes(category, page, pageSize);

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
          {/* Sticky Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-28 space-y-10">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-text mb-6 border-b border-border pb-2">Categories</h3>
                <div className="space-y-3">
                  {["Quick Recipes", "Healthy Eating", "Budget Friendly", "Breakfast", "Lunch", "Dinner"].map((cat) => (
                    <label key={cat} className="flex items-center group cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary mr-3" />
                      <span className="text-text-muted group-hover:text-primary transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-text mb-6 border-b border-border pb-2">Cooking Time</h3>
                <div className="space-y-3">
                  {["Under 15 mins", "15-30 mins", "30-60 mins", "1 hour+"].map((t) => (
                    <label key={t} className="flex items-center group cursor-pointer">
                      <input type="radio" name="time" className="w-4 h-4 border-border text-primary focus:ring-primary mr-3" />
                      <span className="text-text-muted group-hover:text-primary transition-colors">{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-text mb-6 border-b border-border pb-2">Dietary</h3>
                <div className="space-y-3">
                  {["Vegetarian", "Vegan", "Gluten Free", "Dairy Free"].map((diet) => (
                    <label key={diet} className="flex items-center group cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary mr-3" />
                      <span className="text-text-muted group-hover:text-primary transition-colors">{diet}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Recipe Grid */}
          <main className="flex-grow">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-border">
              <p className="text-text-muted font-serif italic">{recipes.length} recipes found</p>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-text-muted uppercase tracking-wider">Sort by:</span>
                <select className="bg-transparent border-none text-text font-bold focus:ring-0 cursor-pointer">
                  <option>Most Recent</option>
                  <option>Most Liked</option>
                  <option>Quickest</option>
                </select>
              </div>
            </div>

            {recipes.length === 0 ? (
              <div className="text-center py-32 bg-surface rounded-[3rem] border border-border cinematic-shadow">
                <svg className="w-20 h-20 text-border mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-text-muted text-xl font-serif italic">No recipes match your filters yet.</p>
                <button className="mt-8 text-primary font-bold underline">Reset all filters</button>
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

                <Pagination 
                  currentPage={page} 
                  totalPages={totalPages} 
                  baseUrl="/recipes"
                />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

