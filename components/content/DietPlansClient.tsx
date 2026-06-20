"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { uploadsLoader } from "@/lib/image-loader";

interface DietPlansClientProps {
  list: any[];
}

export function DietPlansClient({ list }: DietPlansClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const [featuredImgError, setFeaturedImgError] = useState(false);
  const [featuredRetryWithoutLoader, setFeaturedRetryWithoutLoader] = useState(false);

  const [gridImgErrors, setGridImgErrors] = useState<Record<string, boolean>>({});
  const [gridRetryWithoutLoader, setGridRetryWithoutLoader] = useState<Record<string, boolean>>({});

  // Categories definition
  const categories = [
    { id: "all", label: "All" },
    { id: "condition", label: "Condition-Specific" },
    { id: "weight", label: "Weight Loss" },
    { id: "performance", label: "Performance" },
    { id: "plant", label: "Plant-Based" }
  ];

  // Helper to format tags nicely
  const formatTag = (tag: string) => {
    return tag
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Tag color coding logic
  const getTagColor = (tag: string) => {
    const t = tag.toLowerCase().trim();
    // Teal = free-from
    if (
      t === "soy-free" || t === "soy free" ||
      t === "gluten-free" || t === "gluten free" ||
      t === "dairy-free" || t === "dairy free" ||
      t === "egg-free" || t === "egg free" ||
      t === "nut-free" || t === "nut free" ||
      t === "low-oxalate" || t === "low oxalate"
    ) {
      return "bg-teal-500/10 text-teal-700 border border-teal-200/40";
    }
    // Amber = style
    if (
      t === "keto" || t === "low-carb" || t === "low carb" ||
      t === "paleo" || t === "carnivore" || t === "deficit" ||
      t.includes("calorie") || t.includes("calories") ||
      t === "budget" || t.includes("budget-meal-plan") ||
      t.includes("muscle-building") || t.includes("muscle building") ||
      t.includes("clean-eating") || t.includes("clean eating") ||
      t.includes("meal-prep") || t.includes("meal prep") ||
      t.includes("protein-cycling") || t.includes("protein cycling")
    ) {
      return "bg-amber-500/10 text-amber-700 border border-amber-200/40";
    }
    // Purple = condition-specific
    if (
      t === "pcos" || t.includes("hormone-balance") || t.includes("hormone balance") ||
      t.includes("kidney-health") || t.includes("kidney health") ||
      t.includes("anti-inflammatory") || t.includes("anti inflammatory") ||
      t.includes("adrenal-fatigue") || t.includes("adrenal fatigue") ||
      t.includes("endometriosis") || t.includes("thyroid-health") || t.includes("thyroid health") ||
      t.includes("gut-health") || t.includes("gut health") ||
      t.includes("sleep-optimization") || t.includes("sleep optimization") ||
      t === "menopause" || t.includes("metabolic-health") || t.includes("metabolic health") ||
      t.includes("heart-health") || t.includes("heart health") ||
      t.includes("joint-health") || t.includes("joint health") ||
      t === "liver" || t.includes("fatty-liver") || t.includes("fatty liver") ||
      t === "candida" || t.includes("renal")
    ) {
      return "bg-purple-500/10 text-purple-700 border border-purple-200/40";
    }
    return "bg-gray-500/10 text-gray-700 border border-gray-200/40";
  };

  // Filter categorization logic
  const matchesCategory = (plan: any, catId: string) => {
    if (catId === "all") return true;
    
    let planTags: string[] = [];
    try {
      planTags = typeof plan.tags === 'string' ? JSON.parse(plan.tags) : plan.tags || [];
    } catch {
      planTags = [];
    }
    planTags = planTags.map(t => t.toLowerCase());

    const titleLower = plan.title.toLowerCase();
    const excerptLower = (plan.excerpt || "").toLowerCase();

    if (catId === "condition") {
      const conditionTerms = [
        "pcos", "hormone-balance", "hormone balance", "kidney-health", "kidney health", "renal",
        "anti-inflammatory", "anti inflammatory", "adrenal-fatigue", "adrenal fatigue",
        "endometriosis", "thyroid-health", "thyroid health", "gut-health", "gut health",
        "sleep-optimization", "sleep optimization", "menopause", "metabolic-health", "metabolic health",
        "heart-health", "heart health", "joint-health", "joint health", "liver", "fatty-liver", "fatty liver",
        "candida", "oxalate"
      ];
      return planTags.some(t => conditionTerms.some(term => t.includes(term))) ||
             conditionTerms.some(term => titleLower.includes(term) || excerptLower.includes(term));
    }

    if (catId === "weight") {
      const weightTerms = ["weight-loss", "weight loss", "deficit", "calorie", "calories", "low-carb", "low carb", "keto", "belly-fat", "belly fat"];
      return planTags.some(t => weightTerms.some(term => t.includes(term))) ||
             weightTerms.some(term => titleLower.includes(term) || excerptLower.includes(term));
    }

    if (catId === "performance") {
      const performanceTerms = ["muscle-building", "muscle building", "endurance-athlete", "endurance athlete", "athletic-fuel", "athletic fuel", "testosterone-boost", "testosterone boost", "recovery", "performance", "athlete", "testosterone"];
      return planTags.some(t => performanceTerms.some(term => t.includes(term))) ||
             performanceTerms.some(term => titleLower.includes(term) || excerptLower.includes(term));
    }

    if (catId === "plant") {
      const plantTerms = ["vegan", "vegetarian", "plant-based", "plant based"];
      return planTags.some(t => plantTerms.some(term => t.includes(term))) ||
             plantTerms.some(term => titleLower.includes(term) || excerptLower.includes(term));
    }

    return false;
  };

  // Search matching logic with hyphen tolerance
  const matchesSearch = (plan: any, query: string) => {
    if (!query) return true;
    const q = query.toLowerCase().trim().replace(/[^a-z0-9 ]/g, " ");
    
    let planTags: string[] = [];
    try {
      planTags = typeof plan.tags === 'string' ? JSON.parse(plan.tags) : plan.tags || [];
    } catch {
      planTags = [];
    }
    
    const normalizedTitle = plan.title.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
    const normalizedExcerpt = (plan.excerpt || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ");
    const tagsMatch = planTags.some(t => t.toLowerCase().replace(/[^a-z0-9 ]/g, " ").includes(q));
    
    return normalizedTitle.includes(q) || normalizedExcerpt.includes(q) || tagsMatch;
  };

  // Extract featured plan (7-Day Soy-Free Meal Plan)
  const featuredPlan = useMemo(() => {
    return list.find(p => p.slug === "7-day-soy-free-meal-plan");
  }, [list]);

  // Filter plans list (exclude featured from grid if displayed as hero)
  const filteredPlans = useMemo(() => {
    let result = list;
    
    // Filter by category
    result = result.filter(plan => matchesCategory(plan, selectedCategory));
    
    // Filter by search query
    result = result.filter(plan => matchesSearch(plan, searchQuery));

    // Hide featured plan from grid if displayed in featured hero block
    if (searchQuery === "" && selectedCategory === "all" && featuredPlan) {
      result = result.filter(plan => plan.id !== featuredPlan.id);
    }
    
    return result;
  }, [list, selectedCategory, searchQuery, featuredPlan]);

  const showFeaturedHero = searchQuery === "" && selectedCategory === "all" && featuredPlan;

  const faqItems = [
    {
      question: "How do I select the best diet plan for my goals?",
      answer: "If you're managing insulin resistance or hormone-related fatigue, start with our PCOS or Low-Glycemic plans. For recovery, check out the Post-Workout Recovery or Sleep Optimization plans. If your primary goal is body composition, choose from our high-protein or calorie deficit blueprints."
    },
    {
      question: "Are these plans fully plant-based?",
      answer: "We offer dedicated Vegan and Vegetarian resets (such as our 7-Day Soy-Free Meal Plan and clean-eating plans). Other plans focus on clean, whole foods with high-quality animal proteins, but they can easily be customized to fit your preferences."
    },
    {
      question: "How do I download the full guide?",
      answer: "Every diet plan page features detailed, daily meal protocols. For print-friendly layouts, grocery shopping lists, and meal prep instructions, you can access the downloadable PDF version directly on the respective plan page."
    },
    {
      question: "Can I customize the portion sizes?",
      answer: "Yes. All recipes within our plans support dynamic serving size scaling (1x, 2x, 3x), which automatically updates the ingredient quantities and macronutrient values to fit your daily needs."
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#FAF9F6]">
      {/* Clean Brand-Aligned Hero with value proposition */}
      <section className="w-full bg-[#F5F5DC]/45 border-b border-[#E0D4C3] py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs uppercase tracking-widest font-extrabold text-[#B35412] mb-3 block">
            NutriGuide Protocols
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-serif text-[#2C1E11] tracking-tight leading-[1.2]">
            Science-Backed Diet Plans
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#5D4037] max-w-2xl mx-auto leading-relaxed">
            Expert-curated diet plans designed to balance hormones, optimize gut health, build muscle, and accelerate recovery. Simple home cooking, no guesswork.
          </p>

          {/* Search Bar at Top */}
          <div className="mt-8 max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5D4037]/60 group-focus-within:text-[#B35412] transition-colors duration-300">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search "soy free", "keto", "fatty liver"...'
              className="block w-full pl-12 pr-10 py-3.5 border border-[#E0D4C3] bg-white text-[#2C1E11] shadow-sm focus:outline-none focus:ring-1 focus:ring-[#B35412] focus:border-[#B35412] text-base transition-all duration-300 rounded-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#5D4037]/60 hover:text-[#2C1E11]"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Categories Filter Pills */}
      <section className="w-full bg-[#FAF9F6] border-b border-[#E0D4C3]/40 py-5 sticky top-[0px] z-20 backdrop-blur-md bg-[#FAF9F6]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2 text-xs font-bold tracking-wide uppercase transition-all duration-300 rounded-none border ${
                  selectedCategory === cat.id
                    ? "bg-[#B35412] text-white border-[#B35412]"
                    : "bg-white text-[#5D4037] border-[#E0D4C3] hover:bg-[#FAF9F6] hover:text-[#2C1E11]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="w-full py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Featured Plan Hero Card */}
          {showFeaturedHero && featuredPlan && (
            <div className="mb-16">
              <span className="text-xs uppercase tracking-widest font-extrabold text-[#B35412] mb-4 block">
                Featured Meal Protocol
              </span>
              <Link href={`/diet-plan/${featuredPlan.slug}`} className="block group">
                <div className="flex flex-col lg:flex-row bg-white border border-[#E0D4C3] overflow-hidden hover:shadow-2xl transition-all duration-500 rounded-none">
                  {/* Image Block */}
                  <div className="relative w-full lg:w-1/2 h-64 sm:h-80 md:h-[380px] bg-[#FAF9F6]">
                    {(featuredPlan.coverImage && !featuredImgError) ? (
                      <Image
                        src={featuredPlan.coverImage}
                        alt={featuredPlan.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-103"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        onError={() => {
                          const isLocal = featuredPlan.coverImage.startsWith('/uploads/images/') && featuredPlan.coverImage.endsWith('.webp');
                          if (isLocal && !featuredRetryWithoutLoader) {
                            setFeaturedRetryWithoutLoader(true);
                          } else {
                            setFeaturedImgError(true);
                          }
                        }}
                        loader={featuredPlan.coverImage.startsWith('/uploads/images/') && featuredPlan.coverImage.endsWith('.webp') && !featuredRetryWithoutLoader ? uploadsLoader : undefined}
                        unoptimized={(!featuredPlan.coverImage.startsWith('/uploads/images/') || featuredRetryWithoutLoader) && featuredPlan.coverImage.startsWith('/uploads')}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[#5D4037]/30">
                        <span className="text-lg font-serif italic">Diet Plan</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#B35412] text-white text-[11px] font-bold px-4 py-1.5 shadow-lg tracking-wide uppercase border-none">
                        Most Popular
                      </span>
                    </div>
                  </div>

                  {/* Info Block */}
                  <div className="p-8 lg:p-12 w-full lg:w-1/2 flex flex-col justify-center bg-white">
                    <span className="text-xs font-semibold text-[#5D4037] tracking-wider uppercase mb-3">
                      By Stewart Lucas • 7-Day Protocol
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#2C1E11] group-hover:text-[#B35412] transition-colors leading-tight mb-4">
                      {featuredPlan.title}
                    </h2>
                    <p className="text-[#5D4037] text-sm sm:text-base mb-6 leading-relaxed italic">
                      {featuredPlan.excerpt}
                    </p>

                    {/* Colored Diet Tags */}
                    {(() => {
                      let planTags: string[] = [];
                      try {
                        planTags = typeof featuredPlan.tags === "string" ? JSON.parse(featuredPlan.tags) : featuredPlan.tags || [];
                      } catch {
                        planTags = [];
                      }
                      if (planTags.length === 0) return null;
                      return (
                        <div className="flex flex-wrap gap-2 mb-8">
                          {planTags.map((t: string) => (
                            <span
                              key={t}
                              className={`text-[11px] font-bold px-3 py-1 uppercase tracking-wider border-none ${getTagColor(t)}`}
                            >
                              {formatTag(t)}
                            </span>
                          ))}
                        </div>
                      );
                    })()}

                    <div>
                      <span className="text-[#8B0000] font-bold text-sm flex items-center group-hover:translate-x-1.5 transition-transform duration-300">
                        Explore Plan Details <span className="ml-2">→</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Grid of Other Plans */}
          <div>
            {showFeaturedHero && (
              <span className="text-xs uppercase tracking-widest font-extrabold text-[#5D4037] mb-8 block">
                All Diet Plans
              </span>
            )}
            
            {filteredPlans.length === 0 ? (
              <div className="text-center py-20 bg-white border border-[#E0D4C3]">
                <p className="text-[#5D4037] text-lg font-serif italic">
                  No diet plans match your search or filter. Try another keyword!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPlans.map((plan) => (
                  <Link
                    key={plan.id}
                    href={`/diet-plan/${plan.slug}`}
                    className="block group h-full"
                  >
                    <div className="h-full flex flex-col transition-all duration-500 hover:-translate-y-2 bg-white border border-[#E0D4C3] overflow-hidden hover:shadow-xl rounded-none">
                      {/* Image Block */}
                      <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-[#FAF9F6]">
                        {(plan.coverImage && !gridImgErrors[plan.id]) ? (
                          <Image
                            src={plan.coverImage}
                            alt={plan.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-103"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={() => {
                              const isLocal = plan.coverImage.startsWith('/uploads/images/') && plan.coverImage.endsWith('.webp');
                              if (isLocal && !gridRetryWithoutLoader[plan.id]) {
                                setGridRetryWithoutLoader(prev => ({ ...prev, [plan.id]: true }));
                              } else {
                                setGridImgErrors(prev => ({ ...prev, [plan.id]: true }));
                              }
                            }}
                            loader={plan.coverImage.startsWith('/uploads/images/') && plan.coverImage.endsWith('.webp') && !gridRetryWithoutLoader[plan.id] ? uploadsLoader : undefined}
                            unoptimized={(!plan.coverImage.startsWith('/uploads/images/') || gridRetryWithoutLoader[plan.id]) && plan.coverImage.startsWith('/uploads')}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[#5D4037]/30">
                            <span className="text-sm font-serif italic">Diet Plan</span>
                          </div>
                        )}
                      </div>

                      {/* Info Block */}
                      <div className="p-6 flex flex-col flex-grow bg-white">
                        <span className="text-[10px] font-semibold text-[#5D4037] tracking-wider uppercase mb-2 block">
                          By Stewart Lucas • 7-Day Protocol
                        </span>
                        
                        <h3 className="text-lg sm:text-xl font-bold font-serif text-[#2C1E11] mb-3 group-hover:text-[#B35412] transition-colors line-clamp-2 leading-snug">
                          {plan.title}
                        </h3>
                        
                        <p className="text-[#5D4037] text-xs sm:text-sm line-clamp-2 mb-4 flex-grow leading-relaxed italic">
                          {plan.excerpt}
                        </p>

                        {/* Colored Diet Tags */}
                        {(() => {
                          let planTags: string[] = [];
                          try {
                            planTags = typeof plan.tags === "string" ? JSON.parse(plan.tags) : plan.tags || [];
                          } catch {
                            planTags = [];
                          }
                          if (planTags.length === 0) return null;
                          return (
                            <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-[#E0D4C3]/40">
                              {planTags.slice(0, 3).map((t: string) => (
                                <span
                                  key={t}
                                  className={`text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider border-none ${getTagColor(t)}`}
                                >
                                  {formatTag(t)}
                                </span>
                              ))}
                              {planTags.length > 3 && (
                                <span className="text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider text-[#5D4037] bg-[#E0D4C3]/30 border border-none">
                                  +{planTags.length - 3} More
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Expandable FAQ SEO Accordion below the fold */}
          <div className="mt-24 border-t border-[#E0D4C3] pt-16 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold font-serif text-[#2C1E11] tracking-tight">
                Choosing the Right Nutrition Protocol
              </h2>
              <p className="mt-3 text-[#5D4037] text-sm sm:text-base">
                Find answers to common questions about selecting and starting our 7-Day meal plans.
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="border border-[#E0D4C3] bg-white transition-all duration-300"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-5 text-left text-base sm:text-lg font-bold font-serif text-[#2C1E11] focus:outline-none transition-colors duration-200 hover:bg-[#FAF9F6]"
                    >
                      <span>{faq.question}</span>
                      <span className="ml-4 flex-shrink-0 text-[#5D4037]/60 transition-transform duration-300">
                        {isOpen ? (
                          <svg className="h-5 w-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </span>
                    </button>
                    
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-[500px] border-t border-[#E0D4C3]/60" : "max-h-0"
                      }`}
                    >
                      <div className="p-5 text-sm sm:text-base text-[#5D4037] leading-relaxed bg-[#FAF9F6]">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
