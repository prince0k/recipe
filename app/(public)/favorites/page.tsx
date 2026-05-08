import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ContentCard } from "@/components/content/ContentCard";

export default async function FavoritesPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/favorites");
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      content: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-text font-serif mb-4">Your Favorites</h1>
          <p className="text-text-muted text-lg">
            All the recipes, diet plans, and guides you've saved for later.
          </p>
        </header>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((fav) => (
              <ContentCard
                key={fav.id}
                type={fav.content.type as any}
                title={fav.content.title}
                slug={fav.content.slug}
                excerpt={fav.content.excerpt}
                coverImage={fav.content.coverImage}
                tags={JSON.parse(fav.content.tags || "[]")}
                hrefPrefix={
                  fav.content.type === "RECIPE" ? "recipes" : 
                  fav.content.type === "CHEAT_SHEET" ? "cheat-sheets" : 
                  fav.content.type.toLowerCase().replace("_", "-")
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-surface rounded-[3rem] border-2 border-dashed border-border">
            <div className="max-w-md mx-auto">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 mx-auto text-text-muted/30 mb-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-text mb-4">No favorites yet</h2>
              <p className="text-text-muted mb-8">
                Start exploring our recipes and guides to build your personal collection.
              </p>
              <a 
                href="/recipes" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors"
              >
                Browse Recipes
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
