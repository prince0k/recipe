import { prisma } from "@/lib/db";
import { Metadata } from "next";
import { Pagination } from "@/components/ui/Pagination";
import { getCachedRecipes } from "@/lib/queries";
import { Suspense } from "react";
import { RecipesHero } from "@/components/content/RecipesHero";
import { RecipesClient } from "@/components/content/RecipesClient";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const sParams = await searchParams;
  const page = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1;
  const category = typeof sParams.category === 'string' ? sParams.category : undefined;

  let title = "Healthy Recipes & Meal Ideas";
  let description = "Browse our collection of healthy, delicious, and budget-friendly home-cooked recipes.";
  
  if (category) {
    const catName = category.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    title = `${catName} Recipes`;
    description = `Explore our collection of handpicked ${catName} recipes, curated for wellness and flavor.`;
  }
  
  if (page > 1) {
    title += ` - Page ${page}`;
    description += ` (Page ${page} of collection)`;
  }

  const formattedTitle = title.length + 13 <= 60 ? `${title} | NutriGuide` : title;
  const url = `https://stewartlucas.com/recipes${page > 1 ? `?page=${page}` : ""}`;

  return {
    metadataBase: new URL('https://stewartlucas.com'),
    title,
    description,
    alternates: {
      canonical: `https://stewartlucas.com/recipes${category ? `?category=${category}` : ""}${page > 1 ? `${category ? '&' : '?'}page=${page}` : ""}`,
    },
    openGraph: {
      title: formattedTitle,
      description,
      type: "website",
      url,
      images: [
        {
          url: "https://stewartlucas.com/assets/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Stewart Lucas Recipes",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: formattedTitle,
      description,
      images: ["https://stewartlucas.com/assets/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

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
  
  // Fetch matching recipes from server cache
  const { data: recipes, totalPages } = await getCachedRecipes(category, page, pageSize, time, dietary, sort);

  return (
    <div className="bg-[#fafaf8] min-h-screen">
      {/* Hero Section Banner */}
      <RecipesHero />

      {/* Main Content Area Container */}
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-12 md:py-16">
        <Suspense fallback={<div className="animate-pulse h-96 bg-[#f5f3e9] rounded-2xl" />}>
          <RecipesClient 
            recipes={recipes} 
            totalPages={totalPages} 
            currentPage={page} 
          />
        </Suspense>

        {/* Pagination Controls */}
        {recipes.length > 0 && (
          <div className="mt-16 flex justify-center border-t border-[#e8e4dc]/60 pt-8 print-hide">
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              baseUrl="/recipes"
            />
          </div>
        )}
      </div>
    </div>
  );
}
