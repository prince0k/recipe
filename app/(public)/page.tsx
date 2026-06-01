import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { AdBanner } from "@/components/ui/AdBanner";
import type { Metadata } from "next";

import { getFeaturedRecipes } from "@/lib/queries";
import { Testimonials } from "@/components/home/Testimonials";
import { EmailCaptureForm } from "@/components/ui/EmailCaptureForm";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ContentCard } from "@/components/content/ContentCard";

export const metadata: Metadata = {
  title: "NutriGuide | Free Diet Plans & Healthy Recipes",
  description: "Free science-backed diet plans, healthy recipes, and meal prep guides from NutriGuide by Stewart Lucas.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NutriGuide | Free Diet Plans & Healthy Recipes",
    description: "Free science-backed diet plans, healthy recipes, and meal prep guides from NutriGuide by Stewart Lucas.",
    url: "https://stewartlucas.com/",
    images: [
      {
        url: "https://stewartlucas.com/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NutriGuide by Stewart Lucas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NutriGuide by Stewart Lucas",
    description: "Free science-backed diet plans and healthy recipes.",
    images: ["https://stewartlucas.com/assets/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

// Organization + WebSite JSON-LD for Google Knowledge Panel
const homepageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://stewartlucas.com/#website",
      "name": "NutriGuide by Stewart Lucas",
      "url": "https://stewartlucas.com",
      "inLanguage": "en-GB",
      "potentialAction": {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": "https://stewartlucas.com/recipes?q={search_term_string}" },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://stewartlucas.com/#organization",
      "name": "NutriGuide by Stewart Lucas",
      "url": "https://stewartlucas.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://stewartlucas.com/assets/og-image.jpg",
        "width": 1200,
        "height": 630
      },
      "sameAs": [],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "url": "https://stewartlucas.com/contact"
      },
      "founder": {
        "@type": "Person",
        "name": "Stewart Lucas",
        "url": "https://stewartlucas.com/about"
      }
    }
  ]
};

