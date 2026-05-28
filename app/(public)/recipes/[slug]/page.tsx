import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const content = await prisma.content.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, coverImage: true, tags: true, seoTitle: true, seoDesc: true }
  });

  if (!content) return { title: 'Recipe Not Found' };

  const parsedTags = (() => {
    try {
      return JSON.parse(content.tags || "[]");
    } catch {
      return [];
    }
  })();

  const title = content.seoTitle || `${content.title} | NutriGuide by Stewart Lucas`;
  const description = content.seoDesc || content.excerpt?.slice(0, 155) || 'Discover this delicious recipe from NutriGuide.';

  const cleanCover = (() => {
    if (!content.coverImage) return 'https://stewartlucas.com/assets/og-image.jpg';
    const path = content.coverImage.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, '');
    if (path.startsWith('http')) return path;
    return `https://stewartlucas.com${path.startsWith('/') ? '' : '/'}${path}`;
  })();

  return {
    metadataBase: new URL('https://stewartlucas.com'),
    title,
    description,
    keywords: parsedTags,
    alternates: {
      canonical: `/recipes/${slug}`,
    },
    openGraph: {
      title: content.title,
      description,
      images: [{ url: cleanCover }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description,
      images: [cleanCover],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RelatedContent } from "@/components/content/RelatedContent";
import { FavoriteButton } from "@/components/content/FavoriteButton";
import { ShareButton } from "@/components/content/ShareButton";
import { Reviews } from "@/components/content/Reviews";
import { auth } from "@/lib/auth";
import { AdBanner } from "@/components/ui/AdBanner";
import { ShareButtons } from "@/components/ui/ShareButtons";

export default async function RecipeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  const recipe = await prisma.content.findUnique({
    where: { slug },
    include: {
      reviews: {
        where: { isApproved: true },
        select: { rating: true }
      }
    }
  });

  if (!recipe || recipe.type !== "RECIPE") {
    return notFound();
  }

  // Check if favorited
  let isFavorited = false;
  if (session?.user?.id) {
    const fav = await prisma.favorite.findUnique({
      where: {
        userId_contentId: {
          userId: session.user.id,
          contentId: recipe.id,
        }
      }
    });
    isFavorited = !!fav;
  }

  const tags = JSON.parse(recipe.tags || "[]");

  const approvedReviews = recipe.reviews || [];
  const reviewCount = approvedReviews.length;
  const avgRating = reviewCount > 0 
    ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
    : 0;

  const relatedItems = await prisma.content.findMany({
    where: { 
      id: { not: recipe.id },
      published: true 
    },
    take: 3,
    orderBy: { createdAt: "desc" }
  });

  const ingredientsList = (() => {
    try {
      return JSON.parse(recipe.ingredients || "[]");
    } catch {
      return [];
    }
  })();

  const instructionsList = (() => {
    const bodyStr = recipe.body || "";
    const matches = bodyStr.match(/<li[^>]*>(.*?)<\/li>/g) || bodyStr.match(/<p[^>]*>(.*?)<\/p>/g);
    if (matches && matches.length > 0) {
      return matches.map(m => m.replace(/<[^>]*>?/gm, '').trim()).filter(Boolean);
    }
    return [recipe.excerpt || "Follow instructions on page."];
  })();

  // Construct JSON-LD schema dynamically
  const prepTimeMinutes = (() => {
    if (typeof recipe.prepTime === 'number') return recipe.prepTime;
    if (typeof recipe.prepTime === 'string') {
      const match = recipe.prepTime.match(/\d+/);
      return match ? parseInt(match[0], 10) : undefined;
    }
    return undefined;
  })();

  const durationMinutes = (() => {
    if (typeof recipe.cookingTime === 'number') return recipe.cookingTime;
    if (typeof recipe.cookingTime === 'string') {
      const match = recipe.cookingTime.match(/\d+/);
      return match ? parseInt(match[0], 10) : undefined;
    }
    return undefined;
  })();

  const cleanRecipeCover = recipe.coverImage
    ? recipe.coverImage.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, '')
    : '/assets/og-image.jpg';

  const baseImageUrl = cleanRecipeCover.startsWith('http')
    ? cleanRecipeCover
    : `https://stewartlucas.com${cleanRecipeCover}`;

  let schemaJson = null;
  if (recipe.schema) {
    try {
      schemaJson = JSON.parse(recipe.schema);
    } catch (e) {
      console.warn("Failed to parse recipe schema override:", e);
    }
  }

  if (!schemaJson) {
    schemaJson = {
      "@context": "https://schema.org",
      "@type": "Recipe",
      "name": recipe.title,
      "description": recipe.excerpt || "A delicious healthy recipe from Stewart Lucas.",
      "url": `https://stewartlucas.com/recipes/${recipe.slug}`,
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
      "image": [baseImageUrl],
      "datePublished": recipe.createdAt?.toISOString(),
      "dateModified": recipe.updatedAt?.toISOString(),
      "keywords": tags.join(", "),
      "recipeCategory": tags.find((t: string) => ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"].includes(t)) || "Main Course",
      "recipeCuisine": "Healthy",
      ...(prepTimeMinutes && { "prepTime": `PT${prepTimeMinutes}M` }),
      ...(durationMinutes && { "cookTime": `PT${durationMinutes}M` }),
      ...((prepTimeMinutes || durationMinutes) && {
        "totalTime": `PT${(prepTimeMinutes || 0) + (durationMinutes || 0)}M`
      }),
      ...(reviewCount > 0 && {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": avgRating.toFixed(1),
          "ratingCount": reviewCount,
          "bestRating": "5",
          "worstRating": "1"
        }
      }),
      ...(recipe.servings && { "recipeYield": `${recipe.servings} servings` }),
      ...(ingredientsList.length > 0 && { "recipeIngredient": ingredientsList }),
      ...(instructionsList.length > 0 && {
        "recipeInstructions": instructionsList.map((step: string, i: number) => ({
          "@type": "HowToStep",
          "position": i + 1,
          "text": step
        }))
      }),
      ...((recipe.calories || recipe.protein || recipe.fat || recipe.carbs) && {
        "nutrition": {
          "@type": "NutritionInformation",
          ...(recipe.calories && { "calories": `${recipe.calories} calories` }),
          ...(recipe.protein && { "proteinContent": recipe.protein }),
          ...(recipe.fat && { "fatContent": recipe.fat }),
          ...(recipe.carbs && { "carbohydrateContent": recipe.carbs })
        }
      })
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      <div className="bg-background min-h-screen">
      {/* Cinematic Hero Header */}
      <div className="relative h-[60vh] min-h-[400px] w-full bg-black" id="video-player">
        {recipe.coverVideo ? (
          <video
            src={recipe.coverVideo}
            poster={recipe.coverImage || undefined}
            controls
            preload="metadata"
            playsInline
            className="w-full h-full object-cover relative z-10"
          />
        ) : (
          <Image
            src={recipe.coverImage || "/assets/hero.webp"}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
        )}
        {!recipe.coverVideo && (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
        )}
        
        <div className="absolute bottom-0 left-0 w-full py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3 mb-6">
              {tags.map((tag: string) => (
                <Badge key={tag} className="bg-primary/80 backdrop-blur-md text-white border-none px-4 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight max-w-4xl">
              {recipe.title}
            </h1>
            <div className="flex flex-wrap items-center gap-8 text-white/90">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="font-bold tracking-wide">{recipe.cookingTime || '45 mins'}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012-2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <span className="font-bold tracking-wide">{recipe.difficulty || 'Medium'}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <span className="font-bold tracking-wide">{recipe.servings || '4'} Servings</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                {reviewCount > 0 ? (
                  <span className="font-bold tracking-wide">
                    {'★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating))}
                    {' '}{avgRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                ) : (
                  <span className="text-white/40 text-sm font-semibold">Be the first to review</span>
                )}
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10 max-w-xl">
              <ShareButtons
                url={`/recipes/${recipe.slug}`}
                title={recipe.title}
                image={recipe.coverImage || undefined}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-bold text-text mb-6 pb-2 border-b-2 border-primary/20 inline-block">The Story</h2>
              <p className="text-lg text-text-muted leading-relaxed font-serif italic">
                {recipe.excerpt}
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-text mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</span>
                Ingredients
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface p-8 rounded-[2rem] border border-border">
                {JSON.parse(recipe.ingredients || "[]").map((item: string) => (
                  <label key={item} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white transition-colors cursor-pointer group">
                    <input type="checkbox" className="mt-1 w-5 h-5 rounded-md border-border text-primary focus:ring-primary" />
                    <span className="text-text-muted group-hover:text-text transition-colors">{item}</span>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-text mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">2</span>
                Instructions
              </h2>
              <div className="space-y-10">
                <div 
                  className="prose prose-lg prose-olive max-w-none prose-headings:font-serif prose-headings:text-text"
                  dangerouslySetInnerHTML={{ __html: recipe.body }} 
                />
              </div>
            </section>

            <section className="bg-olive/5 p-10 rounded-[3rem] border border-olive/10">
              <h3 className="text-2xl font-bold text-olive mb-6">Nutrition Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <span className="block text-3xl font-bold text-olive">{recipe.calories || '—'}</span>
                  <span className="text-xs uppercase tracking-widest font-bold text-olive/60">Calories</span>
                </div>
                <div>
                  <span className="block text-3xl font-bold text-olive">{recipe.fat || '—'}</span>
                  <span className="text-xs uppercase tracking-widest font-bold text-olive/60">Fat</span>
                </div>
                <div>
                  <span className="block text-3xl font-bold text-olive">{recipe.carbs || '—'}</span>
                  <span className="text-xs uppercase tracking-widest font-bold text-olive/60">Carbs</span>
                </div>
                <div>
                  <span className="block text-3xl font-bold text-olive">{recipe.protein || '—'}</span>
                  <span className="text-xs uppercase tracking-widest font-bold text-olive/60">Protein</span>
                </div>
              </div>
            </section>

            {relatedItems.length > 0 && (
              <RelatedContent items={relatedItems} />
            )}
          </div>

          {/* Sidebar Actions */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] cinematic-shadow border border-border">
                <h3 className="text-xl font-bold text-text mb-6">Enjoying this recipe?</h3>
                <div className="space-y-4">
                  <FavoriteButton 
                    contentId={recipe.id} 
                    initialFavorited={isFavorited}
                    className="w-full py-4 shadow-lg"
                  />
                  <ShareButton 
                    title={recipe.title} 
                    text={recipe.excerpt}
                    className="w-full py-4 border-2 border-border text-text-muted hover:bg-surface"
                  />
                  {recipe.coverVideo && (
                    <a href="#video-player" className="block w-full">
                      <Button variant="ghost" className="w-full py-4 rounded-xl text-primary font-bold flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        Watch Video
                      </Button>
                    </a>
                  )}
                </div>
              </div>


              
              <AdBanner placement="RECIPES_SIDEBAR" />
            </div>
          </aside>
        </div>

        <div className="mt-24 max-w-4xl">
          <Reviews contentId={recipe.id} />
        </div>
      </div>
    </div>
    </>
  );
}
