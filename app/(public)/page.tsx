import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { AdBanner } from "@/components/ui/AdBanner";

import { getFeaturedRecipes } from "@/lib/queries";
import { Testimonials } from "@/components/home/Testimonials";
import { EmailCaptureForm } from "@/components/ui/EmailCaptureForm";

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const featuredRecipes = await getFeaturedRecipes();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/hero.png"
            alt="Cinematic home-cooked meal"
            fill
            className="object-cover scale-105"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 vignette opacity-60" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/20 backdrop-blur-md text-primary text-xs font-bold tracking-widest uppercase mb-6 animate-pulse">
              Authentic Home Cooking
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.1]">
              Simple Recipes <br />
              <span className="text-accent">for Real Life.</span>
            </h1>
            <p className="text-xl text-white/80 mb-10 leading-relaxed font-serif italic max-w-lg">
              Explore a collection of quick, budget-friendly, and healthy meals designed to make your home cooking journey effortless and cinematic.
            </p>
            
            <div className="flex flex-col gap-6 max-w-md">
              <Link href="/diet-plan" className="w-full">
                <Button size="lg" className="w-full h-16 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xl hover:shadow-emerald-600/20 active:scale-98 text-base tracking-wide cursor-pointer">
                  Get Your Free Personalized Meal Plan
                </Button>
              </Link>
              
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Or search recipes, ingredients..." 
                  aria-label="Search recipes and ingredients"
                  className="w-full h-12 pl-5 pr-14 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all group-hover:bg-white/15 text-sm"
                  suppressHydrationWarning
                />
                <button 
                  type="button"
                  aria-label="Search recipes"
                  className="absolute right-2 top-2 bottom-2 px-3 rounded-lg bg-white/10 hover:bg-white/25 text-white text-xs font-semibold transition-all cursor-pointer"
                  suppressHydrationWarning
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personalisation Hero Banner */}
      <section className="py-20 px-4 border-t border-border/20 bg-surface/50">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold tracking-widest uppercase">
            ✨ AI-Powered — 100% Free
          </span>
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-text leading-tight">
            Your Personalised Meal Plan,<br />Built Around Your Life
          </h2>
          <p className="text-text-muted text-base max-w-xl mx-auto leading-relaxed">
            Tell us your goals, dietary needs, and schedule. Our AI builds a complete 
            plan just for you — in under 60 seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-olive/80">
            <span className="px-3 py-1.5 rounded-full bg-olive/5 border border-olive/10">✓ Keto & Gluten-Free Friendly</span>
            <span className="px-3 py-1.5 rounded-full bg-olive/5 border border-olive/10">✓ Budget-Conscious Options</span>
            <span className="px-3 py-1.5 rounded-full bg-olive/5 border border-olive/10">✓ Ready in 15–30 Mins</span>
            <span className="px-3 py-1.5 rounded-full bg-olive/5 border border-olive/10">✓ 100% Free</span>
          </div>
          <div className="pt-4">
            <Link href="/diet-plan">
              <Button size="lg" className="px-10 py-5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-bold transition-all shadow-xl cursor-pointer">
                Get My Free Personalised Plan →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">Browse by Category</h2>
              <p className="text-text-muted font-serif italic text-lg">Curated collections for every occasion and diet.</p>
            </div>
            <Link href="/recipes" className="mt-4 md:mt-0 text-primary font-bold hover:underline flex items-center">
              View All Recipes <span className="ml-2">→</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Quick Recipes", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000", count: "120+ Recipes", color: "bg-orange-500/20" },
              { title: "Healthy Eating", img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=1000", count: "85+ Recipes", color: "bg-olive/20" },
              { title: "Budget Friendly", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000", count: "60+ Recipes", color: "bg-yellow-500/20" },
              { title: "Dinner Ideas", img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1000", count: "95+ Recipes", color: "bg-red-500/20" },
            ].map((cat) => (
              <Link key={cat.title} href={`/recipes?category=${cat.title.toLowerCase().replace(' ', '-')}`} className="group">
                <div className="relative h-96 rounded-[2.5rem] overflow-hidden cinematic-shadow transition-all duration-500 group-hover:-translate-y-2">
                  <Image
                    src={cat.img}
                    alt={cat.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-8 left-8">
                    <span className="text-white/60 text-xs font-bold tracking-widest uppercase mb-2 block">{cat.count}</span>
                    <h3 className="text-2xl font-bold text-white leading-tight">{cat.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Email Capture Section */}
      <section className="py-16 bg-surface/30 px-4">
        <EmailCaptureForm
          source="homepage"
          heading="Get Your Free 7-Day Meal Plan"
          subheading="Join thousands getting science-backed recipes every week."
          freebie="7-day-meal-plan"
        />
      </section>

      <AdBanner placement="HOMEPAGE_BANNER" />

      {/* Featured Section */}
      <section className="py-24 bg-surface rounded-[4rem] mx-4 lg:mx-8 mb-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-olive/5 rounded-full blur-3xl -ml-48 -mb-48" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block">Handpicked for you</span>
            <h2 className="text-4xl md:text-5xl font-bold text-text">Featured Recipes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
            
            {featuredRecipes.length === 0 && (
              <div className="col-span-full text-center py-20 text-text-muted italic">
                Our culinary team is currently preparing new masterpieces. Check back soon!
              </div>
            )}
          </div>
          
          <div className="mt-16 text-center">
            <Link href="/recipes">
              <Button size="lg" className="px-10 py-5 rounded-2xl shadow-2xl">Explore More Recipes</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Personalized Meal Plan CTA Section */}
      <section className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-slate-900 via-neutral-900 to-emerald-950 p-12 md:p-20 text-white shadow-2xl border border-white/10">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase">
                AI-Powered Custom Nutrition
              </span>
              
              <h2 className="text-4xl md:text-5xl font-bold font-serif leading-tight">
                Tailored to your body. <br/>
                <span className="text-emerald-400 italic">Designed for your life.</span>
              </h2>
              
              <p className="text-lg text-white/80 leading-relaxed font-serif max-w-2xl mx-auto">
                Get a free, science-backed meal plan personalized by Stewart Lucas and powered by advanced AI. We customize everything around your dietary restrictions, goals, and struggles.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/diet-plan">
                  <Button size="lg" className="px-10 py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-xl shadow-emerald-500/20 active:scale-98 cursor-pointer">
                    Get Your Free Personalized Meal Plan
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg" className="px-10 py-5 rounded-2xl border-white/20 text-white hover:bg-white/10 font-bold transition-all cursor-pointer">
                    How It Works
                  </Button>
                </Link>
              </div>

              {/* Dynamic features indicators */}
              <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs text-white/60">
                <div className="space-y-1">
                  <span className="text-emerald-400 font-bold text-lg block">100%</span>
                  <span>Custom Tailored</span>
                </div>
                <div className="space-y-1">
                  <span className="text-emerald-400 font-bold text-lg block">7 Days</span>
                  <span>Structured Meal Grid</span>
                </div>
                <div className="space-y-1">
                  <span className="text-emerald-400 font-bold text-lg block">Free</span>
                  <span>No Credit Card Needed</span>
                </div>
                <div className="space-y-1">
                  <span className="text-emerald-400 font-bold text-lg block">AI + Expert</span>
                  <span>Science-Backed Logic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story / About CTA */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[600px] rounded-[3rem] overflow-hidden cinematic-shadow">
              <Image 
                src="/assets/hero.png" 
                alt="Stewart Lucas Kitchen" 
                fill 
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div>
              <span className="text-secondary font-bold tracking-widest uppercase text-xs mb-4 block">The Brand Story</span>
              <h2 className="text-4xl md:text-5xl font-bold text-text mb-8 leading-tight">
                Crafting Culinary Memories, <br /> 
                One Simple Meal at a Time.
              </h2>
              <p className="text-lg text-text-muted mb-6 leading-relaxed font-serif italic">
                "I believe that good food shouldn't be complicated or expensive. NutriGuide by Stewart Lucas is born from a passion for home cooking that celebrates real ingredients and cinematic moments around the table."
              </p>
              <p className="text-base text-text-muted mb-10 leading-relaxed">
                Whether you're a busy professional looking for a 15-minute dinner or a home cook wanting to impress with a weekend feast, our recipes are designed to fit your life and your budget.
              </p>
              <Link href="/about">
                <Button variant="outline" className="px-8 py-4 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-white">Learn Our Story</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: any }) {
  const tags = JSON.parse(recipe.tags || "[]");
  return (
    <div className="group bg-white rounded-[2.5rem] p-4 cinematic-shadow transition-all duration-500 hover:-translate-y-2">
      <div className="relative h-64 rounded-[2rem] overflow-hidden mb-6">
        <Image 
          src={recipe.coverImage || "https://images.unsplash.com/photo-1495195129352-aec325b55b65?auto=format&fit=crop&q=80&w=1000"} 
          alt={recipe.title} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-110" 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          {(() => {
            try {
              const tags = typeof recipe.tags === 'string' ? JSON.parse(recipe.tags) : recipe.tags;
              return (Array.isArray(tags) ? tags : []).slice(0, 2).map((tag: string) => (
                <span key={tag} className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-text">
                  {tag}
                </span>
              ));
            } catch (e) {
              return null;
            }
          })()}
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-olive text-xs font-bold flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {recipe.cookingTime || '45m'}
          </span>
          <span className="text-secondary text-xs font-bold flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            {recipe.difficulty || 'Medium'}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-text mb-2 group-hover:text-primary transition-colors leading-tight line-clamp-2">{recipe.title}</h3>
        {(() => {
          const approvedReviews = recipe.reviews || [];
          const reviewCount = approvedReviews.length;
          const avgRating = reviewCount > 0 
            ? approvedReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount 
            : 0;
          if (reviewCount === 0) return null;
          return (
            <div className="flex items-center gap-0.5 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={s <= Math.round(avgRating) ? 'text-amber-400' : 'text-gray-200'} style={{ fontSize: '13px' }}>
                  ★
                </span>
              ))}
              <span className="text-[10px] font-bold text-text-muted ml-1">({reviewCount})</span>
            </div>
          );
        })()}
        <Link href={`/recipes/${recipe.slug}`} className="text-sm font-bold text-primary flex items-center group-hover:translate-x-2 transition-transform">
          View Recipe <span className="ml-1">→</span>
        </Link>
      </div>
    </div>
  );
}