export default async function Home() {
  const session = await auth();
  const featuredRecipes = await getFeaturedRecipes();
  
  let userProfile = null;
  let personalizedPlans: any[] = [];
  let recommendedRecipes: any[] = [];
  let leadDataObj: any = {};

  if (session?.user?.id) {
    userProfile = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        personalizedRequests: {
          include: {
            content: true
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 3
        }
      }
    });

    if (userProfile) {
      personalizedPlans = userProfile.personalizedRequests;
      try {
        leadDataObj = JSON.parse(userProfile.leadData || "{}");
      } catch (e) {
        leadDataObj = {};
      }

      // Fetch recommended recipes matching diet preference or goals
      const dietPreference = leadDataObj.diet;
      const healthGoal = leadDataObj.goal;

      const rawRecipes = await prisma.content.findMany({
        where: {
          type: "RECIPE",
          published: true,
        },
        include: {
          reviews: {
            where: { isApproved: true }
          }
        },
        take: 6
      });

      recommendedRecipes = rawRecipes.filter(recipe => {
        try {
          const tags = JSON.parse(recipe.tags || "[]");
          const matchDiet = dietPreference && tags.some((t: string) => t.toLowerCase() === dietPreference.toLowerCase());
          const matchGoal = healthGoal && tags.some((t: string) => t.toLowerCase() === healthGoal.toLowerCase());
          return matchDiet || matchGoal;
        } catch {
          return false;
        }
      });

      if (recommendedRecipes.length < 3) {
        const fillers = rawRecipes.filter(r => !recommendedRecipes.some(rec => rec.id === r.id));
        recommendedRecipes = [...recommendedRecipes, ...fillers].slice(0, 3);
      }
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
      />
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/hero.webp"
            alt="Beautiful home-cooked meal"
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
              {session ? (
                <>
                  Welcome back, <br />
                  <span className="text-accent">{session.user?.name?.split(' ')[0] || "Friend"}.</span>
                </>
              ) : (
                <>
                  Simple Recipes <br />
                  <span className="text-accent">for Real Life.</span>
                </>
              )}
            </h1>
            <p className="text-xl text-white/80 mb-10 leading-relaxed font-serif italic max-w-lg">
              {session ? (
                leadDataObj.goal ? (
                  `Let's keep making progress toward your ${leadDataObj.goal.replace('-', ' ')} goals. Addressing your challenge with ${leadDataObj.struggle || "daily nutrition"} is our mission today.`
                ) : (
                  "Welcome to your personalized workspace. Let's build a customized diet plan tailored to your lifestyle."
                )
              ) : (
                "Explore a collection of quick, budget-friendly, and healthy meals designed to make your home cooking journey effortless and inspiring."
              )}
            </p>
            
            <div className="mt-6">
              <Link
                href="/personalized"
                className="inline-block rounded-xl bg-emerald-600 px-8 py-4 text-base font-bold text-white transition hover:bg-emerald-700 text-center cursor-pointer shadow-xl active:scale-98 border-none"
              >
                Get Your Free AI Meal Plan in 60 Seconds &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Personalisation Banner / Dashboard */}
      {session ? (
        <section className="border-t border-white/10 py-16 px-4 bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <div className="mx-auto max-w-7xl">
            <div className="border-b border-white/10 pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between">
              <div>
                <span className="text-emerald-400 font-bold tracking-widest uppercase text-xs mb-2 block">Your Workspace</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white font-serif">Personalized Dashboard</h2>
              </div>
              <p className="text-sm text-white/50 mt-2 md:mt-0 font-serif italic">
                Science-backed nutrition configured for you.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Summary Card */}
              <div className="rounded-[2rem] bg-white/5 border border-white/10 p-8 backdrop-blur-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="mr-2">👤</span> Your Profile Config
                  </h3>
                  {leadDataObj.goal ? (
                    <ul className="space-y-4 text-sm text-white/80">
                      <li className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/40">Goal:</span>
                        <span className="font-semibold text-accent capitalize">{leadDataObj.goal.replace('-', ' ')}</span>
                      </li>
                      <li className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/40">Struggle:</span>
                        <span className="font-semibold text-white/90 line-clamp-1 max-w-[180px]" title={leadDataObj.struggle}>{leadDataObj.struggle}</span>
                      </li>
                      <li className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/40">Dietary Style:</span>
                        <span className="font-semibold text-white/90 capitalize">{leadDataObj.diet || "Standard"}</span>
                      </li>
                      <li className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/40">Prep Time:</span>
                        <span className="font-semibold text-white/90">{leadDataObj.time || "Flexible"}</span>
                      </li>
                    </ul>
                  ) : (
                    <p className="text-sm text-white/60 leading-relaxed mb-6">
                      You haven't set up your nutrition profile yet. Complete the quick assessment to receive custom suggestions.
                    </p>
                  )}
                </div>
                <div className="mt-8">
                  <Link
                    href="/diet-plan"
                    className="inline-block w-full text-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-3 text-xs font-bold text-white transition cursor-pointer"
                  >
                    {leadDataObj.goal ? "Update Profile Quiz" : "Start Profile Quiz"}
                  </Link>
                </div>
              </div>

              {/* Personalized Meal Plan Card */}
              <div className="rounded-[2rem] bg-white/5 border border-white/10 p-8 backdrop-blur-sm flex flex-col justify-between lg:col-span-2">
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="mr-2">📋</span> Your Custom Meal Plans
                  </h3>
                  {personalizedPlans.length > 0 ? (
                    <div className="space-y-4">
                      {personalizedPlans.map((req) => (
                        <div key={req.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-white text-base line-clamp-1">{req.content.title}</h4>
                            <p className="text-xs text-white/50 mt-1">Generated {new Date(req.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Link
                            href={`/personalized/${req.id}`}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
                          >
                            Open Plan
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-white/60 leading-relaxed mb-6">
                        Generate a custom meal plan optimized specifically for your body and dietary preferences.
                      </p>
                      <Link
                        href="/diet-plan"
                        className="inline-block rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition cursor-pointer"
                      >
                        Generate My First Plan
                      </Link>
                    </div>
                  )}
                </div>
                <div className="mt-6 border-t border-white/5 pt-4 text-xs text-white/40 flex items-center justify-between">
                  <span>Limit 1 personalized plan request per day</span>
                  <span>Active Plans: {personalizedPlans.length}</span>
                </div>
              </div>
            </div>

            {/* Recommended Recipes Section inside Dashboard */}
            {recommendedRecipes.length > 0 && (
              <div className="mt-16">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white font-serif flex items-center">
                    <span className="mr-2">🍲</span> Recommended for Your Diet
                  </h3>
                  <Link href="/recipes" className="text-xs font-bold text-emerald-400 hover:underline">
                    View All Recipes →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {recommendedRecipes.map((recipe) => (
                    <div key={recipe.id} className="group bg-white/5 rounded-[2rem] p-4 border border-white/5 hover:border-white/10 transition-all duration-300">
                      <div className="relative h-48 rounded-[1.5rem] overflow-hidden mb-4">
                        <Image 
                          src={recipe.coverImage || "https://images.unsplash.com/photo-1495195129352-aec325b55b65?auto=format&fit=crop&q=80&w=1000"} 
                          alt={recipe.title} 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        {leadDataObj.diet && (
                          <div className="absolute top-3 left-3">
                            <span className="bg-emerald-600/90 text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                              Fits {leadDataObj.diet}
                            </span>
                          </div>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-white line-clamp-1 group-hover:text-accent transition-colors">{recipe.title}</h4>
                      <p className="text-xs text-white/50 mt-1 line-clamp-2">{recipe.excerpt}</p>
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs text-white/60 font-semibold">{recipe.cookingTime || "45m"}</span>
                        <Link href={`/recipes/${recipe.slug}`} className="text-xs font-bold text-emerald-400 hover:underline">
                          View Recipe →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        /* Guest User: Call to Action Banner */
        <section className="border-t border-white/10 py-16 px-4 bg-slate-950 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Free · AI-Powered
            </span>
            <h2 className="mb-4 text-3xl font-semibold md:text-4xl text-white">
              Your Personalised Meal Plan,<br />Built Around Your Life
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-base text-white/60">
              Tell us your goals, dietary needs, and schedule. Our AI builds a complete
              plan just for you — in under 60 seconds.
            </p>
            <div className="mb-8 flex flex-wrap justify-center gap-6 text-sm text-white/50 font-medium">
              <span>✓ Keto &amp; Gluten-Free friendly</span>
              <span>✓ Budget-conscious options</span>
              <span>✓ 15–30 minute meals</span>
              <span>✓ 100% free</span>
            </div>
            <Link
              href="/personalized"
              className="inline-block rounded-2xl bg-white px-8 py-4 text-sm font-semibold text-black transition hover:bg-white/90 shadow-xl cursor-pointer active:scale-98"
            >
              Get My Free Personalised Plan →
            </Link>
          </div>
        </section>
      )}


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
              <ContentCard
                key={recipe.id}
                type="RECIPE"
                title={recipe.title}
                slug={recipe.slug}
                excerpt={recipe.excerpt}
                coverImage={recipe.coverImage}
                tags={JSON.parse(recipe.tags || "[]")}
                hrefPrefix="recipes"
                reviews={recipe.reviews}
                createdAt={recipe.createdAt}
              />
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
              
              <h2 className="text-4xl md:text-5xl font-bold font-serif leading-tight text-white">
                Tailored to your body. <br/>
                <span className="text-emerald-400 italic">Designed for your life.</span>
              </h2>
              
              <p className="text-lg text-white/80 leading-relaxed font-serif max-w-2xl mx-auto">
                Get a free, science-backed meal plan personalized by Stewart Lucas and powered by advanced AI. We customize everything around your dietary restrictions, goals, and struggles.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/personalized">
                  <Button size="lg" className="px-10 py-5 rounded-2xl !bg-emerald-600 hover:!bg-emerald-700 !text-white font-bold transition-all shadow-xl shadow-emerald-500/20 active:scale-98 cursor-pointer border-none">
                    Get Your Free Personalized Meal Plan
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" size="lg" className="px-10 py-5 rounded-2xl !border-white/30 !text-white !bg-transparent hover:!bg-white/10 font-bold transition-all cursor-pointer">
                    How It Works
                  </Button>
                </a>
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

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-surface border-t border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block">Process</span>
            <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">How It Works</h2>
            <p className="text-text-muted font-serif italic text-lg max-w-2xl mx-auto">
              Get a custom-tailored nutrition protocol in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="relative p-8 bg-white rounded-[2.5rem] border border-border shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-text mb-4 font-serif">1. Share Your Profile</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Take a quick 60-second assessment. Tell us about your primary health goals, dietary choices, daily schedule, and weight management hurdles.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-8 bg-white rounded-[2.5rem] border border-border shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold text-xl mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-text mb-4 font-serif">2. Custom Calibration</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Our science-backed AI engine calculates your tailored calorie and macro targets using algorithms calibrated by Certified Nutritionists.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-8 bg-white rounded-[2.5rem] border border-border shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xl mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-text mb-4 font-serif">3. Deploy Plan</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Unlock your interactive, easy-prep dashboard instantly and get a premium, printable 7-day meal plan PDF sent directly to your inbox.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/personalized">
              <Button size="lg" className="px-10 py-5 rounded-2xl shadow-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition border-none">
                Start My Assessment Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story / About CTA */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[600px] rounded-[3rem] overflow-hidden cinematic-shadow">
              <Image 
                src="/assets/hero.webp" 
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
                "I believe that good food shouldn't be complicated or expensive. NutriGuide by Stewart Lucas is born from a passion for home cooking that celebrates real ingredients and memorable moments around the table."
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

      {/* Email Capture Section */}
      <section className="py-16 px-4 bg-slate-950 text-white border-t border-white/10">
        <EmailCaptureForm
          source="homepage"
          heading="Download the Anti-Inflammatory Meal Prep & Grocery Guide (PDF)"
          subheading="Get Stewart's science-backed 7-day anti-inflammatory diet plan, kitchen hacks, and printable grocery checklist sent directly to your inbox."
          buttonText="Download Free Guide (PDF)"
          freebie="anti-inflammatory-grocery-list"
        />
      </section>
    </div>
    </>
  );
}

